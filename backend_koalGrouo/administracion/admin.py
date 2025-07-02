from django.contrib import admin

from .models import Cargo, Empleado, Proyecto

@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_cargo', 'descripcion', 'nivel_acceso')
    search_fields = ('nombre_cargo',)

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cedula', 'nombres', 'telefono', 'email', 'estado', 'nivel_acceso', 'cargo')
    search_fields = ('cedula', 'nombres', 'email')
    list_filter = ('estado', 'cargo')

@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'descripcion', 'fecha_inicio', 'estado', 'supervisor')
    search_fields = ('nombre',)
    list_filter = ('estado',)
# Register your models here.
