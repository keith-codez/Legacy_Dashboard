from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)

        # STRICT role extraction
        if user.groups.exists():
            token["role"] = user.groups.first().name
        else:
            token["role"] = "none"

        return token