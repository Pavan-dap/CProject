from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('incharge', 'Incharge'),
        ('executive', 'Executive'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='executive')
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    department = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, unique=True, blank=True)
    join_date = models.DateField(blank=True, null=True)
    reporting_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    
    def __str__(self):
        return f"{self.user.username} Profile"