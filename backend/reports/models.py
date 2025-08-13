from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project

User = get_user_model()

class Report(models.Model):
    REPORT_TYPES = [
        ('project_status', 'Project Status Report'),
        ('task_summary', 'Task Summary Report'),
        ('progress_report', 'Progress Report'),
        ('dependency_report', 'Dependency Report'),
    ]
    
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports', null=True, blank=True)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    generated_at = models.DateTimeField(auto_now_add=True)
    file_path = models.CharField(max_length=500, blank=True)
    is_public = models.BooleanField(default=False)
    public_link = models.CharField(max_length=100, unique=True, blank=True)
    
    class Meta:
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.title} - {self.generated_at}"

class ReportShare(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='shares')
    shared_with_email = models.EmailField()
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE)
    shared_at = models.DateTimeField(auto_now_add=True)
    access_count = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.report.title} shared with {self.shared_with_email}"