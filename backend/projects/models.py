from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on-hold', 'On Hold'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    client = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    start_date = models.DateField()
    end_date = models.DateField()
    buildings = models.IntegerField(default=1)
    floors = models.IntegerField(default=1)
    units = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    budget = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_projects')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class ProjectAssignment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='assignments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_projects')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['project', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.project.name}"

class ProjectHierarchy(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='hierarchy')
    block_name = models.CharField(max_length=100)
    floor_number = models.IntegerField()
    unit_number = models.CharField(max_length=50)
    unit_type = models.CharField(max_length=20, choices=[
        ('1BHK', '1BHK'),
        ('2BHK', '2BHK'),
        ('3BHK', '3BHK'),
        ('4BHK', '4BHK'),
        ('5BHK', '5BHK'),
    ])
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    class Meta:
        unique_together = ['project', 'block_name', 'floor_number', 'unit_number']
        ordering = ['block_name', 'floor_number', 'unit_number']
    
    def __str__(self):
        return f"{self.project.name} - {self.block_name} - Floor {self.floor_number} - Unit {self.unit_number}"