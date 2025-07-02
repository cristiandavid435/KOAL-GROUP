from django.urls import path , include 
from rest_framework.routers import DefaultRouter
from .views import RegistroDeGasesViewSet

router = DefaultRouter()
router.register(r'registros', RegistroDeGasesViewSet)

urlpatterns = [
    path('', include(router.urls)),
]