from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProduccionViewSet

router = DefaultRouter()
router.register(r'', ProduccionViewSet)

urlpatterns = [
    path('', include(router.urls))
]