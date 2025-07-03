from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import models
from rest_framework.permissions import AllowAny

from .models import (
    CustomUser, UserRole, Project, ProductionRecord, AccessLog,
    GasRecord, WorkFront, InventoryItem, Tool
)
from .serializers import (
    UserSerializer,
    ProjectSerializer, ProductionRecordSerializer,
    AccessLogSerializer, GasRecordSerializer,
    WorkFrontSerializer, InventoryItemSerializer, ToolSerializer
)
from .permissions import (
    IsAdmin, IsSupervisor, IsEmployee,
    IsAdminOrSupervisor, IsAdminOrSupervisorOrAssigned
)

# ---------------------------------------------------------------
#  🔐  AUTENTICACIÓN
# ---------------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['id_number'] = user.id_number
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = str(self.user.role)
        data['username'] = self.user.username
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Vista de registro de usuario
class RegisterUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = []

# ---------------------------------------------------------------
#  👥  USUARIOS
# ---------------------------------------------------------------

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return CustomUser.objects.all()
        if user.role == UserRole.SUPERVISOR:
            return CustomUser.objects.exclude(role=UserRole.ADMIN)
        return CustomUser.objects.filter(id=user.id)

# ---------------------------------------------------------------
#  📁  PROYECTOS
# ---------------------------------------------------------------

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrSupervisor]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Project.objects.all()  # Admin puede ver todos los proyectos
        if user.role == UserRole.SUPERVISOR:
            return Project.objects.filter(manager=user)  # Supervisor solo ve los proyectos que gestiona
        return Project.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.SUPERVISOR and not self.request.user.is_superuser:
            serializer.save(manager=self.request.user)
        else:
            serializer.save()

# ---------------------------------------------------------------
#  📊  PRODUCCIÓN
# ---------------------------------------------------------------

class ProductionRecordViewSet(viewsets.ModelViewSet):
    queryset = ProductionRecord.objects.all()
    serializer_class = ProductionRecordSerializer
    permission_classes = [IsAdminOrSupervisorOrAssigned]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return ProductionRecord.objects.all()  # Admin puede ver todos los registros
        if user.role == UserRole.SUPERVISOR:
            managed_projects = user.managed_projects.values_list('id', flat=True)
            supervised_projects = user.supervised_work_fronts.values_list('project_id', flat=True)
            return ProductionRecord.objects.filter(
                models.Q(project__in=managed_projects) |
                models.Q(project__in=supervised_projects)
            ).distinct()
        return ProductionRecord.objects.filter(employee=user)

# ---------------------------------------------------------------
#  🚪  ACCESOS
# ---------------------------------------------------------------

class AccessLogViewSet(viewsets.ModelViewSet):
    queryset = AccessLog.objects.all()
    serializer_class = AccessLogSerializer
    permission_classes = [IsAdminOrSupervisorOrAssigned]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role in [UserRole.ADMIN, UserRole.SUPERVISOR]:
            return AccessLog.objects.all()
        return AccessLog.objects.filter(employee=user)

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.EMPLOYEE:
            serializer.save(employee=self.request.user)
        else:
            serializer.save()

# ---------------------------------------------------------------
#  ⛽  REGISTROS DE COMBUSTIBLE
# ---------------------------------------------------------------

class GasRecordViewSet(viewsets.ModelViewSet):
    queryset = GasRecord.objects.all()
    serializer_class = GasRecordSerializer
    permission_classes = [IsAdminOrSupervisor]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

# ---------------------------------------------------------------
#  🏗️  FRENTES DE TRABAJO
# ---------------------------------------------------------------

class WorkFrontViewSet(viewsets.ModelViewSet):
    queryset = WorkFront.objects.all()
    serializer_class = WorkFrontSerializer
    permission_classes = [IsAdminOrSupervisor]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return WorkFront.objects.all()  # Admin puede ver todos los frentes de trabajo
        if user.role == UserRole.SUPERVISOR:
            return WorkFront.objects.filter(supervisor=user)  # Supervisor solo ve los frentes que supervisa
        return WorkFront.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.SUPERVISOR and not self.request.user.is_superuser:
            serializer.save(supervisor=self.request.user)
        else:
            serializer.save()

# ---------------------------------------------------------------
#  📦  INVENTARIO
# ---------------------------------------------------------------

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdminOrSupervisor]

# ---------------------------------------------------------------
#  🛠️  HERRAMIENTAS
# ---------------------------------------------------------------

class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAdminOrSupervisor]
