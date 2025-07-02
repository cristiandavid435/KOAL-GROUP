from django.contrib import admin


from django.contrib import admin
from .models import Herramienta, ListaDeChequeo, Verificacion, Prestamo

@admin.register(Herramienta)
class HerramientaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'cantidad', 'estado')
    search_fields = ('nombre', 'categoria')
    list_filter = ('estado',)

@admin.register(ListaDeChequeo)
class ListaDeChequeoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'estado', 'herramienta')
    search_fields = ('nombre', 'categoria')
    list_filter = ('estado',)

@admin.register(Verificacion)
class VerificacionAdmin(admin.ModelAdmin):
    list_display = ('lista', 'estado', 'fecha_verificacion')
    search_fields = ('lista__nombre',)
    list_filter = ('estado', 'fecha_verificacion')

@admin.register(Prestamo)
class PrestamoAdmin(admin.ModelAdmin):
    list_display = ('herramienta_prestada', 'empleado', 'fecha_entrega', 'fecha_devolucion')
    search_fields = ('herramienta_prestada__nombre', 'empleado__nombres')
    list_filter = ('fecha_entrega', 'fecha_devolucion')

# Register your models here.
