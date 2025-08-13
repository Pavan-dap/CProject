from django.contrib import admin
from .models import Report, ReportShare

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['title', 'report_type', 'project', 'generated_by', 'generated_at', 'is_public']
    list_filter = ['report_type', 'is_public', 'generated_at']
    search_fields = ['title', 'project__name', 'generated_by__username']
    date_hierarchy = 'generated_at'

@admin.register(ReportShare)
class ReportShareAdmin(admin.ModelAdmin):
    list_display = ['report', 'shared_with_email', 'shared_by', 'shared_at', 'access_count']
    list_filter = ['shared_at']
    search_fields = ['report__title', 'shared_with_email', 'shared_by__username']