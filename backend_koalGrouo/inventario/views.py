from rest_framework import viewsets
from .models import Herramienta,ListaDeChequeo,Verificacion, Prestamo
from .serializers import HerramientaSerializer,ListaDeChequeoSerializer,VerificacionSerializer, PrestamoSerializer
from administracion.permisos import EsSupervisor,EsAdministrador

class HerramientaViewSet(viewsets.ModelViewSet):
    
    #API endpoint paraa gestionar herramientas.
    
    queryset = Herramienta.objects.all()
    serializer_class = HerramientaSerializer
    permission_classes = [EsSupervisor,EsAdministrador]
    
class ListaDeChequeoViewSet(viewsets.ModelViewSet):
    
    #API endpoint para gestionar listas de chequeo.
    
    queryset = ListaDeChequeo.objects.all()
    serializer_class = ListaDeChequeoSerializer
    permission_classes = [EsSupervisor,EsAdministrador]
    

class VerificacionViewSet(viewsets.ModelViewSet):
    
    #API endpoint para gestionar verificaciones 
    
    queryset = Verificacion.objects.all()
    serializer_class = VerificacionSerializer
    permission_classes = [EsSupervisor,EsAdministrador]
    
class PrestamoViewSet(viewsets.ModelViewSet):
    
    #API endpoint para gestionar préstamos de herramientas 
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer
    permission_classes = [EsSupervisor,EsAdministrador]