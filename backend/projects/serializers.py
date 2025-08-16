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

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 
                  'role', 'phone', 'status', 'join_date', 'first_name', 'last_name']
        read_only_fields = ['id', 'join_date']

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
        # Remove confirm_password before creating
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)  # hash password
        user.save()
        return user

    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
