from django.urls import path

from . import views

urlpatterns = [
    path('', views.index),
    path('product', views.index),
    path('cart', views.index),
    path('orders', views.index),
    path('orders/order', views.index)
]