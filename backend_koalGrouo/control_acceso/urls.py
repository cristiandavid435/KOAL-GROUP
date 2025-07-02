from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ControlDeIngresoViewSet, buscar_empleado_por_cedula,buscar_area_por_cedula,filtro_de_busqueda_con_cedula_empleado

router = DefaultRouter()
router.register(r'ControlDeAcceso', ControlDeIngresoViewSet)

urlpatterns = router.urls + [
    path('buscar-empleado/', buscar_empleado_por_cedula, name='buscar-empleado'),
    path('buscar_area_por_cedula/', buscar_area_por_cedula, name='buscar_area_por_cedula'),
    path('filtro_de_busqueda/', filtro_de_busqueda_con_cedula_empleado, name='filtro_de_busqueda'),
]