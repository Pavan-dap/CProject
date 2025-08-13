from django.contrib import admin
from .models import Task, TaskDependency, TaskComment, TaskFile, TaskPhoto, TaskStatusHistory

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assigned_to', 'status', 'priority', 'progress', 'due_date']
    list_filter = ['status', 'priority', 'project', 'assigned_to']
    search_fields = ['title', 'description', 'project__name']
    date_hierarchy = 'created_at'

@admin.register(TaskDependency)
class TaskDependencyAdmin(admin.ModelAdmin):
    list_display = ['task', 'depends_on', 'created_at']
    list_filter = ['created_at']
    search_fields = ['task__title', 'depends_on__title']

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'comment_type', 'created_at']
    list_filter = ['comment_type', 'created_at']
    search_fields = ['task__title', 'user__username', 'text']

@admin.register(TaskFile)
class TaskFileAdmin(admin.ModelAdmin):
    list_display = ['task', 'file_name', 'file_type', 'uploaded_by', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['task__title', 'file_name']

@admin.register(TaskPhoto)
class TaskPhotoAdmin(admin.ModelAdmin):
    list_display = ['task', 'caption', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['task__title', 'caption']