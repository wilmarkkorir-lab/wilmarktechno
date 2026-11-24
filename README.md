# Wilmark Technologies
Developer skill-sharing community. Django REST API, React + Vite + Tailwind UI.

## Run locally
Backend:  cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
          python manage.py makemigrations community && python manage.py migrate
          python manage.py createsuperuser && python manage.py runserver
Frontend: cd frontend && npm install && npm run dev      (http://localhost:5173)
Tests:    cd backend && python manage.py test
Email:    verification and reset links print in the backend terminal until you set EMAIL_HOST.
Admin:    http://localhost:8000/admin  (review reports, hide posts, suspend users, create skill challenges)

## Deploy with Docker (PostgreSQL)
1. Run makemigrations once locally and commit backend/community/migrations.
2. cp .env.example .env and change every value.
3. docker compose up -d --build
4. Daily backups: add scripts/backup.sh to cron.
5. Put the site behind HTTPS (Caddy, nginx or your host), then set HTTPS=1 and update the URLs in .env.

## Before launch
- Have a lawyer review the Privacy and Terms pages in frontend/src/pages/More.jsx and add your contact email.
- Rate limits use per-process memory; use a shared cache such as Redis if you run several servers.

## Login cookies
Login tokens are stored in HttpOnly cookies (JavaScript cannot read them), and requests that change data carry a CSRF token.
- The site and the API must share the same registrable domain in production (for example app.yourdomain.com and api.yourdomain.com), and CORS_ORIGINS / CSRF_TRUSTED_ORIGINS must list the site's exact origin.
- Run python manage.py migrate again: the token blacklist adds its own tables. Logging out blacklists the refresh token.
- Anyone logged in before this change must log in again.
