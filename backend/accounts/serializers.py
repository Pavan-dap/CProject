from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'avatar', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'department', 'employee_id', 'join_date', 'reporting_manager']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Unable to login with provided credentials.')
        else:
            raise serializers.ValidationError('Must include username and password.')
        
        return data

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user