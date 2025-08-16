# Construction Project Management Backend

This is the Django REST API backend for the Construction Project Management System.

## Setup Instructions

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

### Installation

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Database Setup:**
   - Create a MySQL database named `construction_management`
   - Update database credentials in `settings.py` if needed

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create sample data:**
   ```bash
   python manage.py create_sample_data
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Users
- `GET /api/users/` - List users
- `POST /api/users/` - Create user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `GET /api/projects/{id}/hierarchy/` - Get project hierarchy

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `GET /api/tasks/{id}/dependencies/` - Get task dependencies
- `GET /api/tasks/{id}/comments/` - List task comments
- `POST /api/tasks/{id}/comments/` - Add task comment
- `POST /api/tasks/{id}/upload-file/` - Upload task file
- `POST /api/tasks/{id}/upload-photo/` - Upload task photo

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## Default Login Credentials

After running `create_sample_data` command:

- **Admin:** admin@construct.com / password
- **Manager:** manager@construct.com / password
- **Incharge:** incharge@construct.com / password
- **Executive:** executive@construct.com / password

## Features

- **Role-based Access Control:** Different permissions for Admin, Manager, Incharge, and Executive roles
- **Project Management:** Create and manage construction projects
- **Task Management:** Create tasks with dependencies, file uploads, and progress tracking
- **User Management:** Manage team members and their roles
- **Dashboard Statistics:** Real-time project and task statistics
- **File Uploads:** Support for task files and photos
- **Comments System:** Add comments and updates to tasks
- **Project Hierarchy:** Track completion by blocks, floors, and units

## Database Schema

The system includes the following main models:
- **CustomUser:** Extended user model with roles and additional fields
- **Project:** Construction projects with team management
- **Task:** Individual tasks with dependencies and progress tracking
- **TaskComment:** Comments and updates on tasks
- **TaskFile/TaskPhoto:** File and photo attachments for tasks
- **ProjectStatusReport:** Generated project status reports

## Security Features

- Token-based authentication
- Role-based permissions
- CORS configuration for frontend integration
- File upload validation
- SQL injection protection through Django ORM