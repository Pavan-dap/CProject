from rest_framework import serializers
from .models import Project, ProjectAssignment, ProjectHierarchy
from accounts.serializers import UserSerializer

class ProjectHierarchySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectHierarchy
        fields = ['id', 'block_name', 'floor_number', 'unit_number', 'unit_type', 'completion_percentage']

class ProjectAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProjectAssignment
        fields = ['id', 'user', 'user_id', 'assigned_by', 'assigned_at', 'is_active']
        read_only_fields = ['assigned_at']

class ProjectSerializer(serializers.ModelSerializer):
    manager = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    assignments = ProjectAssignmentSerializer(many=True, read_only=True)
    hierarchy = ProjectHierarchySerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'client', 'location', 'start_date', 
                 'end_date', 'buildings', 'floors', 'units', 'status', 'progress', 
                 'budget', 'manager', 'created_by', 'created_at', 'updated_at',
                 'assignments', 'hierarchy', 'task_count', 'completed_task_count']
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_task_count(self, obj):
        return obj.tasks.filter(status='completed').count()

class ProjectCreateSerializer(serializers.ModelSerializer):
    manager_id = serializers.IntegerField()
    
    class Meta:
        model = Project
        fields = ['name', 'description', 'client', 'location', 'start_date', 
                 'end_date', 'buildings', 'floors', 'units', 'status', 'progress', 
                 'budget', 'manager_id']
    
    def create(self, validated_data):
        manager_id = validated_data.pop('manager_id')
        from accounts.models import User
        manager = User.objects.get(id=manager_id)
        validated_data['manager'] = manager
        validated_data['created_by'] = self.context['request'].user
        return Project.objects.create(**validated_data)

class ProjectListSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'client', 'location', 'status', 'progress', 
                 'start_date', 'end_date', 'units', 'manager_name', 'task_count']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
