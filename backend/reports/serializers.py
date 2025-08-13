from rest_framework import serializers
from .models import Report, ReportShare
from accounts.serializers import UserSerializer
from projects.serializers import ProjectSerializer

class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'report_type', 'project', 'project_name',
            'generated_by', 'generated_by_name', 'generated_at',
            'file_path', 'is_public', 'public_link'
        ]

class ReportShareSerializer(serializers.ModelSerializer):
    shared_by_name = serializers.CharField(source='shared_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportShare
        fields = [
            'id', 'report', 'shared_with_email', 'shared_by', 'shared_by_name',
            'shared_at', 'access_count', 'last_accessed'
        ]