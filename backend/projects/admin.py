from django.contrib import admin
from .models import User, Project, Task

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id','username','email','role','status','is_staff','is_active')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id','name','client','status','progress','manager')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id','title','project','assigned_to','status','priority','due_date')
