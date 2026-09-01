from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .tokens import CustomRefreshToken


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = CustomRefreshToken.for_user(user)
        access = refresh.access_token

        # Access JWT claims using key indexing or fall back to user attribute
        role = access.get("role") if hasattr(access, "get") else access.payload.get("role")
        if not role:
            role = getattr(user, "role", "manager")

        response = Response({
            "message": "Login successful",
            "role": role,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access",
            value=str(access),
            httponly=True,
            samesite="Lax",
            secure=False,
            path="/",
        )

        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            samesite="Lax",
            secure=False,
            path="/",
        )

        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out"}, status=status.HTTP_200_OK)

        response.delete_cookie("access", path="/")
        response.delete_cookie("refresh", path="/")

        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Extract role directly from the validated access token stored in request.auth
        # Or fall back to user model attribute if token claims are unavailable
        role = None
        if hasattr(request, "auth") and isinstance(request.auth, dict):
            role = request.auth.get("role")
        
        if not role:
            role = getattr(request.user, "role", "manager")

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": role
        })
