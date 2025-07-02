from rest_framework import viewsets
from .models import Lugares_de_trabajo
from .serializers import LugaresDeTrabajoSerializer
from administracion.permisos import EsSupervisor,EsAdministrador
class LugaresDeTrabajoViewSet(viewsets.ModelViewSet):
    
    #API endpoint para gestionar lugares de trabajo
    
    queryset = Lugares_de_trabajo.objects.all()
    serializer_class = LugaresDeTrabajoSerializer
    permission_classes = [EsSupervisor,EsAdministrador]
    
