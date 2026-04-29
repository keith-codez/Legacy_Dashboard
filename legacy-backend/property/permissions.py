from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsManagerOrReadOnly(BasePermission):
    """
    Managers = full access
    Others = read-only
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # SAFE = GET, HEAD, OPTIONS
        if request.method in SAFE_METHODS:
            return True

        # Only managers can modify
        return user.groups.filter(name="manager").exists()