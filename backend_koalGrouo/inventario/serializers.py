from rest_framework import serializers
from .models import Herramienta, ListaDeChequeo, Verificacion, Prestamo
from administracion.models import Empleado
from administracion.serializers import EmpleadoSerializer  # si existe

# Serializer para Herramienta
class HerramientaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Herramienta
        fields = '__all__'

# Serializer para ListaDeChequeo
class ListaDeChequeoSerializer(serializers.ModelSerializer):
    herramienta = HerramientaSerializer(read_only=True)
    herramienta_id = serializers.PrimaryKeyRelatedField(
        queryset=Herramienta.objects.all(), source='herramienta', write_only=True, required=False
    )

    class Meta:
        model = ListaDeChequeo
        fields = ['id', 'nombre', 'categoria', 'estado', 'herramienta', 'herramienta_id']

# Serializer para Verificacion
class VerificacionSerializer(serializers.ModelSerializer):
    lista = ListaDeChequeoSerializer(read_only=True)
    lista_id = serializers.PrimaryKeyRelatedField(
        queryset=ListaDeChequeo.objects.all(), source='lista', write_only=True
    )

    class Meta:
        model = Verificacion
        fields = ['id', 'lista', 'lista_id', 'estado', 'observaciones', 'fecha_verificacion']

# Serializer para Prestamo
class PrestamoSerializer(serializers.ModelSerializer):
    verificacion = VerificacionSerializer(read_only=True)
    verificacion_id = serializers.PrimaryKeyRelatedField(
        queryset=Verificacion.objects.all(), source='verificacion', write_only=True
    )

    empleado = EmpleadoSerializer(read_only=True)
    empleado_id = serializers.PrimaryKeyRelatedField(
        queryset=Empleado.objects.all(), source='empleado', write_only=True
    )

    herramienta_prestada = HerramientaSerializer(read_only=True)
    herramienta_id = serializers.PrimaryKeyRelatedField(
        queryset=Herramienta.objects.all(), source='herramienta_prestada', write_only=True
    )

    class Meta:
        model = Prestamo
        fields = [
            'id',
            'verificacion', 'verificacion_id',
            'fecha_entrega', 'fecha_devolucion',
            'empleado', 'empleado_id',
            'herramienta_prestada', 'herramienta_id'
        ]
