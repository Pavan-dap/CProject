from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from .models import Project, ProjectAssignment, ProjectHierarchy
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer, ProjectListSerializer,
    ProjectAssignmentSerializer, ProjectHierarchySerializer
)

class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateSerializer
        return ProjectListSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Project.objects.all()
        
        # Filter based on user role
        if user.role == 'admin':
            pass  # Admin can see all projects
        elif user.role == 'manager':
            queryset = queryset.filter(
                Q(manager=user) | Q(assignments__user=user)
            ).distinct()
        else:
            queryset = queryset.filter(assignments__user=user).distinct()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Project.objects.all()
        elif user.role == 'manager':
            return Project.objects.filter(
                Q(manager=user) | Q(assignments__user=user)
            ).distinct()
        else:
            return Project.objects.filter(assignments__user=user).distinct()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_user_to_project(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check permissions
        if request.user.role not in ['admin', 'manager'] and project.manager != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        assignment, created = ProjectAssignment.objects.get_or_create(
            project=project,
            user_id=user_id,
            defaults={'assigned_by': request.user}
        )
        
        if not created:
            assignment.is_active = True
            assignment.save()
        
        serializer = ProjectAssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_user_from_project(request, project_id, user_id):
    try:
        project = Project.objects.get(id=project_id)
        
        # Check permissions
        if request.user.role not in ['admin', 'manager'] and project.manager != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        assignment = ProjectAssignment.objects.get(project=project, user_id=user_id)
        assignment.is_active = False
        assignment.save()
        
        return Response({'message': 'User removed from project'})
        
    except (Project.DoesNotExist, ProjectAssignment.DoesNotExist):
        return Response({'error': 'Project or assignment not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_hierarchy(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['admin'] and project.manager != user and not project.assignments.filter(user=user, is_active=True).exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        hierarchy = ProjectHierarchy.objects.filter(project=project)
        serializer = ProjectHierarchySerializer(hierarchy, many=True)
        
        # Group by blocks and floors
        blocks_data = {}
        for item in serializer.data:
            block_name = item['block_name']
            floor_number = item['floor_number']
            
            if block_name not in blocks_data:
                blocks_data[block_name] = {}
            
            if floor_number not in blocks_data[block_name]:
                blocks_data[block_name][floor_number] = []
            
            blocks_data[block_name][floor_number].append(item)
        
        return Response({
            'project_id': project_id,
            'blocks': blocks_data,
            'raw_data': serializer.data
        })
        
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_stats(request):
    user = request.user
    
    if user.role == 'admin':
        projects = Project.objects.all()
    elif user.role == 'manager':
        projects = Project.objects.filter(
            Q(manager=user) | Q(assignments__user=user)
        ).distinct()
    else:
        projects = Project.objects.filter(assignments__user=user).distinct()
    
    stats = {
        'total_projects': projects.count(),
        'by_status': {
            'planning': projects.filter(status='planning').count(),
            'in_progress': projects.filter(status='in-progress').count(),
            'completed': projects.filter(status='completed').count(),
            'on_hold': projects.filter(status='on-hold').count(),
        },
        'average_progress': projects.aggregate(avg_progress=Avg('progress'))['avg_progress'] or 0,
        'total_units': sum(p.units for p in projects),
    }
    
    return Response(stats)
