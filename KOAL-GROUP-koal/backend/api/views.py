from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserRegistrationSerializer
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import models
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action, api_view
from django.http import FileResponse
import os
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.contrib.auth.models import User
from .serializers import ReportSerializer
from rest_framework.viewsets import ModelViewSet
from .models import (
    CustomUser, UserRole, Project, ProductionRecord, AccessLog,
    GasRecord, WorkFront, InventoryItem, Tool, Report
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
from rest_framework import filters
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

# ---------------------------------------------------------------
#  🔐  AUTENTICACIÓN
# ---------------------------------------------------------------
class ReportViewSet(ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Report.objects.all()
        if user.role == UserRole.SUPERVISOR:
            # Asumiendo que Report tiene relación con Project
            managed_projects = user.managed_projects.values_list('id', flat=True)
            return Report.objects.filter(proyecto__in=managed_projects)
        return Report.objects.none()

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

class ReportGenerateView(APIView):
    def post(self, request):
        report_type = request.data.get('report_type')
        project_id = request.data.get('project')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        user = self.request.user
        if user.role == UserRole.SUPERVISOR and not user.is_superuser:
            if project_id and not Project.objects.filter(id=project_id, manager=user).exists():
                return Response(
                    {'detail': 'No tienes permiso para generar reportes para este proyecto.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        return Response({
            "message": f"Informe de tipo {report_type} generado correctamente."
        }, status=status.HTTP_201_CREATED)

class RegisterUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

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
            # Supervisores no ven usuarios ADMIN
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
            return Project.objects.all()
        if user.role == UserRole.SUPERVISOR:
            return Project.objects.filter(manager=user)
        return Project.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.SUPERVISOR and not self.request.user.is_superuser:
            serializer.save(manager=self.request.user)
        else:
            serializer.save()

# ---------------------------------------------------------------
#  📊  PRODUCCIÓN
# ---------------------------------------------------------------
import matplotlib
matplotlib.use('Agg')  # Usa backend sin interfaz gráfica


import matplotlib.pyplot as  plt 
import io 
import base64
from collections import defaultdict
from datetime import datetime




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
    
    
    
    @action(detail=False, methods=["post"], url_path="registrar-produccion-por-nombre")
    def registrar_produccion_por_nombre(self, request):
        # Obtener datos del request
        fecha = request.data.get("date")
        material = request.data.get("material_type")
        cantidad = request.data.get("quantity")
        unidad = request.data.get("unit")
        calidad = request.data.get("quality")
        empleado_id = request.data.get("employee")
        proyecto_id = request.data.get("project")
        observaciones = request.data.get("observations")

        # Validar campos obligatorios
        if not all([fecha, material, cantidad, unidad, calidad, empleado_id, proyecto_id]):
            return Response(
                {"detail": "Faltan datos obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )


        # Buscar empleado por ID
        try:
            empleado = CustomUser.objects.get(id=empleado_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Empleado no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Buscar proyecto por ID
        try:
            proyecto = Project.objects.get(id=proyecto_id)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Proyecto no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Crear registro de producción
        produccion = ProductionRecord.objects.create(
            date=fecha,
            material_type=material,
            quantity=cantidad,
            unit=unidad,
            quality=calidad,
            employee=empleado,
            project=proyecto,
            observations=observaciones,
        )

        serializer = self.get_serializer(produccion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Obtener datos del request
        fecha = request.data.get("date")
        material = request.data.get("material_type")
        cantidad = request.data.get("quantity")
        unidad = request.data.get("unit")
        calidad = request.data.get("quality")
        observaciones = request.data.get("observations")
        empleado_id = request.data.get("employee")
        proyecto_id = request.data.get("project")

        # Validar campos obligatorios
        if not all([fecha, material, cantidad, unidad, calidad, empleado_id, proyecto_id]):
            return Response(
                {"detail": "Faltan datos obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar empleado por ID
        try:
            empleado = CustomUser.objects.get(id=empleado_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Empleado no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Buscar proyecto por ID
        try:
            proyecto = Project.objects.get(id=proyecto_id)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Proyecto no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Actualizar campos del registro
        instance.date = fecha
        instance.material_type = material
        instance.quantity = cantidad
        instance.unit = unidad
        instance.quality = calidad
        instance.observations = observaciones
        instance.employee = empleado
        instance.project = proyecto
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    ## Función para mostrar la producción de los empleados , proyectos y meses por graficas 
    @action(detail=False, methods=['get'] , url_path='charts')
    
    def get_charts(self, request):
        records = self.queryset.select_related('project', 'employee')
        
        # Filtros
        project_id = request.query_params.get("project")
        employee_id = request.query_params.get("employee")
        month = request.query_params.get("month")

        # Aplicar filtros
        if project_id:
            records = records.filter(project__id=project_id)
        if employee_id:
            records = records.filter(employee__id=employee_id)
        if month:
            records = records.filter(date__month=month)

        charts = {}

        if project_id:
            # Producción por mes de ese proyecto
            monthly = defaultdict(int)
            for record in records:
                month_name = record.date.strftime("%B")
                monthly[month_name] += record.quantity
            charts["monthly"] = self.generate_chart(monthly, "Producción mensual del proyecto", "Mes", "Cantidad")

        elif employee_id:
            # Producción por mes de ese empleado
            monthly = defaultdict(int)
            for record in records:
                month_name = record.date.strftime("%B")
                monthly[month_name] += record.quantity
            charts["employee"] = self.generate_chart(monthly, "Producción mensual del empleado", "Mes", "Cantidad")

        elif month:
            # Producción por proyecto en ese mes
            by_project = defaultdict(int)
            for record in records:
                by_project[record.project.name] += record.quantity
            charts["project"] = self.generate_chart(by_project, "Producción por proyecto en el mes", "Proyecto", "Cantidad")

        else:
            # Caso general: todo sin filtrar
            monthly = defaultdict(int)
            by_project = defaultdict(int)
            by_employee = defaultdict(int)

            for record in records:
                month_name = record.date.strftime("%B")
                monthly[month_name] += record.quantity
                by_project[record.project.name] += record.quantity
                by_employee[record.employee.names] += record.quantity

            charts = {
                "monthly": self.generate_chart(monthly, "Producción por Mes", "Mes", "Cantidad"),
                "project": self.generate_chart(by_project, "Producción por Proyecto", "Proyecto", "Cantidad"),
                "employee": self.generate_chart(by_employee, "Producción por Empleado", "Empleado", "Cantidad"),
            }

        return Response(charts)
    
    def generate_chart(self, data_dict, title, xlabel, ylabel):
        fig, ax = plt.subplots(figsize=(10, 5))
        labels = list(data_dict.keys())
        values = list(data_dict.values())

        ax.bar(labels, values, color="#1f2937")
        ax.set_title(title)
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        plt.xticks(rotation=45, ha= 'right')

        buf = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format='png')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        buf.close()
        plt.close(fig)

        return f"data:image/png;base64,{image_base64}"
    
@api_view(['GET'])

def listar_empleados(request):
    """
    Esta vista permite listar todos los empleados.
    """
    empleados = CustomUser.objects.all().values('id', 'names')
    return Response(empleados)

@api_view(['GET'])

def listar_proyectos(request):
    """
    Esta vista permite listar todos los proyectos.
    """
    proyectos = Project.objects.all().values('id', 'name')
    return Response(proyectos)   

# ---------------------------------------------------------------
#  🚪  ACCESOS
# ---------------------------------------------------------------
class AccessLogViewSet(viewsets.ModelViewSet):
    queryset = AccessLog.objects.all()
    serializer_class = AccessLogSerializer
    permission_classes = [IsAdminOrSupervisor]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return AccessLog.objects.all()
        if user.role == UserRole.SUPERVISOR:
            managed_projects = user.managed_projects.values_list('id', flat=True)
            return AccessLog.objects.filter(proyecto__in=managed_projects)
        return AccessLog.objects.none()

    @action(detail=False, methods=['post'], url_path='registrar-entrada-salida')
    # -Si el empleado ya tiene una entrada hoy sin salida, se registra la salida.
    # -Si no, se registra la entrada.
    
    def registrar_entrada_salida(self, request):
        
        #Obtener datos del request
        id_number = request.data.get('cedula')
        nombre = request.data.get('nombre')
        estado_salud = request.data.get('estado_salud')
        lugar_trabajo = request.data.get('lugar_trabajo') # Nuevo campo para el área de trabajo
        observacion = request.data.get('observacion')

        # Validar que se reciban los datos obligatorios
        # Si no se reciben los datos obligatorios, retornar un error
        if not (id_number and nombre and estado_salud and lugar_trabajo):
            return Response({'detail': 'Datos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        #Buscar el empleado por cédula y nombre
        try:
            empleado = CustomUser.objects.get(id_number=id_number, names=nombre)
        except CustomUser.DoesNotExist:
            return Response({'detail': 'Empleado no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        
        #Obtiene la fecha actual
        hoy = timezone.localdate()
        
         # 1. Buscar si ya existe un registro COMPLETO para el empleado hoy (entrada y salida)
        registro_completo_hoy = AccessLog.objects.filter(
            id_number=empleado,
            fecha =hoy ,
            hora_entrada__isnull=False,
            hora_salida__isnull=False
        ).exists()
        
        # Si ya está registrado con su entrada y salida en el día de hoy
        if registro_completo_hoy:
            return Response (
                {'detail': 'El empleado ya terminó su dia de trabajo'}, status= status.HTTP_409_CONFLICT
            )
        
        #Buscar si ya existe un registro de entrada para el empleado hoy sin salida
        registro = AccessLog.objects.filter(
            id_number=empleado,
            fecha=hoy,
            hora_salida__isnull=True
        ).last()

        if registro:
            # Si ya existe un registro de entrada sin salida , registrar la salida
            registro.hora_salida = timezone.localtime().time()
            registro.estado_salud_Salida = estado_salud
            registro.save()
            return Response({'detail': 'Salida registrada correctamente.'}, status=status.HTTP_200_OK)
        else:
            # Registrar entrada
            #Si no existe registrar una nueva  entrada 
            proyecto = Project.objects.first()
            if not proyecto:
                return Response({'detail': 'No hay proyectos disponibles para asignar.'}, status=status.HTTP_400_BAD_REQUEST)
            AccessLog.objects.create(
                id_number=empleado,
                fecha=hoy,
                hora_entrada=timezone.localtime().time(),
                estado_salud_entrada=estado_salud,
                proyecto=proyecto,
                lugar_trabajo=lugar_trabajo,
                observacion=observacion
            )
            return Response({'detail': 'Entrada registrada correctamente.'}, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------
#  🔎  FUNCIONES API DE CONTROL DE ACCESO
# ---------------------------------------------------------------
@api_view(['GET'])
def buscar_empleado_por_cedula(request):
    id_number = request.GET.get('cedula')
    if not id_number:
        return Response({'error': 'Debe proporcionar una cédula.'}, status=400)
    try:
        empleado = CustomUser.objects.get(id_number=id_number)
        nombre = empleado.names
        return Response({'nombre': nombre})
    except CustomUser.DoesNotExist:
        return Response({'nombre': ''}, status=404)

@api_view(['GET'])
def buscar_area_por_cedula(request):
    id_number = request.GET.get('cedula')
    if not id_number:
        return Response({'detail': 'Cédula requerida'}, status=400)
    try:
        empleado = CustomUser.objects.get(id_number=id_number)
        user = request.user
        if user.role == UserRole.SUPERVISOR and not user.is_superuser:
            managed_projects = user.managed_projects.values_list('id', flat=True)
            ultimo_registro = AccessLog.objects.filter(
                id_number=empleado,
                proyecto__in=managed_projects,
                hora_entrada__isnull=False
            ).order_by('-fecha', '-hora_entrada').first()
        else:
            ultimo_registro = AccessLog.objects.filter(
                id_number=empleado,
                hora_entrada__isnull=False
            ).order_by('-fecha', '-hora_entrada').first()
        if ultimo_registro and ultimo_registro.lugar_trabajo:
            return Response({'area': ultimo_registro.lugar_trabajo})
        else:
            return Response({'detail': 'No se encontró un área de trabajo previa para este empleado'}, status=404)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'La cédula no coincide con ningún empleado.'}, status=404)

@api_view(['GET'])
def filtro_de_busqueda_con_cedula_empleado(request):
    id_number = request.GET.get('cedula', '')
    nombres = request.GET.get('nombres', '')
    user = request.user
    empleados = CustomUser.objects.all()
    if nombres:
        empleados = empleados.filter(names__icontains=nombres)
    if user.role == UserRole.SUPERVISOR and not user.is_superuser:
        managed_projects = user.managed_projects.values_list('id', flat=True)
        registros = AccessLog.objects.filter(
            id_number__in=empleados,
            proyecto__in=managed_projects
        ).order_by('-fecha', '-hora_entrada')
    else:
        registros = AccessLog.objects.filter(id_number__in=empleados).order_by('-fecha', '-hora_entrada')
    serializer = AccessLogSerializer(registros, many=True)
    return Response(serializer.data)

# ---------------------------------------------------------------
#  ⛽  REGISTROS DE COMBUSTIBLE
# ---------------------------------------------------------------
class GasRecordViewSet(viewsets.ModelViewSet):
    queryset = GasRecord.objects.all()
    serializer_class = GasRecordSerializer
    permission_classes = [IsAdminOrSupervisor]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return GasRecord.objects.all()
        if user.role == UserRole.SUPERVISOR:
            return GasRecord.objects.filter(recorded_by=user)
        return GasRecord.objects.none()

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
        
    @action(detail=False, methods=["post"], url_path="registrar-multiples")
    def registrar_multiples(self, request):
        data = request.data
        required_fields = ["date", "time", "location", "unit", "readings"]

        for field in required_fields:
            if field not in data:
                return Response({field: "Campo requerido"}, status=status.HTTP_400_BAD_REQUEST)

        user = self.request.user
        created = []
        for gas_type, level in data["readings"].items():
            record = GasRecord.objects.create(
                date=data["date"],
                time=data["time"],
                location=data["location"],
                gas_type=gas_type,
                level=level,
                unit=data["unit"],
                status="Normal",
                recorded_by=user,
                observations=data.get("observations", "")
            )
            created.append(GasRecordSerializer(record).data)

        return Response(created, status=status.HTTP_201_CREATED)

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
            return WorkFront.objects.all()
        if user.role == UserRole.SUPERVISOR:
            return WorkFront.objects.filter(supervisor=user)
        return WorkFront.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == UserRole.SUPERVISOR and not user.is_superuser:
            project = serializer.validated_data.get('project')
            if project and not Project.objects.filter(id=project.id, manager=user).exists():
                return Response(
                    {'detail': 'No tienes permiso para asignar este frente de trabajo a este proyecto.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save(supervisor=user)
        else:
            serializer.save()

# ---------------------------------------------------------------
#  📦  INVENTARIO
# ---------------------------------------------------------------
class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdminOrSupervisor]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return InventoryItem.objects.all()
        if user.role == UserRole.SUPERVISOR:
            managed_projects = user.managed_projects.values_list('id', flat=True)
            return InventoryItem.objects.filter(
                location__in=Project.objects.filter(id__in=managed_projects).values_list('location', flat=True)
            )
        return InventoryItem.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == UserRole.SUPERVISOR and not user.is_superuser:
            location = serializer.validated_data.get('location')
            managed_projects = user.managed_projects.values_list('id', flat=True)
            if location not in Project.objects.filter(id__in=managed_projects).values_list('location', flat=True):
                return Response(
                    {'detail': 'No tienes permiso para registrar ítems en esta ubicación.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        serializer.save()

# ---------------------------------------------------------------
#  🛠️  HERRAMIENTAS
# ---------------------------------------------------------------
class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [IsAdminOrSupervisor]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Tool.objects.all()
        if user.role == UserRole.SUPERVISOR:
            managed_projects = user.managed_projects.values_list('id', flat=True)
            return Tool.objects.filter(
                models.Q(assigned_to=user) |
                models.Q(location__in=Project.objects.filter(id__in=managed_projects).values_list('location', flat=True))
            )
        return Tool.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == UserRole.SUPERVISOR and not user.is_superuser:
            location = serializer.validated_data.get('location')
            assigned_to = serializer.validated_data.get('assigned_to')
            managed_projects = user.managed_projects.values_list('id', flat=True)
            if location and location not in Project.objects.filter(id__in=managed_projects).values_list('location', flat=True):
                return Response(
                    {'detail': 'No tienes permiso para registrar herramientas en esta ubicación.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if assigned_to and assigned_to != user and not Project.objects.filter(manager=user, assigned_tools=assigned_to).exists():
                return Response(
                    {'detail': 'No tienes permiso para asignar herramientas a este usuario.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        serializer.save()

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BackupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        if not os.path.exists(db_path):
            return Response({"error": f"No se encontró el archivo en {db_path}"}, status=404)
        db_file = open(db_path, 'rb')
        return FileResponse(db_file, as_attachment=True, filename='backup_db.sqlite3')