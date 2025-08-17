from rest_framework import serializers
from .models import User, Project, Task


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'




class UserSerializer(serializers.ModelSerializer):
    # Write-only fields for password creation and confirmation
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    projects = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 
                  'role', 'phone', 'status', 'join_date', 'first_name', 'last_name', 'projects']
        read_only_fields = ['id', 'join_date']

    def get_projects(self, obj):
        from .models import Project

        # managed_ids = Project.objects.filter(manager_id=obj.id).values_list("id", flat=True)
        task_ids = Project.objects.filter(tasks__assigned_to_id=obj.id).values_list("id", flat=True)

        # project_ids = set(managed_ids) | set(task_ids)
        project_ids = set(task_ids)

        projects = Project.objects.filter(id__in=project_ids)

        return [{"id": p.id, "name": p.name} for p in projects]

    def validate(self, data):
        # When creating a new user
        if self.instance is None:
            if 'password' not in data or not data['password']:
                raise serializers.ValidationError({"password": "Password is required."})
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        # When updating an existing user
        else:
            if data.get('password') and data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        confirm_password = validated_data.pop('confirm_password', None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.confirm_password = confirm_password  # Store in DB
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        confirm_password = validated_data.pop('confirm_password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        instance.confirm_password = confirm_password  # Update in DB
        instance.save()
        return instance
