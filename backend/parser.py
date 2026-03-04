"""
parser.py — Converts uploaded TSV/XLSX into the clients.json database format.
Called by the /api/admin/upload endpoint.

Supports:
  - .tsv  (tab-separated, the current IN_Db format)
  - .csv  (comma-separated)
  - .xlsx / .xls (Excel)

Expected columns (flexible — identified by position or header name):
  sn | hash | email | first_name | last_name | phone | date | amount | type | status | hash2 | note
"""

import csv, io, json, re
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Optional
from database import db

DATA_DIR = Path(__file__).parent / "data"


# ── DATE PARSER ──────────────────────────────────────────────────────

def parse_date(d: str) -> Optional[datetime]:
    if not d: return None
    d = d.strip()
    # ISO format: 2021-01-07T00:29:49.000Z
    if 'T' in d:
        try: return datetime.fromisoformat(d.replace('.000Z','').replace('Z',''))
        except: pass
    # Month Day: "Jan 7", "Mar 4"
    parts = d.split()
    if len(parts) == 2:
        for fmt in ('%b %d %Y', '%B %d %Y'):
            try: return datetime.strptime(d + ' 2025', fmt)
            except: pass
    # Date only: 2021-01-07
    try: return datetime.strptime(d, '%Y-%m-%d')
    except: pass
    return None


# ── TRANSACTION CLASSIFIER ────────────────────────────────────────────

def classify(tx_type: str) -> str:
    """Returns 'credit', 'return', or 'debit'."""
    tl = tx_type.lower()
    if 'return' in tl: return 'return'
    if any(x in tl for x in ['deposit', 'credit', 'referral', 'yield', 'bonus']): return 'credit'
    if any(x in tl for x in ['withdrawal', 'debit']): return 'debit'
    return 'other'


# ── ANALYTICS BUILDERS ────────────────────────────────────────────────

def build_monthly(txns):
    monthly = defaultdict(lambda: {'deposits': 0, 'withdrawals': 0, 'returns': 0})
    for t in txns:
        d = parse_date(t['date'])
        if not d: continue
        k = "{}-{:02d}".format(d.year, d.month)
        cls = classify(t['type'])
        if cls in ('credit',): monthly[k]['deposits'] += t['amount']
        elif cls == 'return': monthly[k]['returns'] += t['amount']
        elif cls == 'debit': monthly[k]['withdrawals'] += t['amount']

    cum = 0
    result = []
    for k in sorted(monthly.keys()):
        cum += monthly[k]['deposits'] + monthly[k]['returns'] - monthly[k]['withdrawals']
        yr, mo = k.split('-')
        result.append({
            'key': k,
            'label': datetime(int(yr), int(mo), 1).strftime('%b %Y'),
            'balance': round(cum, 2),
            'deposits': round(monthly[k]['deposits'], 2),
            'withdrawals': round(monthly[k]['withdrawals'], 2),
            'returns': round(monthly[k]['returns'], 2),
        })
    return result


def build_yearly(txns):
    yearly = defaultdict(lambda: {'deposits': 0, 'withdrawals': 0, 'returns': 0})
    for t in txns:
        d = parse_date(t['date'])
        if not d: continue
        yr = str(d.year)
        cls = classify(t['type'])
        if cls == 'credit': yearly[yr]['deposits'] += t['amount']
        elif cls == 'return': yearly[yr]['returns'] += t['amount']
        elif cls == 'debit': yearly[yr]['withdrawals'] += t['amount']
    return [
        {'year': yr, 'deposits': round(v['deposits'], 2),
         'withdrawals': round(v['withdrawals'], 2), 'returns': round(v['returns'], 2)}
        for yr, v in sorted(yearly.items())
    ]


# ── HEADER DETECTION ─────────────────────────────────────────────────

def detect_columns(header_row: list) -> dict:
    """Map column names to indices, flexible matching."""
    idx = {}
    for i, h in enumerate(header_row):
        h = str(h).strip().lower()
        if h in ('s/n', 'sn', 'no', '#', 'id'): idx.setdefault('sn', i)
        elif 'email' in h: idx.setdefault('email', i)
        elif h in ('fn', 'first', 'firstname', 'first_name', 'first name'): idx.setdefault('fn', i)
        elif h in ('ln', 'last', 'lastname', 'last_name', 'last name'): idx.setdefault('ln', i)
        elif 'phone' in h or 'mobile' in h or 'tel' in h: idx.setdefault('phone', i)
        elif 'date' in h or 'time' in h: idx.setdefault('date', i)
        elif 'amount' in h or 'value' in h: idx.setdefault('amount', i)
        elif 'type' in h or 'description' in h or 'desc' in h: idx.setdefault('type', i)
        elif 'status' in h or 'state' in h: idx.setdefault('status', i)
        elif 'note' in h or 'memo' in h or 'ref' in h: idx.setdefault('note', i)
    return idx


# ── CORE PARSER ───────────────────────────────────────────────────────

def parse_rows(rows: list) -> dict:
    """
    Parse a list of rows (including header) into a client database dict.
    Returns the new clients dict.
    """
    if not rows:
        raise ValueError("File is empty")

    # Detect header — if first cell looks like a number it's data, not header
    first = str(rows[0][0]).strip()
    if re.match(r'^\d+$', first):
        # No header row — use positional defaults (matches IN_Db.tsv format)
        col = {'sn': 0, 'email': 2, 'fn': 3, 'ln': 4, 'phone': 5,
               'date': 6, 'amount': 7, 'type': 8, 'status': 9, 'note': 11}
        data_rows = rows
    else:
        col = detect_columns(rows[0])
        data_rows = rows[1:]
        # Fallback to positional if email column not found
        if 'email' not in col:
            col = {'sn': 0, 'email': 2, 'fn': 3, 'ln': 4, 'phone': 5,
                   'date': 6, 'amount': 7, 'type': 8, 'status': 9, 'note': 11}

    def get(row, key, default=''):
        i = col.get(key, -1)
        if i < 0 or i >= len(row): return default
        return str(row[i]).strip()

    raw_clients = defaultdict(lambda: {
        'fn': '', 'ln': '', 'phone': '', 'deposits': 0,
        'withdrawals': 0, 'returns': 0, 'transactions': []
    })

    total_tx = 0
    for row in data_rows:
        if not row or not any(str(c).strip() for c in row): continue
        email = get(row, 'email').lower()
        if not email or '@' not in email: continue
        amt_str = get(row, 'amount', '0').replace(',', '').replace(' ', '')
        try: amt = float(amt_str)
        except: continue
        if amt <= 0: continue

        fn = get(row, 'fn')
        ln = get(row, 'ln')
        phone = get(row, 'phone')
        date = get(row, 'date')
        tx_type = get(row, 'type')
        status = get(row, 'status')
        sn = get(row, 'sn')

        c = raw_clients[email]
        if fn: c['fn'] = fn
        if ln: c['ln'] = ln
        if phone: c['phone'] = phone

        cls = classify(tx_type)
        if cls == 'credit': c['deposits'] += amt
        elif cls == 'return': c['returns'] += amt
        elif cls == 'debit': c['withdrawals'] += amt

        c['transactions'].append({
            'sn': sn, 'date': date, 'amount': round(amt, 2),
            'type': tx_type, 'status': status,
            'is_credit': cls in ('credit', 'return')
        })
        total_tx += 1

    # Build full client records
    new_db = {}
    for email, d in raw_clients.items():
        assets = d['deposits'] + d['returns'] - d['withdrawals']
        dates = [parse_date(t['date']) for t in d['transactions']]
        dates = [x for x in dates if x]
        since = min(dates).strftime('%b %Y') if dates else 'N/A'
        last = max(dates).strftime('%b %Y') if dates else 'N/A'
        txns_sorted = sorted(
            d['transactions'],
            key=lambda x: (x['sn'].zfill(10) if x.get('sn') else '0'),
            reverse=True
        )
        new_db[email] = {
            'email': email, 'fn': d['fn'], 'ln': d['ln'], 'phone': d['phone'],
            'deposits': round(d['deposits'], 2),
            'withdrawals': round(d['withdrawals'], 2),
            'returns': round(d['returns'], 2),
            'assets': round(assets, 2),
            'tx_count': len(d['transactions']),
            'since': since, 'last': last,
            'monthly': build_monthly(d['transactions']),
            'yearly': build_yearly(d['transactions']),
            'transactions': txns_sorted,
            'active': True
        }

    # Rank by assets
    ranked = sorted(new_db.values(), key=lambda x: x['assets'], reverse=True)
    for i, c in enumerate(ranked):
        c['rank'] = i + 1

    return new_db, total_tx


# ── PUBLIC API ────────────────────────────────────────────────────────

def parse_upload(contents: bytes, ext: str) -> dict:
    """
    Entry point called by the upload endpoint.
    Parses bytes, updates the live database, returns summary stats.
    """
    rows = []

    if ext in ('tsv',):
        text = contents.decode('utf-8', errors='replace')
        reader = csv.reader(io.StringIO(text), delimiter='\t')
        rows = list(reader)

    elif ext == 'csv':
        text = contents.decode('utf-8', errors='replace')
        # Auto-detect delimiter
        sample = text[:2048]
        delimiter = '\t' if sample.count('\t') > sample.count(',') else ','
        reader = csv.reader(io.StringIO(text), delimiter=delimiter)
        rows = list(reader)

    elif ext in ('xlsx', 'xls'):
        # openpyxl for xlsx, xlrd for xls
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(contents), read_only=True, data_only=True)
            ws = wb.active
            rows = [[str(cell.value) if cell.value is not None else '' for cell in row] for row in ws.iter_rows()]
        except ImportError:
            raise ValueError("openpyxl not installed. Run: pip install openpyxl")

    else:
        raise ValueError(f"Unsupported file format: .{ext}")

    if not rows:
        raise ValueError("No data rows found in file")

    new_db, total_tx = parse_rows(rows)

    # Atomic update of live database
    db.replace_all(new_db)

    return {
        'client_count': len(new_db),
        'tx_count': total_tx,
    }
