from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Project, Task, TaskComment, TaskFile, TaskPhoto, ProjectStatusReport


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status', 'join_date')
    list_filter = ('role', 'status', 'join_date')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone', 'status', 'join_date', 'avatar')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'phone', 'status', 'join_date')
        }),
    )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'location', 'manager', 'status', 'progress', 'start_date', 'end_date')
    list_filter = ('status', 'start_date', 'end_date', 'manager')
    search_fields = ('name', 'client', 'location')
    filter_horizontal = ('team_members',)
    date_hierarchy = 'start_date'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assigned_to', 'status', 'priority', 'progress', 'due_date')
    list_filter = ('status', 'priority', 'project', 'assigned_to', 'due_date')
    search_fields = ('title', 'description', 'project__name')
    filter_horizontal = ('dependencies',)
    date_hierarchy = 'due_date'


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'comment_type', 'created_at')
    list_filter = ('comment_type', 'created_at')
    search_fields = ('task__title', 'user__username', 'text')


@admin.register(TaskFile)
class TaskFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'task', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('filename', 'task__title')


@admin.register(TaskPhoto)
class TaskPhotoAdmin(admin.ModelAdmin):
    list_display = ('task', 'caption', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('task__title', 'caption')


@admin.register(ProjectStatusReport)
class ProjectStatusReportAdmin(admin.ModelAdmin):
    list_display = ('project', 'report_date', 'overall_completion', 'generated_by', 'created_at')
    list_filter = ('report_date', 'created_at')
    search_fields = ('project__name',)