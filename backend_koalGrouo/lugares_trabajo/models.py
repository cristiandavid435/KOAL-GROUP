from django.db import models
from administracion.models import Proyecto

class Lugares_de_trabajo(models.Model):
    nombre = models.CharField(max_length=200)
    estado = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=200)
    supervisor = models.CharField(max_length=100, blank=True, null=True)
    trabajadores = models.PositiveIntegerField()
    start_date = models.DateField()
    estimated_end = models.DateField()
    progreso = models.PositiveIntegerField(default=0)
    descripcion = models.TextField(blank=True, null=True)
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE)
    def __str__(self):
        return self.name
