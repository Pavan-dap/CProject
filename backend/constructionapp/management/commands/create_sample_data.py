from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from constructionapp.models import Project, Task
from datetime import date, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for the construction management system'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@construct.com',
                'first_name': 'Akhila',
                'last_name': 'Neti',
                'role': 'admin',
                'status': 'active'
            }
        )
        if created:
            admin_user.set_password('password')
            admin_user.save()

        manager_user, created = User.objects.get_or_create(
            username='manager',
            defaults={
                'email': 'manager@construct.com',
                'first_name': 'Nagarjuna',
                'last_name': 'Nitta',
                'role': 'manager',
                'status': 'active'
            }
        )
        if created:
            manager_user.set_password('password')
            manager_user.save()

        incharge_user, created = User.objects.get_or_create(
            username='incharge',
            defaults={
                'email': 'incharge@construct.com',
                'first_name': 'Sarada',
                'last_name': 'Reddy',
                'role': 'incharge',
                'status': 'active'
            }
        )
        if created:
            incharge_user.set_password('password')
            incharge_user.save()

        executive_user, created = User.objects.get_or_create(
            username='executive',
            defaults={
                'email': 'executive@construct.com',
                'first_name': 'Sai',
                'last_name': 'Kumar',
                'role': 'executive',
                'status': 'active'
            }
        )
        if created:
            executive_user.set_password('password')
            executive_user.save()

        # Create projects
        project1, created = Project.objects.get_or_create(
            name='ABC Township Phase-2',
            defaults={
                'location': 'Mumbai, Maharashtra',
                'client': 'ABC Developers Ltd.',
                'description': 'Supply and installation of UPVC windows and doors for 1000 residential units',
                'start_date': date(2025, 3, 1),
                'end_date': date(2025, 9, 30),
                'buildings': 25,
                'floors': 4,
                'units': 1000,
                'manager': manager_user,
                'progress': 45,
                'status': 'in-progress'
            }
        )
        if created:
            project1.team_members.add(incharge_user, executive_user)

        project2, created = Project.objects.get_or_create(
            name='Green Valley Complex',
            defaults={
                'location': 'Pune, Maharashtra',
                'client': 'Green Valley Housing',
                'description': 'Complete door and window installation project',
                'start_date': date(2025, 4, 1),
                'end_date': date(2025, 9, 15),
                'buildings': 15,
                'floors': 6,
                'units': 540,
                'manager': manager_user,
                'progress': 25,
                'status': 'in-progress'
            }
        )
        if created:
            project2.team_members.add(incharge_user, executive_user)

        # Create tasks
        task1, created = Task.objects.get_or_create(
            title='Foundation Work - Block A',
            defaults={
                'description': 'Complete foundation work for Block A',
                'project': project1,
                'assigned_to': executive_user,
                'assigned_by': incharge_user,
                'status': 'completed',
                'progress': 100,
                'priority': 'high',
                'due_date': date(2025, 3, 30),
                'building': 'Block A',
                'floor': 'Foundation',
                'estimated_hours': 240,
                'actual_hours': 235,
                'can_start_without_dependency': True
            }
        )

        task2, created = Task.objects.get_or_create(
            title='Structural Work - Block A, Floor 1-5',
            defaults={
                'description': 'Complete structural work for floors 1-5 in Block A',
                'project': project1,
                'assigned_to': executive_user,
                'assigned_by': incharge_user,
                'status': 'in-progress',
                'progress': 75,
                'priority': 'high',
                'due_date': date(2025, 5, 15),
                'building': 'Block A',
                'floor': 'Floor 1-5',
                'estimated_hours': 480,
                'actual_hours': 360,
                'can_start_without_dependency': False
            }
        )
        if created:
            task2.dependencies.add(task1)

        task3, created = Task.objects.get_or_create(
            title='UPVC Window Installation - Block A, Floor 1, 3BHK Units',
            defaults={
                'description': 'Install UPVC windows in all 3BHK units on Floor 1',
                'project': project1,
                'assigned_to': executive_user,
                'assigned_by': incharge_user,
                'status': 'in-progress',
                'progress': 40,
                'priority': 'high',
                'due_date': date(2025, 4, 25),
                'building': 'Block A',
                'floor': 'Floor 1',
                'unit': '101, 102, 103, 104',
                'unit_type': '3BHK',
                'estimated_hours': 80,
                'actual_hours': 32,
                'can_start_without_dependency': False
            }
        )
        if created:
            task3.dependencies.add(task2)

        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
        self.stdout.write('Login credentials:')
        self.stdout.write('Admin: admin@construct.com / password')
        self.stdout.write('Manager: manager@construct.com / password')
        self.stdout.write('Incharge: incharge@construct.com / password')
        self.stdout.write('Executive: executive@construct.com / password')