from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'avatar')}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'employee_id', 'join_date']
    list_filter = ['department', 'join_date']
    search_fields = ['user__username', 'employee_id']