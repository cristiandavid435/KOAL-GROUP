from django.contrib import admin
from .models import Produccion

@admin.register(Produccion)
class ProduccionAdmin(admin.ModelAdmin):
    list_display = (
        'proyecto', 
        'empleado', 
        'fecha', 
        'cantidad_producida', 
        'fecha_registro'
    )
    search_fields = ('empleado__nombres', 'proyecto__nombre')
    list_filter = ('fecha', 'proyecto', 'empleado')
    date_hierarchy = 'fecha'


# Register your models here.
