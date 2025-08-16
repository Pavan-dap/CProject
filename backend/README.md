# Construct Backend (Django + DRF + JWT + MySQL)

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create DB 'construction_db' in MySQL first, then:
python manage.py makemigrations
python manage.py migrate

# Create users
python manage.py createsuperuser  # for admin login
python manage.py runserver
```

### JWT
- POST `/api/token/` with `{ "username": "<email or username>", "password": "<password>" }`
- Use `Authorization: Bearer <token>` for subsequent requests.

### Endpoints
- `/api/users/`
- `/api/projects/`
- `/api/tasks/`
