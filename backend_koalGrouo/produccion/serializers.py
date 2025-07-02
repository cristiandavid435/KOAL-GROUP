from rest_framework import serializers
from .models import Produccion
from administracion.models import Proyecto, Empleado
from administracion.serializers import ProyectoSerializer, EmpleadoSerializer  # Asegúrate de tenerlos creados

class ProduccionSerializer(serializers.ModelSerializer):
    # Relaciones para escritura
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all(), write_only=True)
    empleado = serializers.PrimaryKeyRelatedField(queryset=Empleado.objects.all(), write_only=True)

    # Relaciones anidadas para lectura
    proyecto_info = ProyectoSerializer(source='proyecto', read_only=True)
    empleado_info = EmpleadoSerializer(source='empleado', read_only=True)

    class Meta:
        model = Produccion
        fields = [
            'id',
            'proyecto',         # ID para escritura
            'empleado',         # ID para escritura
            'proyecto_info',    # Datos del proyecto (GET)
            'empleado_info',    # Datos del empleado (GET)
            'fecha',
            'cantidad_producida',
            'observaciones',
            'fecha_registro'
        ]
