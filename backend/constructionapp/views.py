from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import CustomUser, Project, Task, TaskComment, TaskFile, TaskPhoto, ProjectStatusReport
from .serializers import (
    UserSerializer, LoginSerializer, ProjectSerializer, TaskSerializer,
    TaskCommentSerializer, TaskFileSerializer, TaskPhotoSerializer,
    ProjectStatusReportSerializer, DashboardStatsSerializer
)


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        user_data = UserSerializer(user).data
        return Response({
            'token': token.key,
            'user': user_data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# User Management Views
class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CustomUser.objects.all()
        elif user.role in ['manager', 'incharge']:
            # Managers and incharges can see users in their projects
            user_projects = user.assigned_projects.all()
            team_members = CustomUser.objects.filter(assigned_projects__in=user_projects).distinct()
            return team_members
        else:
            # Executives can only see themselves
            return CustomUser.objects.filter(id=user.id)
    
    def perform_create(self, serializer):
        # Only admins and managers can create users
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to create users.")
        serializer.save()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return CustomUser.objects.all()
        elif user.role in ['manager', 'incharge']:
            user_projects = user.assigned_projects.all()
            team_members = CustomUser.objects.filter(assigned_projects__in=user_projects).distinct()
            return team_members
        else:
            return CustomUser.objects.filter(id=user.id)


# Project Management Views
class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Project.objects.all()
        else:
            # Return projects where user is manager or team member
            return Project.objects.filter(
                Q(manager=user) | Q(team_members=user)
            ).distinct()
    
    def perform_create(self, serializer):
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to create projects.")
        serializer.save(manager=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Project.objects.all()
        else:
            return Project.objects.filter(
                Q(manager=user) | Q(team_members=user)
            ).distinct()


# Task Management Views
class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all()
        
        if user.role == 'executive':
            # Executives only see tasks assigned to them
            queryset = queryset.filter(assigned_to=user)
        elif user.role in ['incharge', 'manager']:
            # Incharges and managers see tasks in their projects
            user_projects = user.assigned_projects.all()
            queryset = queryset.filter(project__in=user_projects)
        # Admins see all tasks
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by status if specified
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        if self.request.user.role == 'executive':
            raise permissions.PermissionDenied("You don't have permission to create tasks.")
        serializer.save(assigned_by=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        elif user.role == 'executive':
            return Task.objects.filter(assigned_to=user)
        else:
            user_projects = user.assigned_projects.all()
            return Task.objects.filter(project__in=user_projects)


# Task Comments Views
class TaskCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.kwargs['task_id']
        return TaskComment.objects.filter(task_id=task_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        task_id = self.kwargs['task_id']
        task = Task.objects.get(id=task_id)
        serializer.save(user=self.request.user, task=task)


# Dashboard and Statistics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Get user-specific data based on role
    if user.role == 'admin':
        projects = Project.objects.all()
        tasks = Task.objects.all()
        users = CustomUser.objects.all()
    elif user.role == 'executive':
        projects = user.assigned_projects.all()
        tasks = Task.objects.filter(assigned_to=user)
        users = CustomUser.objects.filter(id=user.id)
    else:
        projects = user.assigned_projects.all()
        tasks = Task.objects.filter(project__in=projects)
        users = CustomUser.objects.filter(assigned_projects__in=projects).distinct()
    
    # Calculate statistics
    stats = {
        'total_projects': projects.count(),
        'active_projects': projects.filter(status='in-progress').count(),
        'completed_projects': projects.filter(status='completed').count(),
        'total_tasks': tasks.count(),
        'completed_tasks': tasks.filter(status='completed').count(),
        'in_progress_tasks': tasks.filter(status='in-progress').count(),
        'overdue_tasks': tasks.filter(
            due_date__lt=timezone.now().date(),
            status__in=['not-started', 'in-progress']
        ).count(),
        'total_users': users.count(),
        'active_users': users.filter(status='active').count(),
        'users_by_role': {
            'admin': users.filter(role='admin').count(),
            'manager': users.filter(role='manager').count(),
            'incharge': users.filter(role='incharge').count(),
            'executive': users.filter(role='executive').count(),
        }
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_hierarchy(request, project_id):
    """Get project hierarchy with blocks, floors, and units completion status"""
    try:
        project = Project.objects.get(id=project_id)
        
        # Check if user has access to this project
        user = request.user
        if user.role != 'admin' and not (project.manager == user or user in project.team_members.all()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        tasks = Task.objects.filter(project=project)
        
        # Group tasks by building, floor, and unit
        hierarchy = {'blocks': [], 'overallCompletion': 0}
        blocks_data = {}
        
        for task in tasks:
            building = task.building or 'General'
            floor = task.floor or 'General'
            unit = task.unit or 'General'
            unit_type = task.unit_type or 'General'
            
            if building not in blocks_data:
                blocks_data[building] = {'floors': {}}
            
            if floor not in blocks_data[building]['floors']:
                blocks_data[building]['floors'][floor] = {'units': {}}
            
            unit_key = f"{unit}-{unit_type}"
            if unit_key not in blocks_data[building]['floors'][floor]['units']:
                blocks_data[building]['floors'][floor]['units'][unit_key] = {
                    'unitNumber': unit,
                    'unitType': unit_type,
                    'tasks': [],
                    'completionPercentage': 0
                }
            
            blocks_data[building]['floors'][floor]['units'][unit_key]['tasks'].append({
                'id': task.id,
                'title': task.title,
                'status': task.status,
                'progress': task.progress
            })
        
        # Calculate completion percentages
        total_completion = 0
        total_blocks = 0
        
        for block_name, block_data in blocks_data.items():
            block_completion = 0
            total_floors = 0
            
            floors_list = []
            for floor_name, floor_data in block_data['floors'].items():
                floor_completion = 0
                total_units = 0
                
                units_list = []
                for unit_key, unit_data in floor_data['units'].items():
                    if unit_data['tasks']:
                        unit_completion = sum(task['progress'] for task in unit_data['tasks']) / len(unit_data['tasks'])
                    else:
                        unit_completion = 0
                    
                    unit_data['completionPercentage'] = unit_completion
                    units_list.append(unit_data)
                    floor_completion += unit_completion
                    total_units += 1
                
                if total_units > 0:
                    floor_completion = floor_completion / total_units
                
                floors_list.append({
                    'floorNumber': floor_name,
                    'units': units_list,
                    'completionPercentage': floor_completion
                })
                
                block_completion += floor_completion
                total_floors += 1
            
            if total_floors > 0:
                block_completion = block_completion / total_floors
            
            hierarchy['blocks'].append({
                'blockName': block_name,
                'floors': floors_list,
                'completionPercentage': block_completion
            })
            
            total_completion += block_completion
            total_blocks += 1
        
        if total_blocks > 0:
            hierarchy['overallCompletion'] = total_completion / total_blocks
        
        return Response(hierarchy)
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_dependencies(request, task_id):
    """Get task dependencies and dependent tasks"""
    try:
        task = Task.objects.get(id=task_id)
        
        dependencies = []
        for dep in task.dependencies.all():
            dependencies.append({
                'id': dep.id,
                'title': dep.title,
                'status': dep.status,
                'progress': dep.progress
            })
        
        dependents = []
        for dep in task.dependent_tasks.all():
            dependents.append({
                'id': dep.id,
                'title': dep.title,
                'status': dep.status,
                'progress': dep.progress
            })
        
        # Check if task can start
        can_start = task.can_start_without_dependency or all(
            dep.status == 'completed' for dep in task.dependencies.all()
        )
        
        return Response({
            'dependencies': dependencies,
            'dependents': dependents,
            'canStart': can_start
        })
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)


# File Upload Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_task_file(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        file = request.FILES.get('file')
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        task_file = TaskFile.objects.create(
            task=task,
            file=file,
            filename=file.name,
            uploaded_by=request.user
        )
        
        serializer = TaskFileSerializer(task_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_task_photo(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        photo = request.FILES.get('photo')
        caption = request.data.get('caption', '')
        
        if not photo:
            return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        task_photo = TaskPhoto.objects.create(
            task=task,
            photo=photo,
            caption=caption,
            uploaded_by=request.user
        )
        
        serializer = TaskPhotoSerializer(task_photo)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)