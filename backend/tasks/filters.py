import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=Task.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Task.PRIORITY_CHOICES)
    assigned_to = django_filters.NumberFilter()
    project = django_filters.NumberFilter()
    due_date = django_filters.DateFromToRangeFilter()
    created_at = django_filters.DateFromToRangeFilter()
    
    class Meta:
        model = Task
        fields = ['title', 'status', 'priority', 'assigned_to', 'project']