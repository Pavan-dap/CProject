from django.db import models
from django.contrib.auth import get_user_model
from projects.models import Project, ProjectHierarchy

User = get_user_model()

class Task(models.Model):
    STATUS_CHOICES = [
        ('not-started', 'Not Started'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on-hold', 'On Hold'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    hierarchy = models.ForeignKey(ProjectHierarchy, on_delete=models.CASCADE, related_name='tasks', blank=True, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not-started')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    estimated_hours = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    actual_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    can_start_without_dependency = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.project.name}"

class TaskDependency(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependencies')
    depends_on = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='dependents')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['task', 'depends_on']
    
    def __str__(self):
        return f"{self.task.title} depends on {self.depends_on.title}"

class TaskComment(models.Model):
    COMMENT_TYPES = [
        ('comment', 'Comment'),
        ('status_update', 'Status Update'),
        ('dependency_update', 'Dependency Update'),
    ]
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPES, default='comment')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment on {self.task.title} by {self.user.username}"

class TaskFile(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='task_files/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.file_name} - {self.task.title}"

class TaskPhoto(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='task_photos/')
    caption = models.CharField(max_length=255, blank=True)
    location_lat = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    location_lng = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo for {self.task.title}"

class TaskStatusHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    old_progress = models.DecimalField(max_digits=5, decimal_places=2)
    new_progress = models.DecimalField(max_digits=5, decimal_places=2)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.task.title} status changed from {self.old_status} to {self.new_status}"