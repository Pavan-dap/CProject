#!/bin/bash

# Construction PM Backend Runner
echo "Starting Construction PM Django Backend..."

# Change to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found. Please run setup_backend.py first."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Clear any conflicting environment variables
unset DB_NAME DB_USER DB_PASSWORD DB_HOST DB_PORT

# Set Django settings module
export DJANGO_SETTINGS_MODULE=construction_pm.settings
export PYTHONPATH=$(pwd)

# Check if database exists
if [ ! -f "db.sqlite3" ]; then
    echo "Database not found. Running setup..."
    python manage.py migrate
    python manage.py create_initial_data
fi

# Start the server
echo "Starting Django development server on http://localhost:8000"
python manage.py runserver 8000
