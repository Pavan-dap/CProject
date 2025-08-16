from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReportListCreateView.as_view(), name='report-list'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
    path('project/<int:project_id>/status/', views.generate_project_status_report, name='project-status-report'),
    path('project/<int:project_id>/gantt/', views.generate_gantt_data, name='gantt-data'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]
