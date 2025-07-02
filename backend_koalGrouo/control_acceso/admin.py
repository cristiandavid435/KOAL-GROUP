from django.contrib import admin
from .models import ControlDeIngreso
@admin.register(ControlDeIngreso)
class ControlDeIngresoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'cedula',
        'fecha',
        'hora_entrada',
        'hora_salida',
        'estado_salud_entrada',
        'estado_salud_Salida',
        'proyecto',
        'lugar_trabajo',
        'estado',
        'observacion',
    )
    search_fields = ('cedula__nombres', 'cedula__cedula', 'proyecto__nombre', 'lugar_trabajo')
    list_filter = ('fecha', 'proyecto', 'estado_salud_entrada', 'estado_salud_Salida', 'estado')

# Register your models here.
