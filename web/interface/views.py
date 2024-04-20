from os import environ

# Готовая часть проекта

from urllib.parse import unquote, parse_qs
from hmac import new as hmac_new
from hashlib import sha256


def validate(view):
    def validate_(request, *args):

        try:
            validation_data = json_loads(request.headers.get('X-Validation-Data'))
        except:
            return create_fail_response("Не удалось получить данные для проверки клиента")

        if 'dataCheckString' not in validation_data and 'hash' not in validation_data:
            return create_fail_response("Получены неправильные данные для подтверждения запроса")

        data_check_string_unquoted = unquote(validation_data.get('dataCheckString'))

        result_hash = hmac_new(bytes.fromhex(environ['SECRET_KEY']), data_check_string_unquoted.encode(), sha256).hexdigest()

        if result_hash != validation_data.get('hash'):
            return create_fail_response("Не удалось подтвердить клиента")

        client_data = {}
        for query, values in parse_qs(data_check_string_unquoted.replace('\n', '&')).items():
            if query != 'user':
                client_data[query] = values[0]
            else:
                client_data[query] = json_loads(values[0])
        
        return view(request, client_data, *args)
    return validate_


def create_prices(order_products: dict, bot_currency_factor: int) -> list:
    
    prices = []
    for order_product in order_products:
        prices.append({
            'label': f"{order_product['product']['fields']['title']} ({order_product['quantity']})",
            'amount': order_product['product']['fields']['price'] * order_product['quantity'] * bot_currency_factor
        })
    
    return prices


# Первая часть проекта

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
from json import loads as json_loads

from .models import Product


def create_ok_response(result = None):
    return JsonResponse({
        'ok': True,
        'result': result
    })


def create_fail_response(description = None):
    return JsonResponse({
        'ok': False,
        'description': description
    })


def get_parameters(view):
    def get_parameters_(request, *args, **kwargs):

        try:
            parameters = json_loads(request.read())
        except:
            return create_fail_response("Не удалось получить параметры")
    
        return view(request, parameters, *args, **kwargs)
    return get_parameters_


def get_queryset_json(queryset):
    return json_loads(serialize('json', queryset))


def get_all_products(request):

    all_products = Product.objects.all()
    all_products_json = get_queryset_json(all_products)
    
    return create_ok_response(all_products_json)


@get_parameters
def get_product(request, parameters):
    
    try:
        product = Product.objects.get(pk=parameters['pk'])
    except:
        return create_fail_response("Не удалось получить товар")

    product_json = get_queryset_json([product])[0]

    return create_ok_response(product_json)


# Вторая часть проекта

from httpx import post
from uuid import uuid4

from .models import Order

@validate
@get_parameters
def create_order(request, parameters, client_data):

    try:
        prices = create_prices(parameters['orderProducts'], int(environ['BOT_CURRENCY_FACTOR']))
    except:
        return create_fail_response("Не удалось сформировать заказ")

    uuid = str(uuid4())

    bot_response = post(f'{environ['BOT_INTERFACE_URL']}/create_invoice_link', json={
        'title': "Название заказа",
        'description': "Описание заказа",
        'payload': uuid,
        'provider_token': environ['BOT_PROVIDER_TOKEN'],
        'currency': environ['BOT_CURRENCY'],
        'prices': prices
    })

    bot_response_json = bot_response.json()

    if bot_response_json['ok']:
        Order.objects.create(uuid=uuid, invoice_link=bot_response_json['result'], user_id=client_data['user']['id'], products=parameters['orderProducts'], status='pending')

    return create_ok_response(bot_response_json['result'])


@csrf_exempt
@get_parameters
def update_order_status(request, parameters):

    kwargs = {}
    if 'uuid' in parameters:
        kwargs['uuid'] = parameters['uuid']
    if 'invoiceLink' in parameters:
        kwargs['invoice_link'] = parameters['invoiceLink']

    try:
        order = Order.objects.get(**kwargs)
    except:
        return create_fail_response("Не удалось получить заказ")

    try:
        order.status = parameters['status']
        order.clean()
        order.save()
    except:
        return create_fail_response("Не удалось обновить статус заказа")

    return create_ok_response()


# Третья часть проекта

@validate
def get_orders(request, client_data):

    orders = Order.objects.filter(user_id=client_data['user']['id'])
    orders_json = get_queryset_json(orders)

    return create_ok_response(orders_json)


@validate
@get_parameters
def get_order(request, parameters, client_data):

    kwargs = {}
    if 'pk' in parameters:
        kwargs['pk'] = parameters['pk']
    if 'invoiceLink' in parameters:
        kwargs['invoice_link'] = parameters['invoiceLink']
    
    try:
        order = Order.objects.get(user_id=client_data['user']['id'], **kwargs)
    except:
        return create_fail_response("Не удалось получить заказ")

    order_json = get_queryset_json([order])[0]

    return create_ok_response(order_json)