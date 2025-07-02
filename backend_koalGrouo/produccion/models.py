from django.db import models
from administracion.models import Proyecto,Empleado
# Create your models here.
class Produccion(models.Model):
    """Registra la producción de los empleados en proyectos."""
    # proyecto_id es clave foránea a Proyecto
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='producciones')
    # empleado_id es clave foránea a Empleado
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='producciones')
    fecha = models.DateField()
    cantidad_producida = models.DecimalField(max_digits=10, decimal_places=2) # Usamos DecimalField para cantidades que pueden no ser enteras
    observaciones = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return f"Producción de {self.cantidad_producida} por {self.empleado} en {self.proyecto} el {self.fecha}"