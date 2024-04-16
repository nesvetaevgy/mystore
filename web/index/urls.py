from django.urls import path

from . import views

urlpatterns = [
    path('', views.index),
    path('orders', views.index),
    path('orders/order', views.index)
]