from rest_framework import serializers
from django.db import models
from .models import CustomUser, UserRole, Project, ProductionRecord, AccessLog, GasRecord, WorkFront, InventoryItem, Tool, Report
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.utils.encoding import force_str
from django.conf import settings
from django.utils.http import urlsafe_base64_decode

class UserSerializer(serializers.ModelSerializer):
    # Serializador para listar y recuperar usuarios
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'role', 'id_number', 'phone', 
            'names', 'is_active', 'is_staff', 'is_superuser'  # Incluimos names en lugar de first_name y last_name
        )
        read_only_fields = ('id',)
        extra_kwargs = {
            'is_active': {'default': True},
            'is_staff': {'default': False},  # Ajustado a False por seguridad
            'is_superuser': {'default': False},  # Ajustado a False por seguridad
        }

class UserRegistrationSerializer(serializers.ModelSerializer):
    # Serializador para registrar nuevos usuarios
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = (
            'username', 'email', 'password', 'password2', 'role', 'id_number', 
            'phone', 'names', 'is_active', 'is_staff', 'is_superuser'  # Incluimos names
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'default': True},
            'is_staff': {'default': False},  # Ajustado a False
            'is_superuser': {'default': False},  # Ajustado a False
        }

    def validate(self, attrs):
        # Validación para asegurar que las contraseñas coincidan
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        # Crear un nuevo usuario con los datos validados
        print("Datos validados recibidos:", validated_data)  # Log para depuración
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', UserRole.EMPLOYEE),
            id_number=validated_data.get('id_number'),
            phone=validated_data.get('phone', ''),
            names=validated_data.get('names', ''),  # Aseguramos que names se guarde
            is_active=validated_data.get('is_active', True),
            is_staff=validated_data.get('is_staff', False),
            is_superuser=validated_data.get('is_superuser', False),
        )
        print("Usuario creado:", user.username, "Nombres:", user.names, "Contraseña hasheada:", user.password)  # Log actualizado
        return user

class ProjectSerializer(serializers.ModelSerializer):
    # Serializador para proyectos
    manager_name = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class ProductionRecordSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    # Agregar estos campos
    employee = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()

    class Meta:
        model = ProductionRecord
        fields = '__all__' 
    
    def get_employee(self, obj):
        if obj.employee:
            return {
                "id": obj.employee.id,
                "names": obj.employee.names  # Cambiado de full_name a names
            }
        return None
    
    def get_project(self, obj):
        if obj.project:
            return {
                "id": obj.project.id,
                "name": obj.project.name
            }
        return None

class AccessLogSerializer(serializers.ModelSerializer):
    # Serializador para registros de acceso
    empleadoId = serializers.CharField(source='id_number.id_number', read_only=True)
    empleadoNombre = serializers.CharField(source='id_number.names', read_only=True)
    proyectoNombre = serializers.CharField(source='proyecto.name', read_only=True)
    id_number = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), write_only=True)
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), write_only=True)

    class Meta:
        model = AccessLog
        fields = [
            'id', 'id_number', 'proyecto', 'empleadoId', 'empleadoNombre', 'fecha',
            'hora_entrada', 'hora_salida', 'estado_salud_entrada', 'estado_salud_Salida',
            'proyectoNombre', 'lugar_trabajo', 'estado', 'observacion',
        ]
        read_only_fields = ['id']

class GasRecordSerializer(serializers.ModelSerializer):
    # Serializador para registros de gas
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = GasRecord
        fields = '__all__'

class WorkFrontSerializer(serializers.ModelSerializer):
    # Serializador para frentes de trabajo
    project_name = serializers.CharField(source='project.name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)

    class Meta:
        model = WorkFront
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    # Serializador para ítems de inventario
    class Meta:
        model = InventoryItem
        fields = '__all__'

class ToolSerializer(serializers.ModelSerializer):
    # Serializador para herramientas
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Tool
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Serializador personalizado para tokens JWT
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        return token

class ReportSerializer(serializers.ModelSerializer):
    # Serializador para reportes
    class Meta:
        model = Report
        fields = '__all__'

class PasswordResetRequestSerializer(serializers.Serializer):
    # Serializador para solicitud de restablecimiento de contraseña
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No existe un usuario con este correo electrónico.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = CustomUser.objects.get(email=email)
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"  # Ajusta la URL según tu frontend
        subject = "Restablecer contraseña"
        message = f"Hola {user.username},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n{reset_url}\n\nSi no solicitaste esto, ignora este correo."
        send_mail(
            subject,
            message,
            'harrisonojeda888@gmail.com',  # Usa el mismo correo que en settings.py
            [email],
            fail_silently=False,
        )
        return {"message": "Se ha enviado un enlace de restablecimiento a tu correo."}

class PasswordResetConfirmSerializer(serializers.Serializer):
    # Serializador para confirmar el restablecimiento de contraseña
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Las contraseñas no coinciden."})
        
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise serializers.ValidationError({"uid": "ID de usuario inválido."})

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"token": "El token es inválido o ha expirado."})
        
        return attrs

    def save(self):
        uid = force_str(urlsafe_base64_decode(self.validated_data['uid']))
        user = CustomUser.objects.get(pk=uid)
        user.set_password(self.validated_data['new_password'])
        user.save()
        return {"message": "Contraseña restablecida correctamente."}