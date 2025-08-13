from rest_framework import serializers
from .models import Project, ProjectAssignment, ProjectHierarchy
from accounts.serializers import UserSerializer

class ProjectHierarchySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectHierarchy
        fields = ['id', 'block_name', 'floor_number', 'unit_number', 'unit_type', 'completion_percentage']

class ProjectAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectAssignment
        fields = ['id', 'user', 'assigned_by', 'assigned_at', 'is_active']

class ProjectSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assignments = ProjectAssignmentSerializer(many=True, read_only=True)
    hierarchy = ProjectHierarchySerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'client', 'location', 'start_date', 'end_date',
            'buildings', 'floors', 'units', 'status', 'progress', 'budget',
            'manager', 'manager_name', 'created_by', 'created_by_name',
            'assignments', 'hierarchy', 'task_count', 'completed_tasks',
            'created_at', 'updated_at'
        ]
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='completed').count()

class ProjectHierarchyDetailSerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectHierarchy
        fields = ['id', 'block_name', 'floor_number', 'unit_number', 'unit_type', 'completion_percentage', 'tasks']
    
    def get_tasks(self, obj):
        from tasks.serializers import TaskSerializer
        tasks = obj.tasks.all()
        return TaskSerializer(tasks, many=True).data