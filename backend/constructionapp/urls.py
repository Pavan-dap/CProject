from django.urls import path
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    
    # User Management URLs
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Project Management URLs
    path('projects/', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/hierarchy/', views.project_hierarchy, name='project-hierarchy'),
    
    # Task Management URLs
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/dependencies/', views.task_dependencies, name='task-dependencies'),
    path('tasks/<int:task_id>/comments/', views.TaskCommentListCreateView.as_view(), name='task-comments'),
    path('tasks/<int:task_id>/upload-file/', views.upload_task_file, name='upload-task-file'),
    path('tasks/<int:task_id>/upload-photo/', views.upload_task_photo, name='upload-task-photo'),
    
    # Dashboard and Statistics URLs
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]