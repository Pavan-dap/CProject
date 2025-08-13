from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from .models import Project, ProjectAssignment, ProjectHierarchy
from .serializers import ProjectSerializer, ProjectAssignmentSerializer, ProjectHierarchyDetailSerializer
from .filters import ProjectFilter

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProjectFilter
    
    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.select_related('manager', 'created_by').prefetch_related('assignments', 'hierarchy')
        
        if user.role == 'admin':
            return queryset
        elif user.role == 'manager':
            return queryset.filter(manager=user)
        elif user.role == 'incharge':
            return queryset.filter(assignments__user=user, assignments__is_active=True)
        elif user.role == 'executive':
            return queryset.filter(tasks__assigned_to=user).distinct()
        
        return queryset.none()
    
    @action(detail=True, methods=['get'])
    def hierarchy(self, request, pk=None):
        project = self.get_object()
        hierarchy = ProjectHierarchy.objects.filter(project=project).order_by('block_name', 'floor_number', 'unit_number')
        serializer = ProjectHierarchyDetailSerializer(hierarchy, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def status_report(self, request, pk=None):
        project = self.get_object()
        
        # Calculate detailed statistics
        hierarchy_data = {}
        for item in project.hierarchy.all():
            block = item.block_name
            floor = item.floor_number
            
            if block not in hierarchy_data:
                hierarchy_data[block] = {}
            if floor not in hierarchy_data[block]:
                hierarchy_data[block][floor] = []
            
            hierarchy_data[block][floor].append({
                'unit_number': item.unit_number,
                'unit_type': item.unit_type,
                'completion_percentage': float(item.completion_percentage),
                'tasks': list(item.tasks.values('id', 'title', 'status', 'progress'))
            })
        
        # Calculate overall statistics
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(status='completed').count()
        in_progress_tasks = project.tasks.filter(status='in-progress').count()
        pending_tasks = project.tasks.filter(status='not-started').count()
        
        return Response({
            'project': ProjectSerializer(project).data,
            'hierarchy': hierarchy_data,
            'statistics': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'in_progress_tasks': in_progress_tasks,
                'pending_tasks': pending_tasks,
                'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            }
        })
    
    @action(detail=True, methods=['post'])
    def assign_user(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            from accounts.models import User
            user = User.objects.get(id=user_id)
            assignment, created = ProjectAssignment.objects.get_or_create(
                project=project,
                user=user,
                defaults={'assigned_by': request.user}
            )
            
            if created:
                return Response({'message': 'User assigned successfully'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'message': 'User already assigned'}, status=status.HTTP_200_OK)
                
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ProjectHierarchyViewSet(viewsets.ModelViewSet):
    queryset = ProjectHierarchy.objects.all()
    serializer_class = ProjectHierarchyDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = ProjectHierarchy.objects.select_related('project').prefetch_related('tasks')
        
        if user.role == 'admin':
            return queryset
        elif user.role == 'manager':
            return queryset.filter(project__manager=user)
        elif user.role == 'incharge':
            return queryset.filter(project__assignments__user=user, project__assignments__is_active=True)
        elif user.role == 'executive':
            return queryset.filter(tasks__assigned_to=user).distinct()
        
        return queryset.none()