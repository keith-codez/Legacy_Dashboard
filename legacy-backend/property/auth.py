from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get("access")

        if not token:
            return None

        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)

            # Attach role from token to request
            request.role = validated_token.get("role")

            return (user, validated_token)

        except Exception:
            return None