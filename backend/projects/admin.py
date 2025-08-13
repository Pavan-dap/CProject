from django.contrib import admin
from .models import Project, ProjectAssignment, ProjectHierarchy

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'client', 'location', 'status', 'progress', 'manager', 'created_at']
    list_filter = ['status', 'manager', 'created_at']
    search_fields = ['name', 'client', 'location']
    date_hierarchy = 'created_at'

@admin.register(ProjectAssignment)
class ProjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'assigned_by', 'assigned_at', 'is_active']
    list_filter = ['is_active', 'assigned_at']
    search_fields = ['project__name', 'user__username']

@admin.register(ProjectHierarchy)
class ProjectHierarchyAdmin(admin.ModelAdmin):
    list_display = ['project', 'block_name', 'floor_number', 'unit_number', 'unit_type', 'completion_percentage']
    list_filter = ['project', 'block_name', 'unit_type']
    search_fields = ['project__name', 'block_name', 'unit_number']