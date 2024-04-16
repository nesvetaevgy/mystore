import { Component, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TelegramWebAppContext } from '../../TelegramWebAppContext'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CartContext, CartDispatchContext } from '../../CartContext'
import { CalculateContext } from '../../CalculateContext'
import { HumanizeContext } from '../../HumanizeContext'
import './Home.css'


function Navigation() {

    const navigate = useNavigate()
    
    return (
        <div onClick={() => navigate('/orders')} id='navigation' className='button'>Посмотреть заказы</div>
    )
}

function ProductButtonAdd({ productPk }) {

    const cartDispatch = useContext(CartDispatchContext)

    return (
        <div className='product-button-add button' onClick={() => cartDispatch({
            type: 'addProduct',
            pk: productPk
        })}>Добавить</div>
    )
}

function ProductButtonExtended({ productPk, cartProductQuantity }) {

    const cartDispatch = useContext(CartDispatchContext)

    return (
        <div className='product-button-extended'>
            <div className='product-button-extended-remove button' onClick={() => cartDispatch({
                type: 'removeProduct',
                pk: productPk
            })}>-</div>
            <div className='product-button-extended-quantity'>{cartProductQuantity}</div>
            <div className='product-button-extended-add button' onClick={() => cartDispatch({
                type: 'addProduct',
                pk: productPk
            })}>+</div>
        </div>
    )
}

function Product({ product }) {

    const navigate = useNavigate()

    const cart = useContext(CartContext)
    const Calculate = useContext(CalculateContext)
    const humanize = useContext(HumanizeContext)

    return (
        <div className='product' onClick={() => navigate(`/product?pk=${product.pk}`)}>
            <div className='product-photo'>
                <img src={'/media/' + product.fields.photo} />
            </div>
            <div className='product-info'>
                {!product.fields.details.sale ? (
                    <div className='product-info-price'>{humanize.humanizeTotal(product.fields.price)} &#8381;</div>
                ) : (
                    <div className='product-info-price'>
                        <span className='product-info-price-saled'>{humanize.humanizeTotal(Calculate.calculateTotal(product.fields.price, product.fields.details.sale))} &#8381;</span>&nbsp;
                        <span className='product-info-price-overlined'>{product.fields.price} &#8381;</span>
                    </div>
                )}
                <div className='product-info-title'>{product.fields.title}</div>
                <div className='product-info-author'>{product.fields.details.author}</div>
            </div>
            {!cart.products.has(product.pk) ? (
                <ProductButtonAdd productPk={product.pk} />
            ) : (
                <ProductButtonExtended productPk={product.pk} cartProductQuantity={cart.products.get(product.pk)} />
            )}
        </div>
    )
}

function Products({ products }) {
    return (
        <div id='products'>
            {products.map(product => <Product
                key={product.pk}
                product={product}
            />)}
        </div>
    )
}

function Dialog({ products }) {
    
    const telegramWebApp = useContext(TelegramWebAppContext)
    const webInterface = useContext(WebInterfaceContext)
    const cart = useContext(CartContext)
    const calculate = useContext(CalculateContext)
    const humanize = useContext(HumanizeContext)

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

    return (
        <>
            <div id='dialog-pile'></div>
            <div id='dialog' onClick={() => openInvoice()}>
                <div id='dialog-button' className='button'>
                    <div id='dialog-button-title'>Оформить заказ</div>
                    <div id='dialog-button-total'>{humanize.humanizeTotal(calculate.calculateCartTotal(cart, products))} &#8381;</div>
                </div>
            </div>
        </>
    )
}

export default function Home() {

    const webInterface = useContext(WebInterfaceContext)
    const cart = useContext(CartContext)

    const [products, setProducts] = useState([])

    useEffect(() => {
        webInterface.use('getProducts').then(products => setProducts(products))
    }, [])

    return (
        <div id='home'>
            <Navigation />
            {products.length > 0 && <Products products={products} />}
            {cart.products.size > 0 && <Dialog products={products} />}
        </div>
    )
}