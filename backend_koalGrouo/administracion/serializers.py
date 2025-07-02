from rest_framework import serializers
from .models import Cargo, Empleado, Proyecto

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'

class EmpleadoSerializer(serializers.ModelSerializer):
    cargo = CargoSerializer(read_only=True)  # Anida el detalle del cargo

    class Meta:
        model = Empleado
        fields = '__all__'

class ProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proyecto
        fields = '__all__'
