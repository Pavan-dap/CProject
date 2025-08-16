@echo off
echo ==================================================
echo Construction PM React Frontend Setup
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 16+ and try again.
    pause
    exit /b 1
)

echo Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo npm version:
npm --version

REM Install dependencies
echo Installing frontend dependencies...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    echo VITE_API_URL=http://localhost:8000/api > .env
    echo .env file created with default settings
) else (
    echo .env file already exists
)

echo.
echo ==================================================
echo Frontend setup completed successfully!
echo ==================================================
echo.
echo Next steps:
echo 1. Make sure the Django backend is running on port 8000
echo 2. Start the development server:
echo    npm run dev
echo.
echo The application will be available at:
echo    http://localhost:5173
echo.
echo Default login credentials:
echo    Admin: admin / admin123
echo    Manager: manager1 / manager123
echo    Executive: executive1 / executive123

pause
