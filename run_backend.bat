@echo off
echo Starting Construction PM Django Backend...

REM Change to backend directory
cd backend

REM Check if virtual environment exists
if not exist venv (
    echo Error: Virtual environment not found. Please run setup_backend.py first.
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Clear any conflicting environment variables
set DB_NAME=
set DB_USER=
set DB_PASSWORD=
set DB_HOST=
set DB_PORT=

REM Set Django settings module
set DJANGO_SETTINGS_MODULE=construction_pm.settings
set PYTHONPATH=%cd%

REM Check if database exists
if not exist db.sqlite3 (
    echo Database not found. Running setup...
    python manage.py migrate
    python manage.py create_initial_data
)

REM Start the server
echo Starting Django development server on http://localhost:8000
python manage.py runserver 8000

pause
