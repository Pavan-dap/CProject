#!/usr/bin/env python
"""
Setup script for Construction PM Django Backend
This script will set up the Django backend with all necessary dependencies and initial data
"""

import os
import sys
import subprocess
import platform

def run_command(command, cwd=None, env=None):
    """Run a command and handle errors"""
    print(f"Running: {command}")
    try:
        # Ensure we use the current environment with our custom additions
        command_env = os.environ.copy()
        if env:
            command_env.update(env)
        
        result = subprocess.run(command, shell=True, check=True, cwd=cwd, 
                              capture_output=True, text=True, env=command_env)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("Error: Python 3.8 or higher is required")
        sys.exit(1)
    print(f"Python version: {sys.version}")

def setup_virtual_environment():
    """Create and activate virtual environment"""
    backend_dir = "backend"
    if not os.path.exists(f"{backend_dir}/venv"):
        print("Creating virtual environment...")
        if not run_command("python -m venv venv", cwd=backend_dir):
            return False
    
    # Determine activation script based on OS
    if platform.system() == "Windows":
        activate_script = "venv\\Scripts\\activate"
        pip_command = "venv\\Scripts\\pip"
        python_command = "venv\\Scripts\\python"
    else:
        activate_script = "venv/bin/activate"
        pip_command = "venv/bin/pip"
        python_command = "venv/bin/python"
    
    print(f"Virtual environment created. Activate with: {activate_script}")
    return pip_command, python_command

def install_dependencies(pip_command):
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    return run_command(f"{pip_command} install -r requirements.txt", cwd="backend")

def setup_database(python_command):
    """Set up the database"""
    print("Setting up database...")
    backend_dir = "backend"
    
    # Set environment variables to ensure we use the correct settings
    django_env = {
        'DJANGO_SETTINGS_MODULE': 'construction_pm.settings',
        'PYTHONPATH': os.path.abspath(backend_dir)
    }
    
    # Clear any conflicting database environment variables
    for key in ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']:
        if key in os.environ:
            del os.environ[key]
    
    # Run migrations
    commands = [
        f"{python_command} manage.py makemigrations",
        f"{python_command} manage.py makemigrations accounts",
        f"{python_command} manage.py makemigrations projects", 
        f"{python_command} manage.py makemigrations tasks",
        f"{python_command} manage.py makemigrations reports",
        f"{python_command} manage.py migrate",
        f"{python_command} manage.py create_initial_data",
    ]
    
    for command in commands:
        if not run_command(command, cwd=backend_dir, env=django_env):
            return False
    
    return True

def main():
    """Main setup function"""
    print("=" * 60)
    print("Construction PM Django Backend Setup")
    print("=" * 60)
    
    # Check Python version
    check_python_version()
    
    # Check if backend directory exists
    if not os.path.exists("backend"):
        print("Error: backend directory not found")
        print("Make sure you're running this script from the project root directory")
        sys.exit(1)
    
    # Check if this is the correct backend (with our SQLite settings)
    settings_file = "backend/construction_pm/settings.py"
    if not os.path.exists(settings_file):
        print("Error: Django settings file not found at expected location")
        print(f"Expected: {settings_file}")
        sys.exit(1)
    
    # Setup virtual environment
    result = setup_virtual_environment()
    if not result:
        print("Failed to set up virtual environment")
        sys.exit(1)
    
    pip_command, python_command = result
    
    # Install dependencies
    if not install_dependencies(pip_command):
        print("Failed to install dependencies")
        sys.exit(1)
    
    # Setup database
    if not setup_database(python_command):
        print("Failed to set up database")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Backend setup completed successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Activate virtual environment:")
    if platform.system() == "Windows":
        print("   cd backend && venv\\Scripts\\activate")
    else:
        print("   cd backend && source venv/bin/activate")
    print("2. Start the development server:")
    print("   python manage.py runserver 8000")
    print("\nDefault login credentials:")
    print("   Admin: admin / admin123")
    print("   Manager: manager1 / manager123")
    print("   Executive: executive1 / executive123")

if __name__ == "__main__":
    main()
