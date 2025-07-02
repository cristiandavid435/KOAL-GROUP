from rest_framework import serializers
from .models import Registro_de_gases
from lugares_trabajo.models import Lugares_de_trabajo
from lugares_trabajo.serializers import LugaresDeTrabajoSerializer  # Asegúrate de tenerlo

class RegistroDeGasesSerializer(serializers.ModelSerializer):
    nombre = serializers.PrimaryKeyRelatedField(
        queryset=Lugares_de_trabajo.objects.all(),
        write_only=True
    )
    nombre_info = LugaresDeTrabajoSerializer(source='nombre', read_only=True)

    class Meta:
        model = Registro_de_gases
        fields = [
            'id',
            'fecha',
            'hora',
            'ubicacion',
            'tipo_gas',
            'nivel',
            'estado',
            'registrado_por',
            'nombre',        # Para escritura (ID del lugar)
            'nombre_info'    # Para lectura (detalle del lugar)
        ]
