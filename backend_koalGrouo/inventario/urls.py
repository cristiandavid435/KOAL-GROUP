from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from .views import HerramientaViewSet , ListaDeChequeoViewSet, VerificacionViewSet ,PrestamoViewSet

router = DefaultRouter()
router.register(r'herramientas',HerramientaViewSet)
router.register(r'listas', ListaDeChequeoViewSet)
router.register(r'verificaciones', VerificacionViewSet)
router.register(r'prestamos', PrestamoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]