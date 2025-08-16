from rest_framework import serializers
from .models import Report, ReportSchedule
from accounts.serializers import UserSerializer
from projects.serializers import ProjectSerializer

class ReportSerializer(serializers.ModelSerializer):
    generated_by = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'title', 'report_type', 'project', 'data', 'generated_by',
                 'generated_at', 'is_scheduled', 'schedule_frequency']
        read_only_fields = ['generated_at', 'generated_by']

class ReportCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Report
        fields = ['title', 'report_type', 'project_id', 'data']
    
    def create(self, validated_data):
        project_id = validated_data.pop('project_id', None)
        if project_id:
            from projects.models import Project
            project = Project.objects.get(id=project_id)
            validated_data['project'] = project
        
        validated_data['generated_by'] = self.context['request'].user
        return Report.objects.create(**validated_data)

class ReportScheduleSerializer(serializers.ModelSerializer):
    recipients = UserSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    
    class Meta:
        model = ReportSchedule
        fields = ['id', 'name', 'report_type', 'frequency', 'project', 'recipients',
                 'created_by', 'created_at', 'last_generated', 'is_active']
        read_only_fields = ['created_at', 'last_generated', 'created_by']
