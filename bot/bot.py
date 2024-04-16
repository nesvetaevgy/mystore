from asyncio import run as asyncio_run
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, PreCheckoutQueryHandler, ContextTypes, filters
from interface import Interface
from dotenv import load_dotenv
from os import environ

load_dotenv('../.env')

bot_app = Application.builder().token(environ['BOT_TOKEN']).build()
interface = Interface(bot_app.bot)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(
        chat_id=update.message.chat_id,
        text="Открывайте наш миниапп",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Миниапп",
                    web_app=WebAppInfo(
                        url=environ['WEB_URL']
                    )
                )
            ]
        ])
    )


async def pre_checkout_query_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if await update.pre_checkout_query.answer(ok=True):
        await interface.update_order_status(update.pre_checkout_query.invoice_payload, 'paid')


# async def successful_payment_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     pass


bot_app.add_handler(CommandHandler('start', start))
bot_app.add_handler(PreCheckoutQueryHandler(pre_checkout_query_callback))
# bot_app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment_callback))


async def run():
    async with bot_app:
        await bot_app.start()
        await bot_app.updater.start_polling()
        await interface.run()
        await bot_app.updater.stop()
        await bot_app.stop()


if __name__ == '__main__':
    asyncio_run(run())