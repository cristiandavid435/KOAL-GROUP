from django.db import models

class Cargo(models.Model):
    """Representa los cargos o puestos de trabajo."""
    nombre_cargo = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    # Podrías usar Choices para nivel_acceso si los niveles son fijos (ej: 'bajo', 'medio', 'alto')
    nivel_acceso = models.CharField(max_length=50)

    def _str_(self):
        return self.nombre_cargo

class Empleado(models.Model):
    """Representa a los empleados de la organización."""
    # cargo_id es una clave foránea a la tabla Cargo
    cargo = models.ForeignKey(Cargo, on_delete=models.PROTECT) # Proteger: no permitir borrar un Cargo si tiene empleados asociado
    
    #Este campo va a almacenar la cedula de los empleados
    cedula = models.IntegerField()
    
    
    nombres = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, unique=True, blank=True, null=True)
    # estado puede ser un CharField con Choices (ej: 'activo', 'inactivo', 'vacaciones')
    estado = models.CharField(max_length=50, default='activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True) # Se guarda la fecha/hora al crearse
    fecha_registro = models.DateField(auto_now_add=True) # Se guarda la fecha al crearse
    huella = models.BinaryField(blank=True, null=True) # Para datos binarios como una huella dactilar
    # nivel_acceso podría ser redundante si ya está en Cargo, pero lo incluimos si es específico del empleado
    nivel_acceso = models.CharField(max_length=50)

    def _str_(self):
        return f"{self.nombres} ({self.cedula})"

class Proyecto(models.Model):
    """Representa los proyectos."""
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateField()
    # estado podría ser CharField con Choices (ej: 'planificacion', 'en_progreso', 'finalizado', 'cancelado')
    estado = models.CharField(max_length=50, default='planificacion')
    # supervisor_id es una clave foránea a la tabla Empleados
    supervisor = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos_supervisados') # Permite que un proyecto no tenga supervisor
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return self.nombre
    
"""class AdminitrativoConfig(AppConfig):  # Cambiado de EmpleadosConfig a AdminitrativoConfig
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Adminitrativo"""
