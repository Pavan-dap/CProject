from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Report, ReportSchedule
from .serializers import ReportSerializer, ReportCreateSerializer, ReportScheduleSerializer
from projects.models import Project
from tasks.models import Task
from accounts.models import User

class ReportListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReportCreateSerializer
        return ReportSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Report.objects.all()
        
        # Filter based on user role
        if user.role != 'admin':
            # Non-admin users can only see reports for projects they're involved in
            user_projects = Project.objects.filter(
                Q(manager=user) | Q(assignments__user=user)
            ).distinct().values_list('id', flat=True)
            queryset = queryset.filter(
                Q(project__isnull=True) | Q(project_id__in=user_projects)
            )
        
        return queryset.order_by('-generated_at')

class ReportDetailView(generics.RetrieveDestroyAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_project_status_report(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            project.manager != user and 
            not project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Generate report data
        tasks = Task.objects.filter(project=project)
        
        report_data = {
            'project_info': {
                'name': project.name,
                'client': project.client,
                'location': project.location,
                'status': project.status,
                'progress': float(project.progress),
                'start_date': project.start_date.isoformat(),
                'end_date': project.end_date.isoformat(),
                'buildings': project.buildings,
                'floors': project.floors,
                'units': project.units,
            },
            'task_summary': {
                'total_tasks': tasks.count(),
                'completed_tasks': tasks.filter(status='completed').count(),
                'in_progress_tasks': tasks.filter(status='in-progress').count(),
                'not_started_tasks': tasks.filter(status='not-started').count(),
                'on_hold_tasks': tasks.filter(status='on-hold').count(),
                'overdue_tasks': tasks.filter(
                    due_date__lt=timezone.now().date(),
                    status__in=['not-started', 'in-progress']
                ).count(),
            },
            'progress_by_priority': {
                'high': {
                    'total': tasks.filter(priority='high').count(),
                    'completed': tasks.filter(priority='high', status='completed').count(),
                },
                'medium': {
                    'total': tasks.filter(priority='medium').count(),
                    'completed': tasks.filter(priority='medium', status='completed').count(),
                },
                'low': {
                    'total': tasks.filter(priority='low').count(),
                    'completed': tasks.filter(priority='low', status='completed').count(),
                },
            },
            'team_performance': [],
            'generated_at': timezone.now().isoformat(),
        }
        
        # Add team performance data
        assigned_users = User.objects.filter(assigned_tasks__project=project).distinct()
        for user in assigned_users:
            user_tasks = tasks.filter(assigned_to=user)
            report_data['team_performance'].append({
                'user_name': user.get_full_name(),
                'role': user.role,
                'total_tasks': user_tasks.count(),
                'completed_tasks': user_tasks.filter(status='completed').count(),
                'in_progress_tasks': user_tasks.filter(status='in-progress').count(),
                'average_progress': user_tasks.aggregate(avg=Avg('progress'))['avg'] or 0,
            })
        
        # Create report record
        report = Report.objects.create(
            title=f"Project Status Report - {project.name}",
            report_type='project_status',
            project=project,
            data=report_data,
            generated_by=user
        )
        
        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_gantt_data(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            project.manager != user and 
            not project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        tasks = Task.objects.filter(project=project).select_related('assigned_to', 'hierarchy')
        
        gantt_data = []
        for task in tasks:
            gantt_item = {
                'id': task.id,
                'name': task.title,
                'start_date': task.start_date.isoformat() if task.start_date else task.created_at.date().isoformat(),
                'end_date': task.due_date.isoformat(),
                'progress': float(task.progress),
                'status': task.status,
                'priority': task.priority,
                'assigned_to': task.assigned_to.get_full_name(),
                'building': task.hierarchy.block_name if task.hierarchy else 'General',
                'floor': f"Floor {task.hierarchy.floor_number}" if task.hierarchy else 'General',
                'unit': task.hierarchy.unit_number if task.hierarchy else 'General',
                'dependencies': list(task.dependencies.values_list('depends_on_id', flat=True)),
            }
            gantt_data.append(gantt_item)
        
        # Create report record
        report_data = {
            'project_name': project.name,
            'gantt_data': gantt_data,
            'generated_at': timezone.now().isoformat(),
        }
        
        report = Report.objects.create(
            title=f"Gantt Chart - {project.name}",
            report_type='gantt_chart',
            project=project,
            data=report_data,
            generated_by=user
        )
        
        return Response(report_data)
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Get user's accessible projects and tasks
    if user.role == 'admin':
        projects = Project.objects.all()
        tasks = Task.objects.all()
    elif user.role == 'manager':
        projects = Project.objects.filter(
            Q(manager=user) | Q(assignments__user=user)
        ).distinct()
        tasks = Task.objects.filter(project__in=projects)
    else:
        projects = Project.objects.filter(assignments__user=user).distinct()
        tasks = Task.objects.filter(
            Q(assigned_to=user) | Q(project__in=projects)
        ).distinct()
    
    today = timezone.now().date()
    
    stats = {
        'projects': {
            'total': projects.count(),
            'by_status': {
                'planning': projects.filter(status='planning').count(),
                'in_progress': projects.filter(status='in-progress').count(),
                'completed': projects.filter(status='completed').count(),
                'on_hold': projects.filter(status='on-hold').count(),
            },
            'average_progress': projects.aggregate(avg=Avg('progress'))['avg'] or 0,
        },
        'tasks': {
            'total': tasks.count(),
            'by_status': {
                'not_started': tasks.filter(status='not-started').count(),
                'in_progress': tasks.filter(status='in-progress').count(),
                'completed': tasks.filter(status='completed').count(),
                'on_hold': tasks.filter(status='on-hold').count(),
            },
            'overdue': tasks.filter(due_date__lt=today, status__in=['not-started', 'in-progress']).count(),
            'due_today': tasks.filter(due_date=today, status__in=['not-started', 'in-progress']).count(),
        }
    }
    
    if user.role == 'admin':
        stats['users'] = {
            'total': User.objects.count(),
            'active': User.objects.filter(is_active=True).count(),
            'by_role': {
                role[0]: User.objects.filter(role=role[0], is_active=True).count()
                for role in User.ROLE_CHOICES
            }
        }
    
    return Response(stats)
