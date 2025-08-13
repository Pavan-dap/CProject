from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch
from .models import Task, TaskDependency, TaskComment, TaskFile, TaskPhoto
from .serializers import TaskSerializer, TaskCommentSerializer, TaskFileSerializer, TaskPhotoSerializer
from .filters import TaskFilter

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TaskFilter
    
    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.select_related(
            'project', 'assigned_to', 'assigned_by', 'hierarchy'
        ).prefetch_related(
            'dependencies__depends_on',
            'comments__user',
            'files',
            'photos'
        )
        
        # Filter based on user role
        if user.role == 'admin':
            return queryset
        elif user.role == 'manager':
            return queryset.filter(project__manager=user)
        elif user.role == 'incharge':
            return queryset.filter(project__assignments__user=user, project__assignments__is_active=True)
        elif user.role == 'executive':
            return queryset.filter(assigned_to=user)
        
        return queryset.none()
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upload_file(self, request, pk=None):
        task = self.get_object()
        serializer = TaskFileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def upload_photo(self, request, pk=None):
        task = self.get_object()
        serializer = TaskPhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_dependency(self, request, pk=None):
        task = self.get_object()
        depends_on_id = request.data.get('depends_on_id')
        
        try:
            depends_on_task = Task.objects.get(id=depends_on_id)
            dependency, created = TaskDependency.objects.get_or_create(
                task=task,
                depends_on=depends_on_task
            )
            
            if created:
                return Response({'message': 'Dependency added successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'Dependency already exists'}, status=status.HTTP_200_OK)
                
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'])
    def remove_dependency(self, request, pk=None):
        task = self.get_object()
        depends_on_id = request.data.get('depends_on_id')
        
        try:
            dependency = TaskDependency.objects.get(task=task, depends_on_id=depends_on_id)
            dependency.delete()
            return Response({'message': 'Dependency removed successfully'}, status=status.HTTP_200_OK)
        except TaskDependency.DoesNotExist:
            return Response({'error': 'Dependency not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def gantt_data(self, request):
        tasks = self.get_queryset()
        gantt_data = []
        
        for task in tasks:
            dependencies = list(task.dependencies.values_list('depends_on_id', flat=True))
            
            gantt_data.append({
                'id': task.id,
                'title': task.title,
                'start': task.start_date or task.created_at.date(),
                'end': task.due_date,
                'progress': float(task.progress),
                'status': task.status,
                'priority': task.priority,
                'project_id': task.project.id,
                'project_name': task.project.name,
                'assigned_to': task.assigned_to.get_full_name(),
                'dependencies': dependencies,
                'can_start': self._can_task_start(task)
            })
        
        return Response(gantt_data)
    
    def _can_task_start(self, task):
        if task.can_start_without_dependency:
            return True
        
        dependencies = task.dependencies.all()
        if not dependencies.exists():
            return True
        
        return all(dep.depends_on.status == 'completed' for dep in dependencies)
    
    @action(detail=False, methods=['get'])
    def dependency_graph(self, request):
        tasks = self.get_queryset()
        nodes = []
        edges = []
        
        for task in tasks:
            nodes.append({
                'id': task.id,
                'title': task.title,
                'status': task.status,
                'progress': float(task.progress),
                'project_name': task.project.name
            })
            
            for dependency in task.dependencies.all():
                edges.append({
                    'from': dependency.depends_on.id,
                    'to': task.id
                })
        
        return Response({
            'nodes': nodes,
            'edges': edges
        })