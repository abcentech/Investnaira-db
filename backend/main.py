"""
InvestNaira Backend API
=======================
FastAPI server with JWT auth, client data, admin upload.

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
import uvicorn

from auth import create_token, verify_token, hash_password, check_password, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
from database import db
from models import LoginRequest, AdminLoginRequest, ClientSummary, UploadResponse, PlatformStats
from parser import parse_upload

import logging, os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("investnaira")

# ── APP ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="InvestNaira API",
    description="Backend API for InvestNaira client portal and admin panel",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────
# Allow the marketing site, the app subdomain, and localhost for dev
ALLOWED_ORIGINS = [
    "https://investnaira.ng",
    "https://www.investnaira.ng",
    "https://app.investnaira.ng",
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080",
    "null",  # file:// origin for local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AUTH HELPERS ──────────────────────────────────────────────────────
security = HTTPBearer()

def get_current_client(creds: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT and return the client's email."""
    payload = verify_token(creds.credentials)
    if not payload or payload.get("role") != "client":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    email = payload.get("sub")
    client = db.get_client(email)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

def get_current_admin(creds: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT admin role."""
    payload = verify_token(creds.credentials)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload

# ── PUBLIC ENDPOINTS ─────────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "InvestNaira API", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health():
    client_count = db.count_clients()
    return {"status": "ok", "clients": client_count}


# ── AUTH ──────────────────────────────────────────────────────────────

@app.post("/api/auth/login")
def client_login(body: LoginRequest):
    """
    Client login: email + first name (case-insensitive).
    Returns JWT token valid for 24 hours.
    """
    email = body.email.strip().lower()
    password = body.password.strip()

    client = db.get_client(email)
    if not client:
        # Generic error — don't reveal whether email exists
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Password = client's first name (case-insensitive)
    expected = client["fn"].strip().lower()
    if password.lower() != expected:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": email, "role": "client", "name": client["fn"]})
    logger.info(f"Client login: {email}")
    return {
        "token": token,
        "client": {
            "email": email,
            "fn": client["fn"],
            "ln": client["ln"],
            "rank": client.get("rank", 0),
        }
    }


@app.post("/api/auth/admin")
def admin_login(body: AdminLoginRequest):
    """Admin login with email + password."""
    if body.email.strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not check_password(body.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": body.email, "role": "admin"}, expires_hours=8)
    logger.info("Admin login")
    return {"token": token}


@app.post("/api/auth/logout")
def logout():
    """Client-side logout — just confirms token should be cleared."""
    return {"message": "Logged out"}


# ── CLIENT ENDPOINTS ─────────────────────────────────────────────────

@app.get("/api/me")
def get_my_profile(client: dict = Depends(get_current_client)):
    """Return the authenticated client's full profile and data."""
    # Strip out things we don't want to send to the client
    safe = {k: v for k, v in client.items() if k not in ("password",)}
    return safe


@app.get("/api/me/transactions")
def get_my_transactions(
    page: int = 1,
    per_page: int = 30,
    filter: str = "all",  # all | credit | debit
    client: dict = Depends(get_current_client)
):
    """Paginated, filterable transaction history for the authenticated client."""
    txns = client.get("transactions", [])

    if filter == "credit":
        txns = [t for t in txns if t.get("is_credit")]
    elif filter == "debit":
        txns = [t for t in txns if not t.get("is_credit")]

    total = len(txns)
    start = (page - 1) * per_page
    end = start + per_page
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, -(-total // per_page)),  # ceiling division
        "transactions": txns[start:end]
    }


@app.get("/api/me/summary")
def get_my_summary(client: dict = Depends(get_current_client)):
    """Lightweight summary — used for topbar/sidebar display."""
    return {
        "email": client["email"],
        "fn": client["fn"],
        "ln": client["ln"],
        "assets": client["assets"],
        "deposits": client["deposits"],
        "returns": client["returns"],
        "withdrawals": client["withdrawals"],
        "rank": client.get("rank", 0),
        "since": client.get("since", ""),
        "tx_count": client.get("tx_count", 0),
    }


# ── ADMIN ENDPOINTS ───────────────────────────────────────────────────

@app.get("/api/admin/stats")
def get_platform_stats(_: dict = Depends(get_current_admin)):
    """Platform-wide statistics for the admin dashboard."""
    all_clients = db.get_all_clients()
    total_assets = sum(c["assets"] for c in all_clients)
    total_deposits = sum(c["deposits"] for c in all_clients)
    total_returns = sum(c["returns"] for c in all_clients)
    total_withdrawals = sum(c["withdrawals"] for c in all_clients)
    total_txns = sum(c.get("tx_count", 0) for c in all_clients)
    active_clients = sum(1 for c in all_clients if c.get("active", True))

    top_clients = sorted(all_clients, key=lambda x: x["assets"], reverse=True)[:10]

    return {
        "client_count": len(all_clients),
        "active_clients": active_clients,
        "total_assets": round(total_assets, 2),
        "total_deposits": round(total_deposits, 2),
        "total_returns": round(total_returns, 2),
        "total_withdrawals": round(total_withdrawals, 2),
        "total_transactions": total_txns,
        "top_clients": [
            {
                "email": c["email"], "fn": c["fn"], "ln": c["ln"],
                "assets": c["assets"], "rank": c.get("rank", 0),
                "tx_count": c.get("tx_count", 0)
            }
            for c in top_clients
        ]
    }


@app.get("/api/admin/clients")
def list_clients(
    page: int = 1,
    per_page: int = 50,
    search: str = "",
    sort: str = "assets",  # assets | name | tx_count | since
    order: str = "desc",
    _: dict = Depends(get_current_admin)
):
    """Paginated, searchable, sortable client list for admin."""
    all_clients = db.get_all_clients()

    # Search by name, email, phone
    if search:
        q = search.lower()
        all_clients = [
            c for c in all_clients
            if q in c.get("email","").lower()
            or q in c.get("fn","").lower()
            or q in c.get("ln","").lower()
            or q in c.get("phone","").lower()
        ]

    # Sort
    reverse = order == "desc"
    if sort == "name":
        all_clients.sort(key=lambda x: (x.get("fn","") + x.get("ln","")).lower(), reverse=reverse)
    elif sort == "tx_count":
        all_clients.sort(key=lambda x: x.get("tx_count", 0), reverse=reverse)
    elif sort == "since":
        all_clients.sort(key=lambda x: x.get("since",""), reverse=reverse)
    else:  # assets (default)
        all_clients.sort(key=lambda x: x.get("assets", 0), reverse=reverse)

    total = len(all_clients)
    start = (page - 1) * per_page
    end = start + per_page

    # Return slim summary for list view (not full transaction history)
    slim = []
    for c in all_clients[start:end]:
        slim.append({
            "email": c["email"], "fn": c["fn"], "ln": c["ln"],
            "phone": c.get("phone",""), "assets": c["assets"],
            "deposits": c["deposits"], "returns": c["returns"],
            "withdrawals": c["withdrawals"], "rank": c.get("rank",0),
            "tx_count": c.get("tx_count",0), "since": c.get("since",""),
            "last": c.get("last",""), "active": c.get("active", True),
        })

    return {
        "total": total, "page": page, "per_page": per_page,
        "pages": max(1, -(-total // per_page)),
        "clients": slim
    }


@app.get("/api/admin/clients/{email:path}")
def get_client_detail(email: str, _: dict = Depends(get_current_admin)):
    """Full client detail including all transactions and analytics."""
    client = db.get_client(email.lower())
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@app.put("/api/admin/clients/{email:path}")
def update_client(email: str, updates: dict, _: dict = Depends(get_current_admin)):
    """Update editable client fields (phone, active status, notes)."""
    allowed = {"phone", "active", "notes", "fn", "ln"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed}
    if not safe_updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    updated = db.update_client(email.lower(), safe_updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Client not found")
    logger.info(f"Admin updated client: {email} — fields: {list(safe_updates.keys())}")
    return {"message": "Client updated", "email": email}



@app.post("/api/admin/clients/{email:path}/transactions")
def add_transaction(email: str, tx: dict, _: dict = Depends(get_current_admin)):
    """Add a new transaction to a client. Body: {type, amount, date, status, note}"""
    from datetime import date as dt_date
    from parser import build_monthly, build_yearly

    email = email.lower()
    client = db.get_client(email)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    tx_type  = str(tx.get("type","")).strip()
    amount   = float(tx.get("amount", 0))
    date_str = str(tx.get("date","")) or dt_date.today().isoformat()
    status   = str(tx.get("status","Completed")).strip()
    note     = str(tx.get("note","")).strip()

    if not tx_type:
        raise HTTPException(status_code=400, detail="Transaction type is required")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    tl = tx_type.lower()
    is_return  = "return" in tl
    is_credit  = is_return or any(x in tl for x in ["deposit","credit","referral","yield","bonus"])
    is_debit   = any(x in tl for x in ["withdrawal","debit"])

    existing_sns = [int(t["sn"]) for t in client["transactions"] if str(t.get("sn","")).isdigit()]
    new_sn = str(max(existing_sns) + 1) if existing_sns else "10001"

    new_tx = {
        "sn": new_sn, "date": date_str, "amount": round(amount, 2),
        "type": tx_type, "status": status, "note": note,
        "is_credit": is_credit, "added_by_admin": True,
    }

    txns = [new_tx] + client["transactions"]

    deps = client["deposits"]; wds = client["withdrawals"]; rets = client["returns"]
    if is_credit:   deps = round(deps + amount, 2)
    elif is_return: rets = round(rets + amount, 2)
    elif is_debit:  wds  = round(wds + amount, 2)
    assets = round(deps + rets - wds, 2)

    db.update_client(email, {
        "transactions": txns, "deposits": deps, "withdrawals": wds,
        "returns": rets, "assets": assets, "tx_count": len(txns),
        "monthly": build_monthly(txns), "yearly": build_yearly(txns),
    })
    db.rerank()
    logger.info(f"Admin added {tx_type} N{amount:,.2f} to {email}")
    return {"message": "Transaction added", "transaction": new_tx, "new_assets": assets}


@app.put("/api/admin/clients/{email:path}/transactions/{sn}")
def edit_transaction(email: str, sn: str, updates: dict, _: dict = Depends(get_current_admin)):
    """Edit an existing transaction by SN. Editable: type, amount, date, status, note"""
    from parser import build_monthly, build_yearly

    email = email.lower()
    client = db.get_client(email)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    txns = client.get("transactions", [])
    tx_idx = next((i for i, t in enumerate(txns) if str(t.get("sn","")) == str(sn)), None)
    if tx_idx is None:
        raise HTTPException(status_code=404, detail=f"Transaction SN {sn} not found")

    for field in ("type", "amount", "date", "status", "note"):
        if field in updates and updates[field] is not None:
            txns[tx_idx][field] = round(float(updates[field]), 2) if field == "amount" else str(updates[field]).strip()

    tl = txns[tx_idx]["type"].lower()
    txns[tx_idx]["is_credit"] = any(x in tl for x in ["deposit","credit","referral","yield","return","bonus"])
    txns[tx_idx]["edited_by_admin"] = True

    deps = wds = rets = 0.0
    for t in txns:
        tl2 = t.get("type","").lower(); amt = float(t.get("amount", 0))
        if "return" in tl2:                                            rets += amt
        elif any(x in tl2 for x in ["deposit","credit","referral","yield","bonus"]): deps += amt
        elif any(x in tl2 for x in ["withdrawal","debit"]):           wds  += amt

    db.update_client(email, {
        "transactions": txns, "deposits": round(deps,2), "withdrawals": round(wds,2),
        "returns": round(rets,2), "assets": round(deps+rets-wds,2),
        "tx_count": len(txns), "monthly": build_monthly(txns), "yearly": build_yearly(txns),
    })
    db.rerank()
    logger.info(f"Admin edited SN {sn} for {email}")
    return {"message": "Transaction updated", "sn": sn}


@app.delete("/api/admin/clients/{email:path}/transactions/{sn}")
def delete_transaction(email: str, sn: str, _: dict = Depends(get_current_admin)):
    """Delete a transaction by SN and recompute client aggregates."""
    from parser import build_monthly, build_yearly

    email = email.lower()
    client = db.get_client(email)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    txns = client.get("transactions", [])
    new_txns = [t for t in txns if str(t.get("sn","")) != str(sn)]
    if len(new_txns) == len(txns):
        raise HTTPException(status_code=404, detail=f"Transaction SN {sn} not found")

    deps = wds = rets = 0.0
    for t in new_txns:
        tl = t.get("type","").lower(); amt = float(t.get("amount",0))
        if "return" in tl:                                             rets += amt
        elif any(x in tl for x in ["deposit","credit","referral","yield","bonus"]): deps += amt
        elif any(x in tl for x in ["withdrawal","debit"]):            wds  += amt

    db.update_client(email, {
        "transactions": new_txns, "deposits": round(deps,2), "withdrawals": round(wds,2),
        "returns": round(rets,2), "assets": round(deps+rets-wds,2),
        "tx_count": len(new_txns), "monthly": build_monthly(new_txns), "yearly": build_yearly(new_txns),
    })
    db.rerank()
    logger.info(f"Admin deleted SN {sn} for {email}")
    return {"message": "Transaction deleted", "sn": sn}


@app.post("/api/admin/upload")
async def upload_database(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_admin)
):
    """
    Upload a new TSV or XLSX transaction database.
    Parses the file, rebuilds all client records, saves to clients.json.
    The frontend polls /api/health to confirm completion.
    """
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in ("tsv", "xlsx", "xls", "csv"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext}. Upload a .tsv, .csv, or .xlsx file."
        )

    contents = await file.read()
    logger.info(f"Upload received: {filename} ({len(contents)//1024}KB)")

    try:
        result = parse_upload(contents, ext)
        logger.info(f"Upload parsed: {result['client_count']} clients, {result['tx_count']} transactions")
        return UploadResponse(
            success=True,
            message=f"Database updated successfully.",
            client_count=result["client_count"],
            tx_count=result["tx_count"],
            filename=filename,
        )
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)}")


# ── ENTRY POINT ───────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
