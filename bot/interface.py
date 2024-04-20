from asyncio import sleep as asyncio_sleep
from aiohttp import web, ClientSession
from telegram import Bot
from os import environ


def ok_response(result: str = None) -> web.Response:
    return web.json_response({
        'ok': True,
        'result': result
    })


def fail_response(description: str = None) -> web.Response:
    return web.json_response({
        'ok': False,
        'description': description
    })


class Interface():
    def __init__(self, bot: Bot):
        self.bot = bot
        self.app = web.Application()
        self.app.add_routes((
            web.post('/create_invoice_link', self.create_invoice_link),
        ))
    
    
    async def run(self):
        app_runner = web.AppRunner(self.app)
        await app_runner.setup()
        tcp_site = web.TCPSite(app_runner, environ['BOT_INTERFACE_HOST'], environ['BOT_INTERFACE_PORT'])
        await tcp_site.start()
        while True:
            await asyncio_sleep(3600)
    

    async def create_invoice_link(self, request: web.Request) -> web.Response:
        request_json = await request.json()
        try:
            invoice_link = await self.bot.create_invoice_link(
                title=request_json.get('title'),
                description=request_json.get('description'),
                payload=request_json.get('payload'),
                provider_token=request_json.get('provider_token'),
                currency=request_json.get('currency'),
                prices=request_json.get('prices'),
                max_tip_amount=request_json.get('max_tip_amount'),
                suggested_tip_amounts=request_json.get('suggested_tip_amounts'),
                provider_data=request_json.get('provider_data'),
                photo_url=request_json.get('photo_url'),
                photo_size=request_json.get('photo_size'),
                photo_width=request_json.get('photo_width'),
                photo_height=request_json.get('photo_height'),
                need_name=request_json.get('need_name'),
                need_phone_number=request_json.get('need_phone_number'),
                need_email=request_json.get('need_email'),
                need_shipping_address=request_json.get('need_shipping_address'),
                send_phone_number_to_provider=request_json.get('send_phone_number_to_provider'),
                send_email_to_provider=request_json.get('send_email_to_provider'),
                is_flexible=request_json.get('is_flexible')
            )
        except Exception as exception:
            return fail_response(str(exception))
        return ok_response(invoice_link)
    

    async def update_order_status(self, uuid: str, status: str):
        async with ClientSession() as session:
            async with session.post(f'{environ['WEB_INTERFACE_URL']}/updateOrderStatus', json={
                'uuid': uuid,
                'status': status
            }, headers={
                'X-BotToken': environ['BOT_TOKEN']
            }) as response:
                pass