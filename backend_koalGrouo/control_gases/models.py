from django.db import models
from lugares_trabajo.models import Lugares_de_trabajo
class Registro_de_gases(models.Model):
    UBICACIONES = [
        ('Mina Norte - Sección A', 'Mina Norte - Sección A'),
        ('Mina Norte - Sección B', 'Mina Norte - Sección B'),
        ('Mina Sur - Sección A', 'Mina Sur - Sección A'),
        ('Mina Este - Galería 1', 'Mina Este - Galería 1'),
        ('Mina Este - Galería 3', 'Mina Este - Galería 3'),
        ('Mina Norte - Sección D', 'Mina Norte - Sección D'),
        ('Mina Oeste - Galería 1', 'Mina Oeste - Galería 1'),
        ('Mina Oeste - Galería 2', 'Mina Oeste - Galería 2'),
    ]

    fecha = models.DateField()
    hora = models.TimeField()
    ubicacion = models.CharField(max_length=100, choices=UBICACIONES)
    tipo_gas = models.CharField(max_length=50)
    nivel = models.CharField(max_length=20)  # Puede ser '2.5%' o '35 ppm'
    estado = models.CharField(
        max_length=20,
        choices=[
            ('Normal', 'Normal'),
            ('Advertencia', 'Advertencia'),
            ('Peligro', 'Peligro')
        ]
    )
    registrado_por = models.CharField(max_length=50)
    nombre = models.ForeignKey(Lugares_de_trabajo ,on_delete=models.CASCADE, related_name='nombre_del_lugar_de_trabajo')

    def __str__(self):
        return f"{self.fecha} {self.hora} - {self.tipo_gas} ({self.estado}"
# Create your models here.
