from django.urls import path
from .views import (home, SignupView, LoginView, VerifyCodeView, CheckAuthView, LogoutView, ProductCreateView,
   ProductListView, ProductUpdateView, ProductDeleteView, OrderCreateView, OrderListView,RefreshTokenView, GetUsernameView)

urlpatterns = [
    path('', home, name='home'),
    path('signup/', SignupView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-code/', VerifyCodeView.as_view(), name='verify-code'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('logout/', LogoutView.as_view(), name='check-auth'),
    path('refresh-token/', RefreshTokenView.as_view(), name='refresh-token'),
    path('get-username/', GetUsernameView.as_view(), name='get-username'),
    path('create-products/', ProductCreateView.as_view(), name='product-list-create'),
    path('products-list/', ProductListView.as_view(), name='product-list-create'),
    path('update-products/<int:id>/', ProductUpdateView.as_view(), name='update-product'),
    path('delete-products/<int:id>/delete/', ProductDeleteView.as_view(), name='delete-product'),
    path('create-orders/', OrderCreateView.as_view(), name='create-order'),
    path('orders/', OrderListView.as_view(), name='list-orders'),

]
