import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TelegramWebAppContext } from '../../TelegramWebAppContext'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CartContext, CartDispatchContext } from '../../CartContext'
import { CalculateContext } from '../../CalculateContext'
import { HumanizeContext } from '../../HumanizeContext'
import './Cart.css'
import { DialogBottom } from '../Dialog'
import { Button } from '../Button'


function CartProduct({ product }) {

    const cart = useContext(CartContext)
    const cartDispatch = useContext(CartDispatchContext)
    const humanize = useContext(HumanizeContext)

    return (
        <div className='cart-product'>
            <div className='cart-product_photo'>
                <img src={'/media/' + product.fields.photo} />
            </div>
            <div className='cart-product_info'>
                <div className='cart-product_info_title'>{product.fields.title}</div>
                <div className='cart-product_info_price'>{product.fields.price} {humanize.symbol.ruble}</div>
            </div>
            <div className='cart-product_choice'>
                <div className='cart-product_choice_rmv pointer' onClick={() => cartDispatch({
                    type: 'removeProduct',
                    pk: product.pk
                })}>-</div>
                <div className='cart-product_choice_qty'>{cart.products.get(product.pk)}</div>
                <div className='cart-product_choice_add pointer' onClick={() => cartDispatch({
                    type: 'addProduct',
                    pk: product.pk
                })}>+</div>
            </div>
        </div>
    )
}

export default function Cart() {

    const navigate = useNavigate()

    const telegramWebApp = useContext(TelegramWebAppContext)
    const webInterface = useContext(WebInterfaceContext)
    const cart = useContext(CartContext)
    const cartDispatch = useContext(CartDispatchContext)
    const calculate = useContext(CalculateContext)
    const humanize = useContext(HumanizeContext)

    const [products, setProducts] = useState([])

    useEffect(() => {
        webInterface.use('getProducts').then(products => setProducts(products))
    }, [])

    function openInvoice() {
        
        const orderProducts = []
        for (const product of products) {
            if (cart.products.has(product.pk)) {
                orderProducts.push({
                    product: product,
                    quantity: cart.products.get(product.pk)
                })
            }
        }
        
        webInterface.use('createInvoiceLink', {
            orderProducts: orderProducts,
            title: "Название",
            description: "Описание"
        }).then(invoiceLink => telegramWebApp.openInvoice(invoiceLink))
    }

    useEffect(() => {
        telegramWebApp.onEvent('invoiceClosed', result => {
            switch (result.status) {
                case 'paid':
                    cartDispatch({
                        type: 'clearProducts'
                    })
                    navigate(`/orders/order?invoiceLink=${result.url}`)
                    break
                case 'cancelled':
                    webInterface.use('updateOrderStatus', {
                        invoiceLink: result.url,
                        status: result.status
                    })
                    break
            }
        })
    }, [])

    return (
        <div id='cart'>
            <div id='cart_header'>
                <div id='cart_header_title'>Заказ</div>
                <div id='cart_header_clear' className='pointer' onClick={() => cartDispatch({
                    type: 'clearProducts'
                })}>Очистить</div>
            </div>
            <div id='cart_products'>
                {products.map(product =>
                    cart.products.has(product.pk) && <CartProduct product={product} />
                )}
            </div>
            {cart.products.size > 0 && <DialogBottom element={
                <Button element={
                    <div id='cart-dialog-button' onClick={() => openInvoice()}>
                        <div>Оформить заказ</div>
                        <div>{humanize.total(calculate.cartTotal(cart, products))} {humanize.symbol.ruble}</div>
                    </div>
                } />
            } />}
        </div>
    )
}