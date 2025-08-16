from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.utils import timezone
from .models import Task, TaskComment, TaskFile, TaskPhoto, TaskDependency
from .serializers import (
    TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer, TaskListSerializer,
    TaskCommentSerializer, TaskFileSerializer, TaskPhotoSerializer
)
from .filters import TaskFilter

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TaskFilter
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskListSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.select_related(
            'project', 'assigned_to', 'assigned_by', 'hierarchy'
        ).prefetch_related('comments', 'files', 'photos')
        
        # Filter based on user role
        if user.role == 'admin':
            pass  # Admin can see all tasks
        elif user.role == 'manager':
            queryset = queryset.filter(
                Q(project__manager=user) | 
                Q(project__assignments__user=user, project__assignments__is_active=True) |
                Q(assigned_to=user)
            ).distinct()
        else:
            queryset = queryset.filter(
                Q(assigned_to=user) |
                Q(project__assignments__user=user, project__assignments__is_active=True)
            ).distinct()
        
        return queryset.order_by('-created_at')

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.select_related(
            'project', 'assigned_to', 'assigned_by', 'hierarchy'
        ).prefetch_related('comments', 'files', 'photos')
        
        if user.role == 'admin':
            return queryset
        elif user.role == 'manager':
            return queryset.filter(
                Q(project__manager=user) | 
                Q(project__assignments__user=user, project__assignments__is_active=True) |
                Q(assigned_to=user)
            ).distinct()
        else:
            return queryset.filter(
                Q(assigned_to=user) |
                Q(project__assignments__user=user, project__assignments__is_active=True)
            ).distinct()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_task_comment(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            task.project.manager != user and 
            task.assigned_to != user and 
            not task.project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        comment = TaskComment.objects.create(
            task=task,
            user=user,
            text=request.data.get('text'),
            comment_type=request.data.get('comment_type', 'comment')
        )
        
        serializer = TaskCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_comments(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            task.project.manager != user and 
            task.assigned_to != user and 
            not task.project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        comments = TaskComment.objects.filter(task=task).order_by('-created_at')
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data)
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_task_file(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            task.project.manager != user and 
            task.assigned_to != user and 
            not task.project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        task_file = TaskFile.objects.create(
            task=task,
            file=file_obj,
            file_name=file_obj.name,
            file_type=file_obj.content_type,
            uploaded_by=user
        )
        
        serializer = TaskFileSerializer(task_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_task_photo(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            task.project.manager != user and 
            task.assigned_to != user and 
            not task.project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        photo = request.FILES.get('photo')
        if not photo:
            return Response({'error': 'No photo provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        task_photo = TaskPhoto.objects.create(
            task=task,
            photo=photo,
            caption=request.data.get('caption', ''),
            location_lat=request.data.get('location_lat'),
            location_lng=request.data.get('location_lng'),
            uploaded_by=user
        )
        
        serializer = TaskPhotoSerializer(task_photo)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_dependencies(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        
        # Check permissions
        user = request.user
        if (user.role not in ['admin'] and 
            task.project.manager != user and 
            task.assigned_to != user and 
            not task.project.assignments.filter(user=user, is_active=True).exists()):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        dependencies = Task.objects.filter(dependents__task=task)
        dependents = Task.objects.filter(dependencies__depends_on=task)
        
        dep_serializer = TaskListSerializer(dependencies, many=True)
        dependent_serializer = TaskListSerializer(dependents, many=True)
        
        return Response({
            'dependencies': dep_serializer.data,
            'dependents': dependent_serializer.data,
            'can_start': all(dep.status == 'completed' for dep in dependencies) or task.can_start_without_dependency
        })
        
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_stats(request):
    user = request.user
    
    if user.role == 'admin':
        tasks = Task.objects.all()
    elif user.role == 'manager':
        tasks = Task.objects.filter(
            Q(project__manager=user) | 
            Q(project__assignments__user=user, project__assignments__is_active=True) |
            Q(assigned_to=user)
        ).distinct()
    else:
        tasks = Task.objects.filter(
            Q(assigned_to=user) |
            Q(project__assignments__user=user, project__assignments__is_active=True)
        ).distinct()
    
    today = timezone.now().date()
    
    stats = {
        'total_tasks': tasks.count(),
        'by_status': {
            'not_started': tasks.filter(status='not-started').count(),
            'in_progress': tasks.filter(status='in-progress').count(),
            'completed': tasks.filter(status='completed').count(),
            'on_hold': tasks.filter(status='on-hold').count(),
        },
        'by_priority': {
            'low': tasks.filter(priority='low').count(),
            'medium': tasks.filter(priority='medium').count(),
            'high': tasks.filter(priority='high').count(),
        },
        'overdue': tasks.filter(due_date__lt=today, status__in=['not-started', 'in-progress']).count(),
        'due_today': tasks.filter(due_date=today, status__in=['not-started', 'in-progress']).count(),
        'average_progress': tasks.aggregate(avg_progress=Avg('progress'))['avg_progress'] or 0,
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_tasks(request):
    """Get tasks assigned to the current user"""
    tasks = Task.objects.filter(assigned_to=request.user).order_by('-created_at')
    serializer = TaskListSerializer(tasks, many=True)
    return Response(serializer.data)
