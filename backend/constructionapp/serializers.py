from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, Project, Task, TaskComment, TaskFile, TaskPhoto, ProjectStatusReport


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    projects = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                 'phone', 'status', 'join_date', 'avatar', 'password', 'projects']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_projects(self, obj):
        return [project.name for project in obj.assigned_projects.all()]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            try:
                user = CustomUser.objects.get(email=email)
                user = authenticate(username=user.username, password=password)
                if user:
                    if user.status == 'active':
                        data['user'] = user
                        return data
                    else:
                        raise serializers.ValidationError('User account is inactive.')
                else:
                    raise serializers.ValidationError('Invalid credentials.')
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Email and password are required.')


class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'text', 'comment_type', 'user', 'user_name', 'created_at']
        read_only_fields = ['user', 'created_at']


class TaskFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaskFile
        fields = ['id', 'file', 'filename', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']


class TaskPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = TaskPhoto
        fields = ['id', 'photo', 'caption', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']


class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    files = TaskFileSerializer(many=True, read_only=True)
    photos = TaskPhotoSerializer(many=True, read_only=True)
    dependencies_list = serializers.SerializerMethodField()
    dependent_tasks_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'project_name', 
                 'assigned_to', 'assigned_to_name', 'assigned_by', 'assigned_by_name',
                 'status', 'progress', 'priority', 'due_date', 'created_date',
                 'building', 'floor', 'unit', 'unit_type', 'dependencies',
                 'dependencies_list', 'dependent_tasks_list', 'can_start_without_dependency',
                 'estimated_hours', 'actual_hours', 'comments', 'files', 'photos',
                 'created_at', 'updated_at']
        read_only_fields = ['created_date', 'created_at', 'updated_at']
    
    def get_dependencies_list(self, obj):
        return [{'id': dep.id, 'title': dep.title, 'status': dep.status} 
                for dep in obj.dependencies.all()]
    
    def get_dependent_tasks_list(self, obj):
        return [{'id': dep.id, 'title': dep.title, 'status': dep.status} 
                for dep in obj.dependent_tasks.all()]


class ProjectSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    team_members_list = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    tasks = TaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'location', 'client', 'description', 'start_date', 
                 'end_date', 'buildings', 'floors', 'units', 'manager', 'manager_name',
                 'progress', 'status', 'team_members', 'team_members_list', 
                 'tasks_count', 'completed_tasks_count', 'tasks', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_team_members_list(self, obj):
        return [{'id': member.id, 'name': member.get_full_name(), 'role': member.role} 
                for member in obj.team_members.all()]
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(status='completed').count()


class ProjectStatusReportSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectStatusReport
        fields = ['id', 'project', 'project_name', 'generated_by', 'generated_by_name',
                 'report_date', 'overall_completion', 'total_tasks', 'completed_tasks',
                 'in_progress_tasks', 'pending_tasks', 'overdue_tasks', 'report_data',
                 'created_at']
        read_only_fields = ['generated_by', 'created_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    in_progress_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    users_by_role = serializers.DictField()