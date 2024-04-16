from django.core.serializers import serialize
from django.core.cache import cache
from json import loads as json_loads, dumps as json_dumps

from .models import Product, Order


def jsonify(data):
	return json_loads(serialize('json', data))


def get_products():

	if 'products' not in cache:
		products = Product.objects.all()
		products_json = jsonify(products)
		products_json_dump = json_dumps(products_json)
		cache.set('products', products_json_dump, timeout=60*15)
	else:
		products_json_dump = cache.get('products')
		products_json = json_loads(products_json_dump)

	return products_json


def get_product(pk, jsonfiy = False):
	
	product = Product.objects.get(pk=pk)

	if jsonfiy:
		product = jsonify([product])[0]
	
	return product


def get_orders(user_id):
	return jsonify(Order.objects.filter(user_id=user_id).order_by('-timestamp'))


def get_order(jsonfiy = False, **kwargs):
	data = Order.objects.get(**kwargs)
	if jsonfiy:
		data = jsonify([data])[0]
	return data


def create_order(uuid, invoice_link, user_id, products, status):
	return Order.objects.create(uuid=uuid, invoice_link=invoice_link, user_id=user_id, products=products, status=status)