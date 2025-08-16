from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

class Report(models.Model):
    REPORT_TYPES = [
        ('project_status', 'Project Status Report'),
        ('task_progress', 'Task Progress Report'),
        ('user_performance', 'User Performance Report'),
        ('project_summary', 'Project Summary Report'),
        ('gantt_chart', 'Gantt Chart Report'),
    ]
    
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports', blank=True, null=True)
    data = models.JSONField(default=dict)  # Store report data
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    generated_at = models.DateTimeField(auto_now_add=True)
    is_scheduled = models.BooleanField(default=False)
    schedule_frequency = models.CharField(max_length=20, blank=True, null=True)  # daily, weekly, monthly
    
    class Meta:
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_report_type_display()}"

class ReportSchedule(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=Report.REPORT_TYPES)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, blank=True, null=True)
    recipients = models.ManyToManyField(User, related_name='report_subscriptions')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_schedules')
    created_at = models.DateTimeField(auto_now_add=True)
    last_generated = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.frequency})"
