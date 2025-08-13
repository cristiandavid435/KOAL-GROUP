# api/models.py

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db import models

class Report(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Opciones de rol para el usuario
class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', _('Administrador')
    SUPERVISOR = 'SUPERVISOR', _('Supervisor')
    EMPLOYEE = 'EMPLOYEE', _('Empleado')

class CustomUser(AbstractUser):
    # Hereda campos como username, password, email, first_name, last_name
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
        verbose_name=_('Rol de Usuario')
    )
    id_number = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name=_('Cedula')
    )
    phone = models.CharField( ### Numero de Teléfono
        max_length=20,
        null=True,
        blank=True,
        verbose_name=_('Teléfono')
    )
    # Este campo almacenaría el 'token' o ID de la huella dactilar
    # No se almacena la huella directamente por seguridad.
    

    names =  models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name=_('Nombres Completos')
    )
    
    class Meta:
        verbose_name = _('Usuario Personalizado')
        verbose_name_plural = _('Usuarios Personalizados')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
################################
############################

# Asegúrate de que el modelo de usuario personalizado se use en settings.py
# (agrega esto en config/settings.py)
# AUTH_USER_MODEL = 'api.CustomUser'
##### Usuarios

class Project(models.Model):
    # Nombre del proyecto
    name = models.CharField(max_length=255, verbose_name=_('Nombre del Proyecto'))
    # Ubicación física o geográfica del proyecto
    location = models.CharField(max_length=255, verbose_name=_('Ubicación'))
    # Fecha de inicio del proyecto
    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    # Descripción opcional del proyecto
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    # Un proyecto puede tener un supervisor asignado (usuario con rol SUPERVISOR)
    manager = models.ForeignKey(
        CustomUser,  # Referencia al usuario supervisor
        on_delete=models.SET_NULL,  # Si el supervisor se elimina, el campo queda en NULL
        null=True,  # Permite valores nulos
        blank=True,  # Permite dejar el campo en blanco en formularios
        related_name='managed_projects',  # Relación inversa desde el usuario
        limit_choices_to={'role': UserRole.SUPERVISOR},  # Solo usuarios con rol SUPERVISOR
        verbose_name=_('Supervisor Asignado')  # Nombre legible para el campo
    )
    # Estado del proyecto (Ej: Activo, Pausado, Finalizado)
    status = models.CharField(
        max_length=50,
        default='Activo',
        verbose_name=_('Estado del Proyecto')
    )

    class Meta:
        verbose_name = _('Proyecto')  # Nombre singular para el admin
        verbose_name_plural = _('Proyectos')  # Nombre plural para el admin

    def __str__(self):
        # Representación legible del objeto proyecto
        return self.name


class ProductionRecord(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='production_records', verbose_name=_('Proyecto'))
    employee = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='production_entries', verbose_name=_('Empleado'))
    date = models.DateField(verbose_name=_('Fecha de Producción'))
    material_type = models.CharField(max_length=100, verbose_name=_('Tipo de Material'))
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Cantidad'))
    unit = models.CharField(max_length=50, verbose_name=_('Unidad')) # Ej: Toneladas, m3
    quality = models.CharField(max_length=50, blank=True, null=True, verbose_name=_('Calidad')) # Ej: Alta, Media, Baja
    # Campos derivados o para reportes, pueden calcularse o almacenarse si es necesario.
    # Los campos 'month', 'value', 'change' del frontend pueden derivarse de 'date' y 'quantity'
    # o ser calculados en el backend para los reportes.
    observations = models.TextField(blank=True, null=True, verbose_name=_('Observaciones'))

    class Meta:
        verbose_name = _('Registro de Producción')
        verbose_name_plural = _('Registros de Producción')
        ordering = ['-date'] # Ordenar por fecha descendente

    def __str__(self):
        return f"Producción de {self.quantity} {self.unit} de {self.material_type} en {self.project.name} el {self.date}"

## Modelo de control de acceso (entradas y salidas de empleados)
class AccessLog(models.Model):
    """Registra los ingresos y salidas de empleados en proyectos/lugares."""
    id_number = models.ForeignKey(CustomUser,on_delete=models.CASCADE)  # Clave foránea para validar si la cédula existe en el modelo de usuarios 
    
    
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
    proyecto = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='registros_ingreso')
    
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


    class Meta:
        verbose_name = _('Registro de Acceso')
        verbose_name_plural = _('Registros de Acceso')
        ordering = ['-fecha', '-hora_entrada']

    def _str_(self):
        return{self.proyecto} + {self.lugar_trabajo}


class GasRecord(models.Model):
    GAS_TYPES = [
        ('METANO', _('Metano (CH₄)')),
        ('CO', _('Monóxido de Carbono (CO)')),
        ('CO2', _('Dióxido de Carbono (CO₂)')),
        ('H2S', _('Ácido Sulfhídrico (H₂S)')),
        ('OXYGEN', _('Oxígeno (O₂)')),
        # Puedes añadir más tipos según sea necesario
    ]
    GAS_UNITS = [
        ('%', _('%')),
        ('PPM', _('ppm')),
    ]

    date = models.DateField(verbose_name=_('Fecha'))
    time = models.TimeField(verbose_name=_('Hora'))
    location = models.CharField(max_length=255, verbose_name=_('Ubicación'))
    gas_type = models.CharField(max_length=50, choices=GAS_TYPES, verbose_name=_('Tipo de Gas'))
    level = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Nivel'))
    unit = models.CharField(max_length=10, choices=GAS_UNITS, verbose_name=_('Unidad'))
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=50, verbose_name=_('Estado')) # Ej: Normal, Advertencia, Peligro
    recorded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='gas_records', verbose_name=_('Registrado por'))
    observations = models.TextField(blank=True, null=True, verbose_name=_('Observaciones'))

    class Meta:
        verbose_name = _('Registro de Gas')
        verbose_name_plural = _('Registros de Gases')
        ordering = ['-date', '-time']

    def __str__(self):
        return f"Registro de {self.get_gas_type_display()} en {self.location} el {self.date} {self.time}"


class WorkFront(models.Model):
    STATUS_CHOICES = [
        ('ACTIVO', _('Activo')),
        ('PAUSADO', _('Pausado')),
        ('FINALIZADO', _('Finalizado')),
        ('PLANIFICADO', _('Planificado')),
    ]
    is_active = models.BooleanField(default=True)
    name = models.CharField(max_length=255, verbose_name=_('Nombre del Frente'))
    location = models.CharField(max_length=255, verbose_name=_('Ubicación'))
    start_date = models.DateField(verbose_name=_('Fecha de Inicio'))
    estimated_end_date = models.DateField(verbose_name=_('Fecha Estimada de Finalización'))
    workers = models.IntegerField(verbose_name=_('Número de Trabajadores'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción del Trabajo'))
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name=_('Progreso (%)'))
    # Un frente de trabajo puede estar asociado a un proyecto si es necesario
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='work_fronts', verbose_name=_('Proyecto Asociado'))
    supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_work_fronts',
        limit_choices_to={'role': UserRole.SUPERVISOR},
        verbose_name=_('Supervisor del Frente')
    )

    class Meta:
        verbose_name = _('Frente de Trabajo')
        verbose_name_plural = _('Frentes de Trabajo')
        ordering = ['-start_date']

    def __str__(self):
        return self.name


class InventoryItem(models.Model): #### Inventaario de produccion
    # Puede ser para carbón, materiales, etc.
    name = models.CharField(max_length=255, verbose_name=_('Nombre del Ítem'))
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_('Cantidad'))
    unit = models.CharField(max_length=50, verbose_name=_('Unidad')) # Ej: Toneladas, sacos, unidades
    location = models.CharField(max_length=255, verbose_name=_('Ubicación'))
    last_updated = models.DateField(auto_now=True, verbose_name=_('Última Actualización'))
    status = models.CharField(max_length=50, verbose_name=_('Estado')) # Ej: Bueno, Regular, Malo

    class Meta:
        verbose_name = _('Ítem de Inventario')
        verbose_name_plural = _('Ítems de Inventario')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"


class Tool(models.Model):
    # Inventario específico de herramientas
    name = models.CharField(max_length=255, verbose_name=_('Nombre de la Herramienta'))
    category = models.CharField(max_length=100, verbose_name=_('Categoría'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Descripción'))
    quantity = models.IntegerField(verbose_name=_('Cantidad'))
    status = models.CharField(max_length=50, verbose_name=_('Estado')) # Ej: Bueno, Regular, Malo, Fuera de Servicio
    last_revision_date = models.DateField(blank=True, null=True, verbose_name=_('Fecha Última Revisión'))
    location = models.CharField(max_length=255, verbose_name=_('Ubicación'))
    observations = models.TextField(blank=True, null=True, verbose_name=_('Observaciones'))
    assigned_to = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tools',
        verbose_name=_('Asignado a')
    )

    class Meta:
        verbose_name = _('Herramienta')
        verbose_name_plural = _('Herramientas')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.quantity} unidades, Estado: {self.status})"
    
    