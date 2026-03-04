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
        """Replace entire database — called after successful upload parse."""
        with self._lock:
            # Preserve manual edits (active status, notes, phone overrides)
            for email, new_client in new_data.items():
                existing = self._data.get(email.lower())
                if existing:
                    # Keep manual fields that aren't in the transaction data
                    for field in ("active", "notes"):
                        if field in existing:
                            new_client[field] = existing[field]
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
