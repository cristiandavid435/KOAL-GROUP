from rest_framework import viewsets
from .models import Cargo, Empleado, Proyecto
from .serializers import CargoSerializer, EmpleadoSerializer,ProyectoSerializer
from administracion.permisos import EsAdministrador

# Create your views here.

class CargoViewSet(viewsets.ModelViewSet):
    
    #API endpoint que permite ver , crear , actualizar y eliminar cargos.
    
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [EsAdministrador]
    
class EmpleadoViewSet(viewsets.ModelViewSet):
     
    #API endpoint para registrar empleados
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer
    permission_classes = [EsAdministrador]
    
class ProyectoViewSet(viewsets.ModelViewSet):
    
    #API endpoint para gestionar proyectos.
    queryset = Proyecto.objects.all()
    serializer_class =  ProyectoSerializer
    permission_classes = [EsAdministrador]
    