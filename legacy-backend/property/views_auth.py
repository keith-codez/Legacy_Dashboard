from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=400)

        refresh = RefreshToken.for_user(user)

        response = Response({
            "message": "Login successful",
            "role": getattr(user, "role", "manager")
        })

        response.set_cookie(
            key="access",
            value=str(refresh.access_token),
            httponly=True,
            samesite="Lax",   # IMPORTANT CHANGE
            secure=False,
        )

        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            samesite="Lax",   # IMPORTANT CHANGE
            secure=False,
        )
        return response


class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out"})

        response.delete_cookie("access")
        response.delete_cookie("refresh")

        return response
    

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
        })