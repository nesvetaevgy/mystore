from django.urls import path

from . import views

urlpatterns = [
	path('getAllProducts', views.get_all_products),
    path('getProduct', views.get_product),
	path('getOrders', views.get_orders),
	path('getOrder', views.get_order),
	path('createOrder', views.create_order),
	path('updateOrderStatus', views.update_order_status)
]