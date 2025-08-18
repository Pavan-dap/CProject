from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('incharge', 'Incharge'),
        ('executive', 'Executive'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, default="active")
    join_date = models.DateField(auto_now_add=True)

    # ❗️ Not recommended unless you have a very specific (non-security) reason
    confirm_password = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on-hold', 'On Hold'),
    ]
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    client = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    buildings = models.IntegerField()
    floors = models.IntegerField()
    units = models.IntegerField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="managed_projects")
    progress = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning" )
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


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
    description = models.TextField(blank=True, null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="tasks")
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="assigned_tasks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not-started")
    progress = models.IntegerField(default=0)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    due_date = models.DateField()
    created_date = models.DateField(auto_now_add=True)
    building = models.CharField(max_length=100, blank=True, null=True)
    floor = models.CharField(max_length=100, blank=True, null=True)
    unit = models.CharField(max_length=100, blank=True, null=True)
    unit_type = models.CharField(max_length=20, blank=True, null=True)
    units_data = models.JSONField(default=dict)
    
    def __str__(self):
        return self.title
