from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from .models import User, Project, Task
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Only admin can create/update/delete users

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('id')
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('id')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
