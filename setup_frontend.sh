#!/bin/bash

# Construction PM Frontend Setup Script
echo "=================================================="
echo "Construction PM React Frontend Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "Error: Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm and try again."
    exit 1
fi

echo "npm version: $(npm --version)"

# Install dependencies
echo "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
VITE_API_URL=http://localhost:8000/api
EOL
    echo ".env file created with default settings"
else
    echo ".env file already exists"
fi

echo ""
echo "=================================================="
echo "Frontend setup completed successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Make sure the Django backend is running on port 8000"
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "The application will be available at:"
echo "   http://localhost:5173"
echo ""
echo "Default login credentials:"
echo "   Admin: admin / admin123"
echo "   Manager: manager1 / manager123" 
echo "   Executive: executive1 / executive123"
