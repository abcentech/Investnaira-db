# InvestNaira Backend API
## Deployment Guide

---

## Architecture

```
investnaira/
├── backend/
│   ├── main.py          ← FastAPI app — all routes
│   ├── auth.py          ← JWT tokens + password hashing
│   ├── database.py      ← JSON file-based client store
│   ├── parser.py        ← TSV/XLSX → client records
│   ├── models.py        ← Pydantic request/response models
│   ├── requirements.txt
│   └── data/
│       └── clients.json ← Live client database (auto-updated on upload)
│
└── frontend/
    ├── index.html       ← Marketing site (investnaira.ng)
    ├── app.js           ← Marketing site JS
    ├── portal.html      ← Client dashboard (app.investnaira.ng)
    └── admin.html       ← Admin panel (app.investnaira.ng/admin.html)
```

---

## Quick Start (Local)

```bash
cd investnaira/backend

# 1. Install Python 3.11+ then:
pip install -r requirements.txt

# 2. Run the API
uvicorn main:app --reload --port 8000

# 3. Open the frontend files in your browser:
#    portal.html  →  client dashboard
#    admin.html   →  admin panel
#
# Both auto-connect to http://localhost:8000
```

**Default admin credentials:**
- Email: `admin@investnaira.ng`
- Password: `InvestNaira2024!`

**Client credentials:**
- Email: client's email (from database)
- Password: client's first name (case-insensitive)

---

## Production Deployment (VPS / Railway / Render)

### Option A: Railway (easiest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. From the backend/ directory:
railway login
railway init
railway up

# 3. Set environment variables in Railway dashboard:
#    JWT_SECRET         = <generate a random 64-char string>
#    ADMIN_EMAIL        = admin@investnaira.ng
#    ADMIN_PASSWORD_HASH = <run: python3 -c "from auth import hash_password; print(hash_password('yourpassword'))">
```

### Option B: Ubuntu VPS

```bash
# SSH into your server
ssh user@your-server-ip

# Install Python
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip

# Clone / upload your files to /opt/investnaira
cd /opt/investnaira/backend

# Create virtualenv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export JWT_SECRET="your-very-long-random-secret-here"
export ADMIN_EMAIL="admin@investnaira.ng"
export ADMIN_PASSWORD_HASH="$(python3 -c "from auth import hash_password; print(hash_password('YourSecurePassword!'))")"
export PORT=8000

# Run with uvicorn (production)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2

# Or use systemd service (recommended for production):
```

**systemd service file** `/etc/systemd/system/investnaira.service`:
```ini
[Unit]
Description=InvestNaira API
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/investnaira/backend
Environment="JWT_SECRET=your-secret-here"
Environment="ADMIN_EMAIL=admin@investnaira.ng"
Environment="ADMIN_PASSWORD_HASH=your-hash-here"
ExecStart=/opt/investnaira/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable investnaira
sudo systemctl start investnaira
sudo systemctl status investnaira
```

### Option C: Render.com

1. Push `backend/` to a GitHub repo
2. Create new **Web Service** on Render
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

---

## Nginx Reverse Proxy (for VPS)

```nginx
# /etc/nginx/sites-available/investnaira

# API — api.investnaira.ng
server {
    listen 443 ssl;
    server_name api.investnaira.ng;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Larger body for file uploads
        client_max_body_size 50M;
    }
}

# App — app.investnaira.ng (serve static files)
server {
    listen 443 ssl;
    server_name app.investnaira.ng;
    root /opt/investnaira/frontend;
    index portal.html;

    location / {
        try_files $uri $uri/ /portal.html;
    }

    location /admin {
        try_files /admin.html =404;
    }
}
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `investnaira-secret-change-in-production-2024` | **Change this in production!** Used to sign JWT tokens |
| `ADMIN_EMAIL` | `admin@investnaira.ng` | Admin login email |
| `ADMIN_PASSWORD_HASH` | SHA256 of "InvestNaira2024!" | Admin password hash |
| `PORT` | `8000` | Server port |

### Generate a new admin password hash:
```bash
cd backend/
python3 -c "from auth import hash_password; print(hash_password('YourNewPassword!'))"
# Copy the output and set it as ADMIN_PASSWORD_HASH
```

---

## API Reference

### Authentication
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Client login → returns JWT |
| `POST` | `/api/auth/admin` | Admin login → returns JWT |

### Client Endpoints (requires client JWT)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/me` | Full client profile + all data |
| `GET` | `/api/me/transactions?page=1&per_page=30&filter=all` | Paginated transactions |
| `GET` | `/api/me/summary` | Lightweight summary for display |

### Admin Endpoints (requires admin JWT)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform-wide statistics |
| `GET` | `/api/admin/clients` | Paginated client list with search/sort |
| `GET` | `/api/admin/clients/{email}` | Full client detail |
| `PUT` | `/api/admin/clients/{email}` | Update client fields |
| `POST` | `/api/admin/upload` | Upload TSV/XLSX → rebuilds database |

### API Docs
Visit `/docs` for interactive Swagger UI when the server is running.

---

## Updating the Database

1. Prepare your updated `.tsv` or `.xlsx` file in the InvestNaira format
2. Log into the Admin Panel → **Upload Data**
3. Drag and drop your file (or click Browse)
4. The system parses the file and updates all client records live
5. Clients refreshing their dashboard will see the new data immediately

**The upload is atomic** — the database switches to the new data only after a fully successful parse.

---

## Client Login Logic

Clients log in with:
- **Email**: their registered email address
- **Password**: their **first name** (case-insensitive)

Example: `ngozi.okodua@gmail.com` / `ngozi`

To change this to proper passwords, modify `main.py` line in the `/api/auth/login` endpoint — replace the first-name comparison with a `check_password()` call against a stored hash.

---

## File Structure — clients.json

Each client record looks like:
```json
{
  "ngozi.okodua@gmail.com": {
    "email": "ngozi.okodua@gmail.com",
    "fn": "Ngozi", "ln": "Henry-Okodua", "phone": "+2348032495968",
    "deposits": 6112234.0, "withdrawals": 3053374.0, "returns": 62014.0,
    "assets": 3120874.0, "tx_count": 210,
    "since": "Nov 2019", "last": "Jan 2026",
    "rank": 1, "active": true,
    "monthly": [...],
    "yearly": [...],
    "transactions": [...]
  }
}
```

The file is at `backend/data/clients.json`. It's the live database — back it up before any upload.

---

## Security Notes

1. **Change JWT_SECRET** before going to production — use a long random string
2. **Change the admin password** — default is `InvestNaira2024!`
3. **HTTPS only** — use Let's Encrypt + Nginx in production
4. The CORS whitelist in `main.py` allows `localhost` for dev — remove it in production
5. Client passwords (first name) are intentionally simple — upgrade to hashed passwords for production

---

## Support

For deployment help, contact your InvestNaira development team.
