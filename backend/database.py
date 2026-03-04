"""
database.py — JSON file-based client database
No SQL required. clients.json is the single source of truth.
Thread-safe for single-process deployments (standard FastAPI/uvicorn setup).
"""

import json, os, threading
from pathlib import Path
from typing import Optional, List

DATA_DIR = Path(__file__).parent / "data"
CLIENTS_FILE = DATA_DIR / "clients.json"
DATA_DIR.mkdir(exist_ok=True)


class ClientDatabase:
    """
    In-memory client store backed by clients.json.
    Loads on startup, writes through on every mutation.
    For multi-process deployments, use Redis or PostgreSQL instead.
    """

    def __init__(self):
        self._lock = threading.RLock()
        self._data: dict = {}  # email → client dict
        self._load()

    def _load(self):
        """Load clients.json into memory."""
        if CLIENTS_FILE.exists():
            with open(CLIENTS_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)
            # Normalise keys to lowercase email
            self._data = {k.lower(): v for k, v in raw.items()}
            print(f"[DB] Loaded {len(self._data)} clients from {CLIENTS_FILE}")
        else:
            self._data = {}
            print(f"[DB] No clients.json found at {CLIENTS_FILE} — starting empty")

    def _save(self):
        """Persist current in-memory state to clients.json."""
        tmp = CLIENTS_FILE.with_suffix(".tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(self._data, f, ensure_ascii=False)
        tmp.replace(CLIENTS_FILE)  # atomic rename

    def reload(self):
        """Reload from disk — called after admin upload."""
        with self._lock:
            self._load()

    # ── READ ─────────────────────────────────────────────────────────

    def get_client(self, email: str) -> Optional[dict]:
        with self._lock:
            return self._data.get(email.lower())

    def get_all_clients(self) -> List[dict]:
        with self._lock:
            return list(self._data.values())

    def count_clients(self) -> int:
        with self._lock:
            return len(self._data)

    def search_clients(self, query: str) -> List[dict]:
        q = query.lower()
        with self._lock:
            return [
                c for c in self._data.values()
                if q in c.get("email","").lower()
                or q in c.get("fn","").lower()
                or q in c.get("ln","").lower()
                or q in c.get("phone","").lower()
            ]

    # ── WRITE ─────────────────────────────────────────────────────────

    def update_client(self, email: str, updates: dict) -> bool:
        email = email.lower()
        with self._lock:
            if email not in self._data:
                return False
            self._data[email].update(updates)
            self._save()
            return True

    def replace_all(self, new_data: dict):
        """
        Merge uploaded data with existing database.
        - Preserves admin-added transactions (added_by_admin=True)
        - Preserves manual field edits (active, notes, phone)
        - Recomputes aggregates after merging
        """
        from parser import build_monthly, build_yearly

        with self._lock:
            for email, new_client in new_data.items():
                email_lower = email.lower()
                existing = self._data.get(email_lower)

                if existing:
                    # 1. Preserve manual fields
                    for field in ("active", "notes", "phone"):
                        if field in existing and existing[field]:
                            new_client[field] = existing[field]

                    # 2. Collect admin-added transactions not in the new upload
                    existing_sns = {str(t.get("sn","")) for t in new_client.get("transactions", [])}
                    admin_txns = [
                        t for t in existing.get("transactions", [])
                        if t.get("added_by_admin") and str(t.get("sn","")) not in existing_sns
                    ]

                    # 3. Merge admin transactions into new client data
                    if admin_txns:
                        merged = new_client["transactions"] + admin_txns
                        # Sort by date descending
                        def sort_key(t):
                            d = t.get("date","")
                            try:
                                from datetime import datetime
                                if 'T' in d: return datetime.fromisoformat(d.replace('Z',''))
                                return datetime.strptime(d[:10], "%Y-%m-%d")
                            except:
                                return datetime.min
                        merged.sort(key=sort_key, reverse=True)
                        new_client["transactions"] = merged

                        # Recompute aggregates including admin transactions
                        deps = wds = rets = 0.0
                        for t in merged:
                            tl = t.get("type","").lower()
                            amt = float(t.get("amount", 0))
                            if "return" in tl:                                              rets += amt
                            elif any(x in tl for x in ["deposit","credit","referral","yield","bonus"]): deps += amt
                            elif any(x in tl for x in ["withdrawal","debit"]):             wds  += amt

                        new_client["deposits"]     = round(deps, 2)
                        new_client["withdrawals"]  = round(wds, 2)
                        new_client["returns"]      = round(rets, 2)
                        new_client["assets"]       = round(deps + rets - wds, 2)
                        new_client["tx_count"]     = len(merged)
                        new_client["monthly"]      = build_monthly(merged)
                        new_client["yearly"]       = build_yearly(merged)

            self._data = {k.lower(): v for k, v in new_data.items()}
            self._save()

    def rerank(self):
        """Re-rank all clients by net assets and persist."""
        with self._lock:
            ranked = sorted(self._data.values(), key=lambda x: x.get("assets", 0), reverse=True)
            for i, c in enumerate(ranked):
                self._data[c["email"].lower()]["rank"] = i + 1
            self._save()


# Singleton instance — imported by all modules
db = ClientDatabase()
