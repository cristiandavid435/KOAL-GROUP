# api/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Project, ProductionRecord, AccessLog, GasRecord, WorkFront, InventoryItem, Tool

# Personaliza el panel de administración para tu CustomUser
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'id_number', 'phone', 'fingerprint_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'id_number', 'phone', 'fingerprint_id')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'id_number', 'first_name', 'last_name')
    ordering = ('username',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Project)
admin.site.register(ProductionRecord)
admin.site.register(AccessLog)
admin.site.register(GasRecord)
admin.site.register(WorkFront)
admin.site.register(InventoryItem)
admin.site.register(Tool)