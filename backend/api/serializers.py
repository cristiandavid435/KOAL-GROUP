# api/serializers.py

from rest_framework import serializers
from django.db import models
from .models import CustomUser, UserRole, Project, ProductionRecord, AccessLog, GasRecord, WorkFront, InventoryItem, Tool

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'role', 'id_number', 'phone', 'fingerprint_id',
            'first_name', 'last_name' # Incluir estos campos si los usas
        )
        read_only_fields = ('id',)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'password2', 'role', 'id_number', 'phone')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2') # Elimina password2 antes de crear el usuario
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', UserRole.EMPLOYEE),
            id_number=validated_data.get('id_number'),
            phone=validated_data.get('phone')
        )
        return user

class ProjectSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class ProductionRecordSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    employee_name = serializers.CharField(source='employee.username', read_only=True)

    class Meta:
        model = ProductionRecord
        fields = '__all__'

class AccessLogSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = AccessLog
        fields = '__all__'
        read_only_fields = ('timestamp',) # El timestamp se genera automáticamente

class GasRecordSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = GasRecord
        fields = '__all__'

class WorkFrontSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.username', read_only=True)

    class Meta:
        model = WorkFront
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class ToolSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Tool
        fields = '__all__'

# serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agrega claims personalizados
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        
        return token
class Report(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Reporte'
        verbose_name_plural = 'Reportes'

    def __str__(self):
        return self.title
