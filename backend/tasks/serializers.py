from rest_framework import serializers
from .models import Task, TaskDependency, TaskComment, TaskFile, TaskPhoto, TaskStatusHistory
from accounts.serializers import UserSerializer
from projects.serializers import ProjectSerializer, ProjectHierarchySerializer

class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'text', 'comment_type', 'user', 'user_name', 'created_at']
        read_only_fields = ['created_at']

class TaskFileSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskFile
        fields = ['id', 'file', 'file_name', 'file_type', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class TaskPhotoSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskPhoto
        fields = ['id', 'photo', 'caption', 'location_lat', 'location_lng', 
                 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class TaskDependencySerializer(serializers.ModelSerializer):
    depends_on_title = serializers.CharField(source='depends_on.title', read_only=True)
    
    class Meta:
        model = TaskDependency
        fields = ['id', 'depends_on', 'depends_on_title', 'created_at']
        read_only_fields = ['created_at']

class TaskStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskStatusHistory
        fields = ['id', 'old_status', 'new_status', 'old_progress', 'new_progress',
                 'changed_by', 'changed_at', 'notes']
        read_only_fields = ['changed_at']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    hierarchy = ProjectHierarchySerializer(read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    files = TaskFileSerializer(many=True, read_only=True)
    photos = TaskPhotoSerializer(many=True, read_only=True)
    dependencies = TaskDependencySerializer(many=True, read_only=True)
    dependents = TaskDependencySerializer(many=True, read_only=True, source='dependents')
    status_history = TaskStatusHistorySerializer(many=True, read_only=True)
    can_start = serializers.SerializerMethodField()
    
    # Additional fields for frontend compatibility
    building = serializers.CharField(source='hierarchy.block_name', read_only=True)
    floor = serializers.CharField(read_only=True)
    unit = serializers.CharField(source='hierarchy.unit_number', read_only=True)
    unit_type = serializers.CharField(source='hierarchy.unit_type', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'hierarchy', 'assigned_to', 
                 'assigned_by', 'status', 'priority', 'progress', 'estimated_hours', 
                 'actual_hours', 'start_date', 'due_date', 'completed_date',
                 'can_start_without_dependency', 'created_at', 'updated_at',
                 'comments', 'files', 'photos', 'dependencies', 'dependents',
                 'status_history', 'can_start', 'building', 'floor', 'unit', 'unit_type']
        read_only_fields = ['created_at', 'updated_at', 'assigned_by']
    
    def get_can_start(self, obj):
        if obj.can_start_without_dependency:
            return True
        dependencies = obj.dependencies.all()
        if not dependencies:
            return True
        return all(dep.depends_on.status == 'completed' for dep in dependencies)
    
    def get_floor(self, obj):
        if obj.hierarchy:
            return f"Floor {obj.hierarchy.floor_number}"
        return None

class TaskCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField()
    assigned_to_id = serializers.IntegerField()
    hierarchy_id = serializers.IntegerField(required=False, allow_null=True)
    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'project_id', 'hierarchy_id', 'assigned_to_id',
                 'status', 'priority', 'progress', 'estimated_hours', 'start_date',
                 'due_date', 'can_start_without_dependency', 'dependencies']
    
    def create(self, validated_data):
        dependencies_data = validated_data.pop('dependencies', [])
        project_id = validated_data.pop('project_id')
        assigned_to_id = validated_data.pop('assigned_to_id')
        hierarchy_id = validated_data.pop('hierarchy_id', None)
        
        from projects.models import Project, ProjectHierarchy
        from accounts.models import User
        
        project = Project.objects.get(id=project_id)
        assigned_to = User.objects.get(id=assigned_to_id)
        hierarchy = ProjectHierarchy.objects.get(id=hierarchy_id) if hierarchy_id else None
        
        task = Task.objects.create(
            project=project,
            assigned_to=assigned_to,
            assigned_by=self.context['request'].user,
            hierarchy=hierarchy,
            **validated_data
        )
        
        # Create dependencies
        for dep_id in dependencies_data:
            TaskDependency.objects.create(
                task=task,
                depends_on_id=dep_id
            )
        
        return task

class TaskUpdateSerializer(serializers.ModelSerializer):
    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'progress', 
                 'estimated_hours', 'actual_hours', 'start_date', 'due_date',
                 'completed_date', 'can_start_without_dependency', 'dependencies']
    
    def update(self, instance, validated_data):
        dependencies_data = validated_data.pop('dependencies', None)
        
        # Store old values for history
        old_status = instance.status
        old_progress = instance.progress
        
        # Update instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set completed_date if status changed to completed
        if validated_data.get('status') == 'completed' and old_status != 'completed':
            from django.utils import timezone
            instance.completed_date = timezone.now().date()
        
        instance.save()
        
        # Create status history entry if status or progress changed
        if old_status != instance.status or old_progress != instance.progress:
            TaskStatusHistory.objects.create(
                task=instance,
                old_status=old_status,
                new_status=instance.status,
                old_progress=old_progress,
                new_progress=instance.progress,
                changed_by=self.context['request'].user
            )
        
        # Update dependencies if provided
        if dependencies_data is not None:
            instance.dependencies.all().delete()
            for dep_id in dependencies_data:
                TaskDependency.objects.create(
                    task=instance,
                    depends_on_id=dep_id
                )
        
        return instance

class TaskListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    building = serializers.CharField(source='hierarchy.block_name', read_only=True)
    floor = serializers.SerializerMethodField()
    unit = serializers.CharField(source='hierarchy.unit_number', read_only=True)
    unit_type = serializers.CharField(source='hierarchy.unit_type', read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'project_name', 'assigned_to_name', 'status', 
                 'priority', 'progress', 'due_date', 'building', 'floor', 'unit', 'unit_type']
    
    def get_floor(self, obj):
        if obj.hierarchy:
            return f"Floor {obj.hierarchy.floor_number}"
        return None
