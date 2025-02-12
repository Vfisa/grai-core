from django.contrib import admin
from django.contrib.admin import DateFieldListFilter
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _

from workspaces.models import Membership

from .forms import CustomUserChangeForm, CustomUserCreationForm
from .models import Audit, User


class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 0
    fk_name = "user"


class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
        (_("Dates"), {"fields": ("created_at", "last_login")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2"),
            },
        ),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ("username", "first_name", "last_name", "is_staff", "is_superuser", "created_at", "last_login")
    list_filter = ("is_staff", "is_superuser", ("created_at", DateFieldListFilter), ("last_login", DateFieldListFilter))
    search_fields = ["username", "first_name", "last_name"]

    inlines = [
        MembershipInline,
    ]

    readonly_fields = ("created_at", "last_login")


class AuditAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "created_at")
    list_filter = ("event", ("created_at", DateFieldListFilter))
    search_fields = ["user__username", "user__first_name", "user__last_name"]
    readonly_fields = ("user", "event", "created_at", "metadata")

    def has_add_permission(self, request, obj=None):  # pragma: no cover
        return False

    def has_delete_permission(self, request, obj=None):  # pragma: no cover
        return False


admin.site.unregister(Group)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Audit, AuditAdmin)
