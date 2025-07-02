from rest_framework import serializers
from .models import Lugares_de_trabajo
from administracion.models import Proyecto
from administracion.serializers import ProyectoSerializer  # asegúrate de tenerlo creado

class LugaresDeTrabajoSerializer(serializers.ModelSerializer):
    proyecto = serializers.PrimaryKeyRelatedField(queryset=Proyecto.objects.all(), write_only=True)
    proyecto_info = ProyectoSerializer(source='proyecto', read_only=True)

    class Meta:
        model = Lugares_de_trabajo
        fields = [
            'id',
            'nombre',
            'estado',
            'ubicacion',
            'supervisor',
            'trabajadores',
            'start_date',
            'estimated_end',
            'progreso',
            'descripcion',
            'proyecto',        # para escritura
            'proyecto_info'    # para lectura
        ]
