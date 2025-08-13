from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permiso para permitir el acceso solo a usuarios con rol de Administrador.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser or request.user.role == 'ADMIN')

class IsSupervisor(permissions.BasePermission):
    """
    Permiso para permitir el acceso solo a usuarios con rol de Supervisor.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPERVISOR'

class IsEmployee(permissions.BasePermission):
    """
    Permiso para permitir el acceso solo a usuarios con rol de Empleado.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'EMPLOYEE'

class IsAdminOrSupervisor(permissions.BasePermission):
    """
    Permiso para permitir el acceso a usuarios con rol de Administrador o Supervisor.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_superuser or request.user.role in ['ADMIN', 'SUPERVISOR'])

class IsAdminOrSupervisorOrAssigned(permissions.BasePermission):
    """
    Permiso para permitir el acceso a usuarios con rol de Administrador, Supervisor,
    o si el recurso está directamente asignado al usuario.
    """
    def has_permission(self, request, view):
        if request.user.is_authenticated and (request.user.is_superuser or request.user.role in ['ADMIN', 'SUPERVISOR']):
            return True
        # Para el caso de ProductionRecord y AccessLog, se verifica en get_queryset
        return request.user.is_authenticated
