from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterUserView, CustomTokenObtainPairView,
    CustomUserViewSet, ProjectViewSet, ProductionRecordViewSet,
    AccessLogViewSet, GasRecordViewSet, WorkFrontViewSet,
    InventoryItemViewSet, ToolViewSet
)

# Configuración del router para las vistas REST
router = DefaultRouter()
router.register(r'users', CustomUserViewSet)  # Usuarios
router.register(r'projects', ProjectViewSet)  # Proyectos
router.register(r'production-records', ProductionRecordViewSet)  # Registros de producción
router.register(r'access-logs', AccessLogViewSet)  # Registros de acceso
router.register(r'gas-records', GasRecordViewSet)  # Registros de gas
router.register(r'work-fronts', WorkFrontViewSet)  # Frentes de trabajo
router.register(r'inventory-items', InventoryItemViewSet)  # Inventario de ítems
router.register(r'tools', ToolViewSet)  # Inventario de herramientas

# Definición de las rutas principales
urlpatterns = [
    # Ruta para obtener un token de acceso JWT
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # Ruta para refrescar el token JWT
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Ruta para registrar un nuevo usuario
    path("register/", RegisterUserView.as_view(), name="register"),  # Solo un registro

    # Incluir las rutas generadas por el router
    path("", include(router.urls)),
]
