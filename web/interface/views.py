from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from httpx import post
from json import loads as json_loads
from urllib.parse import unquote, parse_qs
from hmac import new as hmac_new
from hashlib import sha256
from uuid import uuid4
from os import environ

from data.views import get_products as data_get_products, get_orders as data_get_orders, get_order as data_get_order, create_order as data_create_order


class OkResponse(JsonResponse):
    def __init__(self, result = None):
        super().__init__({
            'ok': True,
            'result': result
        })


class FailResponse(JsonResponse):
    def __init__(self, description):
        super().__init__({
            'ok': False,
            'description': description
        })


def get_params(view):
    def get_params_(request, *args, **kwargs):

        try:
            params = json_loads(request.read())
        except:
            FailResponse("Не удалось получить параметры")

        return view(request, params, *args, **kwargs)
    return get_params_


def validate(view):
    def validate_(request, *args, **kwargs):

        try:
            validata = json_loads(request.headers.get('X-Validata'))
        except:
            return FailResponse("Не удалось получить данные для подтверждения запроса")

        if not (validata.get('dataCheckString') and validata.get('hash')):
            return FailResponse("Получены неправильные данные для подтверждения запроса")

        validata['dataCheckString'] = unquote(validata['dataCheckString'])

        result_hash = hmac_new(bytes.fromhex(environ['SECRET_KEY']), validata['dataCheckString'].encode(), sha256).hexdigest()

        if result_hash != validata['hash']:
            return FailResponse("Запрос не подтвержден")

        tg_init_data = {}
        for query, values in parse_qs(validata['dataCheckString'].replace('\n', '&')).items():
            if query != 'user':
                tg_init_data[query] = values[0]
            else:
                tg_init_data[query] = json_loads(values[0])

        return view(request, tg_init_data, *args, **kwargs)

    return validate_


def calculate_sale(price, sale):
    return price * (100 - sale) / 100

@csrf_exempt
def get_products(request):
    products = data_get_products()
    return OkResponse(products)

@csrf_exempt
@validate
@get_params
def get_orders(request, params, tg_init_data):
    orders = data_get_orders(tg_init_data['user']['id'])
    return OkResponse(orders)


@csrf_exempt
@validate
@get_params
def get_order(request, params, tg_init_data):

    kwargs = {}
    if 'pk' in params:
        kwargs['pk'] = params['pk']
    if 'invoiceLink' in params:
        kwargs['invoice_link'] = params['invoiceLink']

    order = data_get_order(True, **kwargs)

    return OkResponse(order)

@csrf_exempt
@validate
@get_params
def create_invoice_link(request, params, tg_init_data):

    prices = []
    try:
        for order_product in params['orderProducts']:
            prices.append({
                'label': f"{order_product['product']['fields']['title']} ({order_product['quantity']})",
                'amount': int(calculate_sale(order_product['product']['fields']['price'], order_product['product']['fields']['details'].get('sale', 0)) * order_product['quantity'] * int(environ['BOT_CURRENCY_FACTOR']))
            })
    except:
        return FailResponse("Не удалось сформировать заказ")

    order_uuid = uuid4()

    response = post(f'{environ['BOT_INTERFACE_URL']}/create_invoice_link', json={
        'title': params.get('title'),
        'description': params.get('description'),
        'payload': str(order_uuid),
        'provider_token': environ['BOT_PROVIDER_TOKEN'],
        'currency': environ['BOT_CURRENCY'],
        'prices': prices,
        'max_tip_amount': params.get('max_tip_amount'),
        'suggested_tip_amounts': params.get('suggested_tip_amounts'),
        'provider_data': params.get('provider_data'),
        'photo_url': params.get('photo_url'),
        'photo_size': params.get('photo_size'),
        'photo_width': params.get('photo_width'),
        'photo_height': params.get('photo_height'),
        'need_name': params.get('need_name'),
        'need_phone_number': params.get('need_phone_number'),
        'need_email': params.get('need_email'),
        'need_shipping_address': params.get('need_shipping_address'),
        'send_phone_number_to_provider': params.get('send_phone_number_to_provider'),
        'send_email_to_provider': params.get('send_email_to_provider'),
        'is_flexible': params.get('is_flexible')
    }).json()

    if response['ok']:
        data_create_order(order_uuid, response['result'], tg_init_data['user']['id'], params['orderProducts'], 'pending')

    return JsonResponse(response)

@csrf_exempt
@get_params
def update_order_status(request, params):

    kwargs = {}
    if 'uuid' in params:
        kwargs['uuid'] = params['uuid']
    if 'invoiceLink' in params:
        kwargs['invoice_link'] = params.get('invoiceLink')

    try:
        order = data_get_order(**kwargs)
    except:
        return FailResponse("Не удалось получить заказ")

    try:
        order.status = params['status']
        order.clean()
        order.save()
    except:
        return FailResponse("Не удалось обновить статус заказа")

    return OkResponse()
