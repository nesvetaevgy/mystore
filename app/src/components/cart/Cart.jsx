import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TelegramWebAppContext } from '../../TelegramWebAppContext'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CartContext, CartDispatchContext } from '../../CartContext'
import { CalculateContext } from '../../CalculateContext'
import { HumanizeContext } from '../../HumanizeContext'
import { SectionBottom } from '../Section'
import { DialogBottom } from '../Dialog'
import { Button } from '../Button'
import { ClearAll } from '../Icons'
import { Loading } from '../Loading'
import './Cart.css'


function CartProduct({ product }) {

    const navigate = useNavigate()

    const cart = useContext(CartContext)
    const cartDispatch = useContext(CartDispatchContext)
    const humanize = useContext(HumanizeContext)

    return (
        <div className='cart-product' onClick={e => {
            e.stopPropagation()
            navigate(`/product?pk=${product.pk}`)
        }}>
            <div className='cart-product_photo'>
                <img src={'/media/' + product.fields.photo} />
            </div>
            <div className='cart-product_info'>
                <div className='cart-product_info_title'>{product.fields.title}</div>
                <div className='cart-product_info_price'>{product.fields.price} {humanize.symbol.ruble}</div>
            </div>
            <div className='cart-product_choice'>
                <div className='cart-product_choice_rmv pointer' onClick={e => {
                    e.stopPropagation()
                    cartDispatch({
                        type: 'removeProduct',
                        pk: product.pk
                    })
                }}>-</div>
                <div className='cart-product_choice_qty'>{cart.products.get(product.pk)}</div>
                <div className='cart-product_choice_add pointer' onClick={e => {
                    e.stopPropagation()
                    cartDispatch({
                        type: 'addProduct',
                        pk: product.pk
                    })
                }}>+</div>
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
        webInterface.use('getAllProducts').then(products => setProducts(products))
    }, [])

    if (!products) {
        return <Loading />
    }

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
        
        webInterface.use('createOrder', {
            orderProducts: orderProducts
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

    return cart.products.size > 0 ? (
        <div id='cart'>
            <div id='cart_header'>
                <div id='cart_header_title'>Заказ</div>
                <div id='cart_header_clear' className='pointer' onClick={() => cartDispatch({
                    type: 'clearProducts'
                })}>
                    <ClearAll />
                </div>
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
    ) : (
        <div id='cart-empty'>
            <div id='cart-empty_info'>
                <div id='cart-empty_info_icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                        <path d="M220-80q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h110v-10q0-63 43.5-106.5T480-880q63 0 106.5 43.5T630-730v10h110q24 0 42 18t18 42v520q0 24-18 42t-42 18H220Zm170-640h180v-10q0-38-26-64t-64-26q-38 0-64 26t-26 64v10Zm210 180q13 0 21.5-8.5T630-570v-90h-60v90q0 13 8.5 21.5T600-540Zm-240 0q13 0 21.5-8.5T390-570v-90h-60v90q0 13 8.5 21.5T360-540Z"></path>
                    </svg>
                </div>
                <div id='cart-empty_info_title'>Корзина пуста</div>
                <div id='cart-empty_info_description'>Перейдите к списку мест, чтобы оформить заказ заново</div>
            </div>
            <SectionBottom element={
                <Button element={
                    <div id='cart-empty_section_button' onClick={() => navigate('/')}>Вернуться на главную</div>
                } />
            } />
        </div>
    )
}