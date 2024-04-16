from django.urls import path

from . import views

urlpatterns = [
	path('getProducts', views.get_products),
    path('getProduct', views.get_product),
	path('getOrders', views.get_orders),
	path('getOrder', views.get_order),
	path('createInvoiceLink', views.create_invoice_link),
	path('updateOrderStatus', views.update_order_status)
]