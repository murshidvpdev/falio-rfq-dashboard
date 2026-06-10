1. Database (PostgreSQL)
Already exists locally (rfq_auth_db, owned by murshi.). Just make sure Postgres is running:


brew services start postgresql@<version>   # if not already running
Apply migrations:


cd backend
source venv/bin/activate   # or .venv at repo root
alembic upgrade head
(Optional, first time only) Seed RBAC roles/permissions and create a superuser:


python seed_rbac.py
python create_superuser.py
2. Backend

cd backend
source venv/bin/activate
uvicorn app.main:app --reload
Runs at http://localhost:8000 (API docs at /docs).

3. Frontend

cd frontend
npm install      # first time only
npm run dev
Runs at http://localhost:5173. It uses frontend/.env.local (VITE_API_BASE_URL=http://localhost:8000, VITE_WS_BASE_URL=ws://localhost:8000), which is already set up correctly.

4. Use the app
Open http://localhost:5173, register/login, then visit /dashboard and / (file processing).

Alternative — Docker Compose (full stack incl. its own Postgres):


docker compose up --build
This uses the root .env file and serves everything via nginx on port 80. For this you'd run alembic upgrade head inside the backend container after it's up.

For day-to-day development I'd recommend the local (non-Docker) approach above since the DB is already set up.