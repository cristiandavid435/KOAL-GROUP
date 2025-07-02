from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LugaresDeTrabajoViewSet

router = DefaultRouter()
router.register(r'', LugaresDeTrabajoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]