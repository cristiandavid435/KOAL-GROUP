from rest_framework import serializers
from .models import ControlDeIngreso, Empleado, Proyecto

class ControlDeIngresoSerializer(serializers.ModelSerializer):
    empleadoId = serializers.IntegerField(source='cedula.cedula', read_only=True)
    empleadoNombre = serializers.CharField(source='cedula.nombres', read_only=True)
    proyectoNombre = serializers.CharField(source='proyecto.nombre', read_only=True)
    cedula = serializers.PrimaryKeyRelatedField(queryset=Empleado.objects.all(), write_only=True)
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all(), write_only=True)

    class Meta:
        model = ControlDeIngreso
        fields = [
            'id',
            'cedula',           # ID del empleado (obligatorio en POST)
            'proyecto',         # ID del área/proyecto (obligatorio en POST)
            'empleadoId',       # Solo lectura  # Este campo es para obtener la cedula del empleado
            'empleadoNombre',   # Solo lectura
            'fecha',
            'hora_entrada',
            'hora_salida',
            'estado_salud_entrada',
            'estado_salud_Salida',
            'proyectoNombre',   # Solo lectura
            'lugar_trabajo', #Este es el area de trabajo 
            'estado',
            'observacion',
        ]