from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ReportGenerateView
from .views import BackupView
from .views import (
    RegisterUserView, CustomTokenObtainPairView,
    CustomUserViewSet, ProjectViewSet, ProductionRecordViewSet,
    AccessLogViewSet, GasRecordViewSet, WorkFrontViewSet,
    InventoryItemViewSet, ToolViewSet,
    buscar_empleado_por_cedula, buscar_area_por_cedula,
    filtro_de_busqueda_con_cedula_empleado,listar_empleados,listar_proyectos,
    ReportViewSet  # ⬅️ Asegúrate de agregar esto
)

from .views import PasswordResetRequestView, PasswordResetConfirmView

# Configuración del router para las vistas REST
router = DefaultRouter()
router.register(r'users', CustomUserViewSet)  # Usuarios
router.register(r'projects', ProjectViewSet)  # Proyectos
router.register(r'production-records', ProductionRecordViewSet)  # Registros de producción
router.register(r'access-logs', AccessLogViewSet)  # Registros de Control de Acceso
router.register(r'gas-records', GasRecordViewSet)  # Registros de gas
router.register(r'workfronts', WorkFrontViewSet)  # Frentes de trabajo
router.register(r'inventory-items', InventoryItemViewSet)  # Inventario de ítems
router.register(r'tool', ToolViewSet)  # Inventario de herramientas
router.register(r'reports', ReportViewSet)  # Agregar esta línea


# Definición de las rutas principales
urlpatterns =  router.urls +[
    # Ruta para obtener un token de acceso JWT
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # Ruta para refrescar el token JWT
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Ruta para registrar un nuevo usuario
    path("register/", RegisterUserView.as_view(), name="register"),  # Solo un registro

    # Incluir las rutas generadas por el router
    path("", include(router.urls)),
    path('reports/generate/', ReportGenerateView.as_view(), name='report-generate'),
    
    #URLS API DE CONTROL DE ACCESO
    path('backup/', BackupView.as_view(), name='backup'),
    path('buscar-empleado/', buscar_empleado_por_cedula, name='buscar-empleado'),
    path('buscar_area_por_cedula/', buscar_area_por_cedula, name='buscar_area_por_cedula'),
    path('filtro_de_busqueda/', filtro_de_busqueda_con_cedula_empleado, name='filtro_de_busqueda'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('empleados/', listar_empleados),
    path('proyectos/', listar_proyectos),
]
