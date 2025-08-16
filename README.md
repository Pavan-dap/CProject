# Construction Project Management System

A comprehensive full-stack construction project management application built with React/TypeScript frontend and Django REST API backend.

## Features

### 🏗️ Project Management
- Create and manage construction projects
- Track project progress and status
- Assign team members to projects
- Hierarchical project structure (Blocks → Floors → Units)

### ✅ Task Management
- Create and assign tasks to team members
- Task dependencies and workflow management
- Progress tracking with real-time updates
- File and photo attachments
- Task comments and status updates

### 👥 User Management
- Role-based access control (Admin, Manager, Incharge, Executive)
- User profiles and team management
- Activity tracking and performance metrics

### 📊 Reports & Analytics
- Project status reports
- Gantt chart visualization
- Dashboard with key metrics
- Export functionality (PDF/Excel)

### 🔐 Authentication & Security
- Token-based authentication
- Role-based permissions
- Secure API endpoints

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Ant Design** for UI components
- **Recharts** for data visualization
- **React Router** for navigation
- **Vite** for development and building

### Backend
- **Django 4.2** with Python 3.8+
- **Django REST Framework** for API
- **SQLite** database (easily configurable to PostgreSQL/MySQL)
- **Django CORS Headers** for cross-origin requests
- **Token Authentication**

## Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Option 1: Automated Setup (Recommended)

#### Backend Setup
```bash
# Run the automated backend setup
python setup_backend.py
```

#### Frontend Setup
**For Linux/macOS:**
```bash
chmod +x setup_frontend.sh
./setup_frontend.sh
```

**For Windows:**
```cmd
setup_frontend.bat
```

### Option 2: Manual Setup

#### Backend Setup
1. **Create and activate virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Linux/macOS
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up database:**
   ```bash
   python manage.py makemigrations
   python manage.py makemigrations accounts
   python manage.py makemigrations projects
   python manage.py makemigrations tasks
   python manage.py makemigrations reports
   python manage.py migrate
   ```

4. **Create initial data:**
   ```bash
   python manage.py create_initial_data
   ```

5. **Start the backend server:**
   ```bash
   python manage.py runserver 8000
   ```

#### Frontend Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   # Create .env file in root directory
   echo "VITE_API_URL=http://localhost:8000/api" > .env
   ```

3. **Start the frontend server:**
   ```bash
   npm run dev
   ```

## Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python manage.py runserver 8000
   ```

2. **Start the frontend server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager1 | manager123 |
| Incharge | incharge1 | incharge123 |
| Executive | executive1 | executive123 |

## Project Structure

```
construction-pm/
├── backend/                     # Django backend
│   ├── construction_pm/         # Django project settings
│   ├── accounts/               # User management app
│   ├── projects/               # Project management app
│   ├── tasks/                  # Task management app
│   ├── reports/                # Reports and analytics app
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   ├── services/               # API service layer
│   ├── hooks/                  # Custom React hooks
│   ├── styles/                 # CSS styles
│   └── utils/                  # Utility functions
├── public/                     # Static assets
├── package.json
├── setup_backend.py           # Backend setup script
├── setup_frontend.sh          # Frontend setup script (Linux/macOS)
├── setup_frontend.bat         # Frontend setup script (Windows)
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `GET /api/auth/users/` - List users (admin only)

### Project Endpoints
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

### Task Endpoints
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Reports Endpoints
- `GET /api/reports/` - List reports
- `POST /api/reports/project/{id}/status/` - Generate project status report
- `GET /api/reports/dashboard/stats/` - Get dashboard statistics

## Features in Detail

### Dashboard
- Real-time project and task statistics
- Progress charts and visualizations
- Recent activities feed
- User-specific data based on role permissions

### Project Management
- Hierarchical project structure
- Team assignment and management
- Progress tracking with visual indicators
- Client and location management

### Task Management
- Dependency management between tasks
- File and photo attachments
- Progress tracking with percentage completion
- Comments and status updates
- Priority levels (High, Medium, Low)

### User Roles & Permissions

#### Admin
- Full system access
- User management
- All projects and tasks
- System reports

#### Manager
- Manage assigned projects
- Create and assign tasks
- View team performance
- Generate project reports

#### Incharge
- Supervise project execution
- Update task progress
- Manage team members
- Field-level coordination

#### Executive
- Execute assigned tasks
- Update task progress
- Upload photos and files
- Add task comments

## Deployment

### Development
Both frontend and backend run on localhost with hot reloading enabled.

### Production
1. **Backend Deployment:**
   - Configure production database (PostgreSQL recommended)
   - Set environment variables for production
   - Use gunicorn or uWSGI for WSGI server
   - Configure static file serving

2. **Frontend Deployment:**
   - Build the project: `npm run build`
   - Serve the dist folder with nginx or similar
   - Update API URL in environment variables

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (settings.py)
```python
SECRET_KEY=your-secret-key
DEBUG=False  # for production
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:pass@localhost/dbname  # for production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## Roadmap

- [ ] Mobile responsive design improvements
- [ ] Real-time notifications
- [ ] Advanced reporting features
- [ ] Integration with external tools
- [ ] Mobile app development
- [ ] Advanced file management
- [ ] Time tracking features
- [ ] Budget management
- [ ] Equipment tracking
