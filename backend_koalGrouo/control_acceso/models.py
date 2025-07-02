from django.db import models
from django.utils import timezone
from administracion.models import Empleado, Proyecto

class ControlDeIngreso(models.Model):
    """Registra los ingresos y salidas de empleados en proyectos/lugares."""
    cedula = models.ForeignKey(Empleado,on_delete=models.CASCADE)  
    #Este campo se relaciona con el campo empleado donde la cedula es almacenada 
    
    fecha = models.DateField()
    hora_entrada = models.TimeField(default=timezone.now)
    hora_salida = models.TimeField(blank=True, null=True)
    
    #Opciones de estado_salud 
    OPCIONES_ESTADO_SALUD = [
        ('Bien', 'Bien'),
        ('Regular', 'Regular'),
        ('Mal', 'Mal'),
    ]
    #En estado de salud vamos a tener  tres opciones : Bien , Mal , Regular
    
    #Estado de salud de entrada : 
    estado_salud_entrada = models.CharField(max_length=30,choices=OPCIONES_ESTADO_SALUD ,blank=True, null=True)
    
    #Estado de salud de salida:
    estado_salud_Salida = models.CharField(max_length=30,choices=OPCIONES_ESTADO_SALUD ,blank=True, null=True)
    

    # id_proyecto es clave foránea a Proyecto
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='registros_ingreso')
    
    #Opciones Lugar -Área de trabajo 
    
    OPCIONES_LUGAR_DE_TRABAJO = [
        ('Mina Norte', 'Mina Norte'),
        ('Mina Sur', 'Mina Sur'),
        ('Procesamiento', 'Procesamiento'),
        ('Administración', 'Administración'),
        ('Mantenimiento', 'Mantenimiento'),
    ]
    lugar_trabajo = models.CharField(max_length=100,choices=OPCIONES_LUGAR_DE_TRABAJO, blank=True, null=True)
    # estado puede referirse al estado del registro (ej: 'activo', 'cerrado', 'pendiente')
    estado = models.CharField(max_length=50, default='activo')
    observacion = models.TextField(blank=True, null=True)

    def _str_(self):
        return{self.proyecto} + {self.lugar_trabajo}