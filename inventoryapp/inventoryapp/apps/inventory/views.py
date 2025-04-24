from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, LoginSerializer, ProductSerializer, OrderSerializer, OrderCreateSerializer
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.conf import settings
from django.core.mail import send_mail
import random
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from .models import User, Product, Order
from rest_framework.permissions import AllowAny
from rest_framework import generics

def home(request):
    return HttpResponse("Hello, world. You're at the inventory index.")


class GetUsernameView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return Response({'message': 'No access token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = AccessToken(access_token)
            user_id = token['user_id']
            user = User.objects.get(id=user_id)
            if user.is_active:
                return Response({'username': user.username}, status=status.HTTP_200_OK)
            return Response({'message': 'User is not active'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Check if user exists and password is correct, even if inactive
        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate 6-digit code
        login_code = str(random.randint(100000, 999999))
        user.verification_code = login_code
        user.save()

        # Send code via Brevo
        try:
            send_mail(
                subject='Your Login Code',
                message=f'Your login code is: {login_code}',
                from_email=settings.EMAIL_FROM,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response({
                'message': 'Login code sent to your email.',
                'username': user.username,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': f'Failed to send login code: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        code = request.data.get('code')

        if not username or not code:
            return Response({'message': 'Username and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if not user.verification_code:
            return Response({'message': 'Code expired or invalid'}, status=status.HTTP_400_BAD_REQUEST)

        if code == user.verification_code:
            # Activate user
            user.is_active = True
            user.verification_code = None
            user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)

            # Set cookies
            response = Response({
                'message': 'Authentication successful',
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key='access_token',
                value=access,
                max_age=15 * 60,
                httponly=True,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite='Strict',
                path='/',
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                max_age=7 * 24 * 60 * 60,
                httponly=True,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite='Strict',
                path='/',
            )

            return response
        return Response({'message': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)


class CheckAuthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return Response({'isAuthenticated': False}, status=status.HTTP_200_OK)

        try:
            # Verify the access token
            token = AccessToken(access_token)
            user_id = token['user_id']
            user = User.objects.get(id=user_id)
            if user.is_active:
                return Response({'isAuthenticated': True}, status=status.HTTP_200_OK)
            return Response({'isAuthenticated': False}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'isAuthenticated': False}, status=status.HTTP_200_OK)



class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        return response


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'message': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            access = str(refresh.access_token)
            response = Response({'message': 'Token refreshed'}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=access,
                max_age=15 * 60,
                httponly=True,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite='Strict',
                path='/',
            )
            return response
        except Exception as e:
            return Response({'message': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)


class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'  # Use 'id' to identify the product

    def update(self, request, *args, **kwargs):
        print('Update request data:', request.data)
        response = super().update(request, *args, **kwargs)
        print('Update response:', response.data, 'Status:', response.status_code)
        return response

class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'

    def delete(self, request, *args, **kwargs):
        print('Delete request for ID:', kwargs.get('id'))
        response = super().delete(request, *args, **kwargs)
        print('Delete response status:', 204)  # 204 No Content for DELETE
        return response

class OrderListView(generics.ListAPIView):
    queryset = Order.objects.all().prefetch_related('items__product')
    serializer_class = OrderSerializer


class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = []
