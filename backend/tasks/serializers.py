from rest_framework import serializers
from .models import Task, TaskDependency, TaskComment, TaskFile, TaskPhoto, TaskStatusHistory
from accounts.serializers import UserSerializer
from projects.serializers import ProjectSerializer, ProjectHierarchySerializer

class TaskDependencySerializer(serializers.ModelSerializer):
    depends_on_task = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskDependency
        fields = ['id', 'depends_on', 'depends_on_task', 'created_at']
    
    def get_depends_on_task(self, obj):
        return {
            'id': obj.depends_on.id,
            'title': obj.depends_on.title,
            'status': obj.depends_on.status,
            'progress': obj.depends_on.progress
        }

class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'text', 'comment_type', 'user', 'user_name', 'created_at']

class TaskFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaskFile
        fields = ['id', 'file', 'file_name', 'file_type', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']

class TaskPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaskPhoto
        fields = ['id', 'photo', 'caption', 'location_lat', 'location_lng', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    dependencies = TaskDependencySerializer(many=True, read_only=True)
    dependents = serializers.SerializerMethodField()
    comments = TaskCommentSerializer(many=True, read_only=True)
    files = TaskFileSerializer(many=True, read_only=True)
    photos = TaskPhotoSerializer(many=True, read_only=True)
    can_start = serializers.SerializerMethodField()
    hierarchy_details = ProjectHierarchySerializer(source='hierarchy', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_name', 'hierarchy', 'hierarchy_details',
            'assigned_to', 'assigned_to_name', 'assigned_by', 'assigned_by_name',
            'status', 'priority', 'progress', 'estimated_hours', 'actual_hours',
            'start_date', 'due_date', 'completed_date', 'can_start_without_dependency',
            'dependencies', 'dependents', 'comments', 'files', 'photos', 'can_start',
            'created_at', 'updated_at'
        ]
    
    def get_dependents(self, obj):
        dependents = TaskDependency.objects.filter(depends_on=obj)
        return [{
            'id': dep.task.id,
            'title': dep.task.title,
            'status': dep.task.status,
            'progress': dep.task.progress
        } for dep in dependents]
    
    def get_can_start(self, obj):
        if obj.can_start_without_dependency:
            return True
        
        dependencies = obj.dependencies.all()
        if not dependencies.exists():
            return True
        
        return all(dep.depends_on.status == 'completed' for dep in dependencies)

class TaskStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaskStatusHistory
        fields = ['id', 'old_status', 'new_status', 'old_progress', 'new_progress', 'changed_by', 'changed_by_name', 'changed_at', 'notes']