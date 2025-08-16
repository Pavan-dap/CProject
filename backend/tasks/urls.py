from django.urls import path
from . import views

urlpatterns = [
    path('', views.TaskListCreateView.as_view(), name='task-list'),
    path('<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('<int:task_id>/comments/', views.task_comments, name='task-comments'),
    path('<int:task_id>/comments/add/', views.add_task_comment, name='add-task-comment'),
    path('<int:task_id>/files/upload/', views.upload_task_file, name='upload-task-file'),
    path('<int:task_id>/photos/upload/', views.upload_task_photo, name='upload-task-photo'),
    path('<int:task_id>/dependencies/', views.task_dependencies, name='task-dependencies'),
    path('stats/', views.task_stats, name='task-stats'),
    path('my-tasks/', views.my_tasks, name='my-tasks'),
]
