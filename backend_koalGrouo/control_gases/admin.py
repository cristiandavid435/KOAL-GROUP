from django.contrib import admin
from .models import Registro_de_gases

@admin.register(Registro_de_gases)
class RegistroDeGasesAdmin(admin.ModelAdmin):
    list_display = (
        'fecha',
        'hora',
        'ubicacion',
        'tipo_gas',
        'nivel',
        'estado',
        'registrado_por',
        'nombre'
    )
    list_filter = ('fecha', 'ubicacion', 'estado', 'tipo_gas')
    search_fields = ('tipo_gas', 'registrado_por', 'ubicacion')
