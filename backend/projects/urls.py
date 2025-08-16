from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('<int:project_id>/assign/', views.assign_user_to_project, name='assign-user'),
    path('<int:project_id>/remove/<int:user_id>/', views.remove_user_from_project, name='remove-user'),
    path('<int:project_id>/hierarchy/', views.project_hierarchy, name='project-hierarchy'),
    path('stats/', views.project_stats, name='project-stats'),
]
