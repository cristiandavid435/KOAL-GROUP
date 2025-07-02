from django.db import models
from administracion.models import Empleado

class Herramienta(models.Model):
    """Representa las herramientas disponibles."""
    nombre = models.CharField(max_length=100)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    cantidad = models.PositiveIntegerField(default=0) # Cantidad total disponible
    # estado puede ser CharField (ej: 'disponible', 'prestado', 'en_mantenimiento')
    estado = models.CharField(max_length=50, default='disponible')

    def _str_(self):
        return f"{self.nombre} ({self.cantidad} disponibles)"

class ListaDeChequeo(models.Model):
    """Representa listas de chequeo, posiblemente asociadas a herramientas."""
    nombre = models.CharField(max_length=150)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    # estado puede ser CharField (ej: 'activo', 'inactivo', 'revisar')
    estado = models.CharField(max_length=50, default='activo')
    # id_herramienta es clave foránea a Herramienta
    herramienta = models.ForeignKey(Herramienta, on_delete=models.SET_NULL, null=True, blank=True, related_name='listas_chequeo') # Una lista de chequeo puede no estar asociada a una herramienta específica

    def _str_(self):
        return self.nombre

class Verificacion(models.Model):
    """Representa una verificación, posiblemente de una lista de chequeo o herramienta."""
    # id_lista es clave foránea a ListaDeChequeo
    lista = models.ForeignKey(ListaDeChequeo, on_delete=models.PROTECT, related_name='verificaciones') # Proteger: no borrar una lista si tiene verificaciones
    # estado de la verificación (ej: 'aprobado', 'rechazado', 'pendiente')
    estado = models.CharField(max_length=50)
    observaciones = models.TextField(blank=True, null=True)
    fecha_verificacion = models.DateTimeField(auto_now_add=True) # Añadimos fecha de verificación para saber cuándo se realizó

    def _str_(self):
        return f"Verificación de {self.lista} - {self.estado}"

class Prestamo(models.Model):
    """Registra el préstamo de herramientas."""
    # id_verificacion es clave foránea a Verificacion.
    # Asumimos que un préstamo requiere una verificación previa o está ligado a ella.
    verificacion = models.OneToOneField(Verificacion, on_delete=models.PROTECT, related_name='prestamo') # OneToOne si un préstamo se asocia a UNA ÚNICA verificación
    fecha_entrega = models.DateField()
    fecha_devolucion = models.DateField(blank=True, null=True) # La fecha de devolución puede ser nula si la herramienta aún está prestada

    # Aunque el diagrama no lo muestra, un préstamo lógicamente
    # debería estar asociado a un Empleado y a una Herramienta específica.
    # Añadimos estas relaciones basadas en el contexto típico de un préstamo.
    # Podrías ajustar esto si la lógica de negocio es diferente.
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT, related_name='prestamos')
    herramienta_prestada = models.ForeignKey(Herramienta, on_delete=models.PROTECT, related_name='prestamos')


    def _str_(self):
        return f"Préstamo de {self.herramienta_prestada} a {self.empleado} ({self.fecha_entrega})"

# Create your models here.
