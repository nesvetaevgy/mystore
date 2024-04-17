import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CartContext, CartDispatchContext } from '../../CartContext'
import { CalculateContext } from '../../CalculateContext'
import { HumanizeContext } from '../../HumanizeContext'
import { DialogBottom } from '../Dialog'
import { Button } from '../Button'
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
        <div className='product-button-add button' onClick={e => {
            e.stopPropagation()
            cartDispatch({
                type: 'addProduct',
                pk: productPk
            }
        )}}>Добавить</div>
    )
}

function ProductButtonExtended({ productPk, cartProductQuantity }) {

    const cartDispatch = useContext(CartDispatchContext)

    return (
        <div className='product-button-extended'>
            <div className='product-button-extended-remove button' onClick={e => {
                e.stopPropagation()
                cartDispatch({
                    type: 'removeProduct',
                    pk: productPk
                }
            )}}>-</div>
            <div className='product-button-extended-quantity'>{cartProductQuantity}</div>
            <div className='product-button-extended-add button' onClick={e => {
                e.stopPropagation()
                cartDispatch({
                    type: 'addProduct',
                    pk: productPk
                }
            )}}>+</div>
        </div>
    )
}

function Product({ product }) {

    const navigate = useNavigate()

    const cart = useContext(CartContext)
    const calculate = useContext(CalculateContext)
    const humanize = useContext(HumanizeContext)

    return (
        <div className='product' onClick={() => navigate(`/product?pk=${product.pk}`)}>
            <div className='product-photo'>
                <img src={'/media/' + product.fields.photo} />
            </div>
            <div className='product-info'>
                {!product.fields.details.sale ? (
                    <div className='product-info-price'>{humanize.total(product.fields.price)} &#8381;</div>
                ) : (
                    <div className='product-info-price'>
                        <span className='product-info-price-saled'>{humanize.total(calculate.total(product.fields.price, product.fields.details.sale))} &#8381;</span>&nbsp;
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

export default function Home() {

    const navigate = useNavigate()

    const webInterface = useContext(WebInterfaceContext)
    const cart = useContext(CartContext)
    const calculate = useContext(CalculateContext)
    const humanize = useContext(HumanizeContext)

    const [products, setProducts] = useState([])

    useEffect(() => {
        webInterface.use('getProducts').then(products => setProducts(products))
    }, [])

    return (
        <div id='home'>
            <Navigation />
            {products.length > 0 && <Products products={products} />}
            {cart.products.size > 0 && <DialogBottom element={
                <Button element={
                    <div id='home-dialog-button' onClick={() => navigate('/cart')}>
                        <div>Открыть корзину</div>
                        <div>{humanize.total(calculate.cartTotal(cart, products))} {humanize.symbol.ruble}</div>
                    </div>
                } />
            } />}
        </div>
    )
}