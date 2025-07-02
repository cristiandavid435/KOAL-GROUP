from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CargoViewSet ,EmpleadoViewSet ,ProyectoViewSet

router =DefaultRouter()
router.register(r'cargos', CargoViewSet)
router.register(r'empleados', EmpleadoViewSet)
router.register(r'proyectos', ProyectoViewSet)

urlpatterns = [
    path('',include(router.urls)),
]