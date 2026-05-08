# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend
All frontend commands must be run from the `frontend/` directory:
```bash
cd frontend
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # production build to frontend/dist/
npm run lint      # ESLint
npm run preview   # preview production build
```

### Backend
The production backend lives in `backend/app/`. Run it from the `backend/` directory:
```bash
cd backend
uvicorn app.main:app --reload   # http://localhost:8000
```

`backend/main.py` is a standalone prototype (no auth, no DB) used for early development — it is not the active backend.

### Database
```bash
cd backend
alembic upgrade head    # apply migrations
alembic revision --autogenerate -m "description"  # generate migration
```

The database is a local PostgreSQL instance named `rfq_auth_db`. Connection is configured in `backend/app/core/config.py` and can be overridden via a `.env` file using the `DATABASE_URL` key.

To create the initial superuser: `python backend/create_superuser.py`

## Architecture

### Two-service structure
- **Frontend** (React 19 + Vite) at `frontend/` — talks to the backend via REST and WebSocket
- **Backend** (FastAPI + SQLAlchemy async) at `backend/app/` — serves auth, live dashboard data, and file automation

### Authentication flow
JWT tokens are issued at `POST /token` (OAuth2 password form). The token is stored in `localStorage` and passed:
- As `Authorization: Bearer <token>` for REST calls
- As a query param `?token=<token>` for the WebSocket connection — the server closes with code `1008` on auth failure, which the frontend detects to redirect to `/login`

`ProtectedRoute` only checks for token presence client-side; actual validation happens server-side on each request.

### WebSocket-driven dashboard
`Dashboard.jsx` opens `ws://127.0.0.1:8000/ws?token=<token>` on mount. All filter changes (account, type, date range, supplier, price) are sent as `{ action: "update_filters", filters: {...} }` messages. The server responds immediately and also pushes periodic updates every ~5 seconds. The entire dashboard state (`kpis`, `charts`, `supplierStats`, `spendAnalysis`) is replaced on each message.

Dashboard data is currently **simulated** by `backend/app/services/data_gen.py` — there is no real data source yet.

### File automation service
`backend/app/services/automation.py` runs a background loop that watches `backend/files/source/` for dropped files. Files are moved to `backend/files/processed/` or `backend/files/exception/` (if filename contains "error") and a `ProcessedFile` record is saved to the DB. The `FileProcessed` page polls `GET /automation/files` every 5 seconds and shows toast notifications for new completions.

### Backend module layout
```
backend/app/
  main.py              # FastAPI app, CORS, router registration
  api/endpoints/
    auth.py            # /token, /users, /users/me, /users/me/password
    dashboard.py       # /accounts, /ws (WebSocket)
    automation.py      # /automation/start|stop|status|files
  core/
    config.py          # Settings (DATABASE_URL, SECRET_KEY, etc.)
    database.py        # async SQLAlchemy engine + get_db dependency
    security.py        # JWT creation/verification, bcrypt hashing
    models.py          # SQLAlchemy Base
  models/
    user.py            # User ORM model
    file.py            # ProcessedFile ORM model
  services/
    data_gen.py        # Dashboard data simulation
    automation.py      # FileAutomator background service
```

### Frontend routing
| Path | Component | Notes |
|------|-----------|-------|
| `/login` | `Login.jsx` | Public; login, register, change-password views |
| `/` | `FileProcessed.jsx` | Protected; file processing management page |
| `/dashboard` | `Dashboard.jsx` | Protected; live analytics dashboard |

### Key frontend dependencies
- **Recharts** — all chart components under `frontend/src/components/Charts/`
- **framer-motion** — page/form transition animations (Login, FileProcessed)
- **xlsx** — Export Excel button in Dashboard
- **lucide-react** — icons throughout
- **tailwind-merge + clsx** — conditional class utilities
