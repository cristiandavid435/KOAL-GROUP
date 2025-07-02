from django.contrib import admin
from .models import Lugares_de_trabajo

@admin.register(Lugares_de_trabajo)
class LugaresDeTrabajoAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'estado',
        'ubicacion',
        'supervisor',
        'trabajadores',
        'start_date',
        'estimated_end',
        'progreso',
        'proyecto'
    )
    search_fields = ('nombre', 'ubicacion', 'supervisor', 'proyecto__nombre')
    list_filter = ('estado', 'start_date', 'estimated_end', 'proyecto')


# Register your models here.
