from rest_framework import viewsets
from .models import Produccion
from .serializers import ProduccionSerializer
from administracion.permisos import EsSupervisor,EsAdministrador

class ProduccionViewSet(viewsets.ModelViewSet):
    
    #Api endpoint para gestionar la producción de empleados en proyectos
    
    queryset = Produccion.objects.all()
    serializer_class = ProduccionSerializer
    permission_classes = [EsSupervisor,EsAdministrador]