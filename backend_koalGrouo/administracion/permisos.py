from rest_framework.permissions import BasePermission

class EsAdministrador(BasePermission):
    """Permite acceso solo a usuarios"""
    
    def has_permission(self, request, view):
        return  request.user and request.user.is_superuser
    
class EsSupervisor (BasePermission):
    """Permite acceso a solo supervisores (staff, pero  no superusuarios)."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff and not request.user.is_superuser
    
