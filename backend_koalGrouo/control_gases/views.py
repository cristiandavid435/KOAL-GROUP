from rest_framework import viewsets
from .models import Registro_de_gases
from .serializers import RegistroDeGasesSerializer
from administracion.permisos import EsSupervisor,EsAdministrador
class RegistroDeGasesViewSet(viewsets.ModelViewSet):
    #API endpoint para gestionar los registros de gases.
    
    queryset = Registro_de_gases.objects.all()
    serializer_class = RegistroDeGasesSerializer
    permission_classes =  [EsSupervisor,EsAdministrador]
# Create your views here.
