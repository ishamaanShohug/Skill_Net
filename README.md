# SkillNet

SkillNet includes a responsive React/Vite frontend and a Django REST API backend.

See [PROJECT_FUNCTIONALITY.md](PROJECT_FUNCTIONALITY.md) for a dashboard-by-dashboard description of features, permissions, backend behavior, and current implementation status.

## Run locally

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Use the demo role switcher on the login page (or log in with any valid-looking email/password) to explore Job Seeker, Employer, and Admin areas. The frontend uses a replaceable mock service layer by default. Set `VITE_USE_MOCK_API=false` to connect service calls to `VITE_API_BASE_URL`.

## Production check

```bash
cd frontend
npm run build
npm run preview
```

## Django backend

The REST API lives in `backend/` and uses SQLite locally or MySQL when configured.

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API documentation is available at `http://localhost:8000/api/docs/`. The backend is configured for PostgreSQL through the `DB_*` variables in `backend/.env`. Demo users use password `DemoPass123!`.



