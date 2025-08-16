from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from projects.models import Project, ProjectAssignment, ProjectHierarchy
from tasks.models import Task, TaskDependency, TaskComment
from accounts.models import UserProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Create initial data for the construction PM system'

    def handle(self, *args, **options):
        self.stdout.write('Creating initial data...')
        
        # Create users
        users = self.create_users()
        
        # Create projects
        projects = self.create_projects(users)
        
        # Create project hierarchy
        self.create_project_hierarchy(projects)
        
        # Create tasks
        self.create_tasks(users, projects)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created initial data!')
        )

    def create_users(self):
        self.stdout.write('Creating users...')
        
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@construct.com',
                'first_name': 'Akhila',
                'last_name': 'Neti',
                'role': 'admin',
                'phone': '+1 234-567-8901',
                'password': 'admin123',
            },
            {
                'username': 'manager1',
                'email': 'manager@construct.com',
                'first_name': 'Nagarjuna',
                'last_name': 'Nitta',
                'role': 'manager',
                'phone': '+1 234-567-8902',
                'password': 'manager123',
            },
            {
                'username': 'incharge1',
                'email': 'incharge@construct.com',
                'first_name': 'Sarada',
                'last_name': 'Reddy',
                'role': 'incharge',
                'phone': '+1 234-567-8903',
                'password': 'incharge123',
            },
            {
                'username': 'executive1',
                'email': 'executive@construct.com',
                'first_name': 'Sai',
                'last_name': 'Kumar',
                'role': 'executive',
                'phone': '+1 234-567-8904',
                'password': 'executive123',
            },
            {
                'username': 'executive2',
                'email': 'executive2@construct.com',
                'first_name': 'Ram',
                'last_name': 'Dev',
                'role': 'executive',
                'phone': '+1 234-567-8905',
                'password': 'executive123',
                'is_active': False,
            },
            {
                'username': 'manager2',
                'email': 'manager2@construct.com',
                'first_name': 'Srinu',
                'last_name': 'Naidu',
                'role': 'manager',
                'phone': '+1 234-567-8906',
                'password': 'manager123',
            },
            {
                'username': 'incharge2',
                'email': 'incharge2@construct.com',
                'first_name': 'Nagaraju',
                'last_name': 'M',
                'role': 'incharge',
                'phone': '+1 234-567-8907',
                'password': 'incharge123',
            },
            {
                'username': 'executive3',
                'email': 'executive3@construct.com',
                'first_name': 'Madav',
                'last_name': 'Rao',
                'role': 'executive',
                'phone': '+1 234-567-8908',
                'password': 'executive123',
            },
        ]
        
        users = {}
        for user_data in users_data:
            username = user_data['username']
            password = user_data.pop('password')
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults=user_data
            )
            
            if created:
                user.set_password(password)
                user.save()
                
                # Create profile
                UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'join_date': date.today() - timedelta(days=30),
                        'employee_id': f'EMP{user.id:04d}'
                    }
                )
                
                self.stdout.write(f'Created user: {username}')
            else:
                self.stdout.write(f'User already exists: {username}')
            
            users[username] = user
        
        return users

    def create_projects(self, users):
        self.stdout.write('Creating projects...')
        
        projects_data = [
            {
                'name': 'ABC Township Phase-2',
                'description': 'Supply and installation of UPVC windows and doors for 1000 residential units',
                'client': 'ABC Developers Ltd.',
                'location': 'Mumbai, Maharashtra',
                'start_date': date(2025, 3, 1),
                'end_date': date(2025, 9, 30),
                'buildings': 25,
                'floors': 4,
                'units': 1000,
                'status': 'in-progress',
                'progress': 45.00,
                'budget': 50000000.00,
                'manager': users['manager1'],
                'created_by': users['admin'],
            },
            {
                'name': 'Green Valley Complex',
                'description': 'Complete door and window installation project',
                'client': 'Green Valley Housing',
                'location': 'Pune, Maharashtra',
                'start_date': date(2025, 4, 1),
                'end_date': date(2025, 9, 15),
                'buildings': 15,
                'floors': 6,
                'units': 540,
                'status': 'in-progress',
                'progress': 25.00,
                'budget': 30000000.00,
                'manager': users['manager2'],
                'created_by': users['admin'],
            },
        ]
        
        projects = {}
        for project_data in projects_data:
            project_name = project_data['name']
            project, created = Project.objects.get_or_create(
                name=project_name,
                defaults=project_data
            )
            
            if created:
                self.stdout.write(f'Created project: {project_name}')
                
                # Create project assignments
                if project_name == 'ABC Township Phase-2':
                    assignments = ['incharge1', 'executive1', 'executive3']
                else:
                    assignments = ['incharge2', 'executive1']
                
                for username in assignments:
                    ProjectAssignment.objects.get_or_create(
                        project=project,
                        user=users[username],
                        defaults={'assigned_by': users['admin']}
                    )
            else:
                self.stdout.write(f'Project already exists: {project_name}')
            
            projects[project_name] = project
        
        return projects

    def create_project_hierarchy(self, projects):
        self.stdout.write('Creating project hierarchy...')
        
        # ABC Township Phase-2 hierarchy
        abc_project = projects['ABC Township Phase-2']
        
        for block_num in range(1, 4):  # 3 blocks
            block_name = f'Block A{block_num}'
            for floor in range(1, 5):  # 4 floors
                for unit in range(1, 11):  # 10 units per floor
                    unit_type = '3BHK' if unit <= 4 else '2BHK' if unit <= 8 else '1BHK'
                    unit_number = f'{floor}{unit:02d}'
                    
                    ProjectHierarchy.objects.get_or_create(
                        project=abc_project,
                        block_name=block_name,
                        floor_number=floor,
                        unit_number=unit_number,
                        unit_type=unit_type,
                        defaults={'completion_percentage': 0.00}
                    )
        
        # Green Valley Complex hierarchy
        gv_project = projects['Green Valley Complex']
        
        for block_num in range(1, 3):  # 2 blocks
            block_name = f'Block {block_num}'
            for floor in range(1, 7):  # 6 floors
                for unit in range(1, 7):  # 6 units per floor
                    unit_type = '3BHK' if unit <= 2 else '2BHK' if unit <= 5 else '1BHK'
                    unit_number = f'{floor}{unit:02d}'
                    
                    ProjectHierarchy.objects.get_or_create(
                        project=gv_project,
                        block_name=block_name,
                        floor_number=floor,
                        unit_number=unit_number,
                        unit_type=unit_type,
                        defaults={'completion_percentage': 0.00}
                    )

    def create_tasks(self, users, projects):
        self.stdout.write('Creating tasks...')
        
        abc_project = projects['ABC Township Phase-2']
        gv_project = projects['Green Valley Complex']
        
        # Get hierarchy objects
        abc_hierarchy = ProjectHierarchy.objects.filter(project=abc_project).first()
        gv_hierarchy = ProjectHierarchy.objects.filter(project=gv_project).first()
        
        tasks_data = [
            {
                'title': 'Foundation Work - Block A1',
                'description': 'Complete foundation work for Block A1',
                'project': abc_project,
                'hierarchy': abc_hierarchy,
                'assigned_to': users['executive1'],
                'assigned_by': users['incharge1'],
                'status': 'completed',
                'progress': 100.00,
                'priority': 'high',
                'due_date': date.today() + timedelta(days=30),
                'estimated_hours': 240.00,
                'actual_hours': 235.00,
                'can_start_without_dependency': True,
                'completed_date': date.today() - timedelta(days=5),
            },
            {
                'title': 'Structural Work - Block A1, Floor 1-4',
                'description': 'Complete structural work for floors 1-4 in Block A1',
                'project': abc_project,
                'hierarchy': abc_hierarchy,
                'assigned_to': users['executive1'],
                'assigned_by': users['incharge1'],
                'status': 'in-progress',
                'progress': 75.00,
                'priority': 'high',
                'due_date': date.today() + timedelta(days=45),
                'estimated_hours': 480.00,
                'actual_hours': 360.00,
                'can_start_without_dependency': False,
            },
            {
                'title': 'UPVC Window Installation - Block A1, Floor 1',
                'description': 'Install UPVC windows in all 3BHK units on Floor 1',
                'project': abc_project,
                'hierarchy': abc_hierarchy,
                'assigned_to': users['executive1'],
                'assigned_by': users['incharge1'],
                'status': 'in-progress',
                'progress': 40.00,
                'priority': 'high',
                'due_date': date.today() + timedelta(days=25),
                'estimated_hours': 80.00,
                'actual_hours': 32.00,
                'can_start_without_dependency': False,
            },
            {
                'title': 'Site Preparation - Green Valley Block 1',
                'description': 'Prepare site for construction in Green Valley Block 1',
                'project': gv_project,
                'hierarchy': gv_hierarchy,
                'assigned_to': users['executive1'],
                'assigned_by': users['incharge2'],
                'status': 'completed',
                'progress': 100.00,
                'priority': 'high',
                'due_date': date.today() + timedelta(days=10),
                'can_start_without_dependency': True,
                'completed_date': date.today() - timedelta(days=2),
            },
            {
                'title': 'Foundation - Green Valley Block 1',
                'description': 'Foundation work for Green Valley Block 1',
                'project': gv_project,
                'hierarchy': gv_hierarchy,
                'assigned_to': users['executive1'],
                'assigned_by': users['incharge2'],
                'status': 'in-progress',
                'progress': 60.00,
                'priority': 'high',
                'due_date': date.today() + timedelta(days=55),
                'estimated_hours': 200.00,
                'actual_hours': 120.00,
                'can_start_without_dependency': False,
            },
        ]
        
        created_tasks = []
        for task_data in tasks_data:
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                project=task_data['project'],
                defaults=task_data
            )
            
            if created:
                self.stdout.write(f'Created task: {task.title}')
                
                # Add some comments
                if task.title == 'UPVC Window Installation - Block A1, Floor 1':
                    TaskComment.objects.create(
                        task=task,
                        user=users['executive1'],
                        text='Completed units 101 and 102. Moving to 103 tomorrow.',
                        comment_type='status_update'
                    )
                    TaskComment.objects.create(
                        task=task,
                        user=users['executive1'],
                        text='Need coordination with electrical team for unit 104',
                        comment_type='comment'
                    )
            else:
                self.stdout.write(f'Task already exists: {task.title}')
            
            created_tasks.append(task)
        
        # Create task dependencies
        if len(created_tasks) >= 3:
            # Structural work depends on foundation
            TaskDependency.objects.get_or_create(
                task=created_tasks[1],  # Structural work
                depends_on=created_tasks[0]  # Foundation work
            )
            
            # Window installation depends on structural work
            TaskDependency.objects.get_or_create(
                task=created_tasks[2],  # Window installation
                depends_on=created_tasks[1]  # Structural work
            )
            
            # Green Valley foundation depends on site preparation
            if len(created_tasks) >= 5:
                TaskDependency.objects.get_or_create(
                    task=created_tasks[4],  # GV Foundation
                    depends_on=created_tasks[3]  # GV Site preparation
                )
