import { Component, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CartContext } from '../../CartContext'
import './Home.css'

function Navigation() {
    return (
        <Link to='/orders'>
            <div id='navigation' className='button'>Посмотреть заказы</div>
        </Link>
    )
}

class ProductButtonAdd extends Component {
    constructor(props) {
        super(props)
        this.addCartProduct = props.addCartProduct
        this.productPk = props.productPk
    }
    render() {
        return (
            <div className='product-button-add button' onClick={() => this.addCartProduct(this.productPk)}>Добавить</div>
        )
    }
}

class ProductButtonExtended extends Component {
    constructor(props) {
        super(props)
        this.addCartProduct = props.addCartProduct
        this.removeCartProduct = props.removeCartProduct
        this.productPk = props.productPk
    }
    render() {
        return (
            <div className='product-button-extended'>
                <div className='product-button-extended-remove button' onClick={() => this.removeCartProduct(this.productPk)}>-</div>
                <div className='product-button-extended-quantity'>{this.props.cartProductQuantity}</div>
                <div className='product-button-extended-add button' onClick={() => this.addCartProduct(this.productPk)}>+</div>
            </div>
        )
    }
}

function Product({ product }) {

    const Cart = useContext(CartContext)

    return (
        <div className='product'>
            <div className='product-photo'>
                <img src={'/media/' + product.fields.photo} />
            </div>
            <div className='product-info'>
                {!product.fields.details.sale ? (
                    <div className='product-info-price'>{product.fields.price.toFixed(2)} &#8381;</div>
                ) : (
                    <div className='product-info-price'>
                        <span className='product-info-price-saled'>{props.cart.calculateSale(product.fields.price, product.fields.details.sale)} &#8381;</span>&nbsp;
                        <span className='product-info-price-overlined'>{product.fields.price} &#8381;</span>
                    </div>
                )}
                <div className='product-info-title'>{product.fields.title}</div>
                <div className='product-info-author'>{product.fields.details.author}</div>
            </div>
            {!Cart.products.get(product.pk) ? (
                <ProductButtonAdd productPk={product.pk} />
            ) : (
                <ProductButtonExtended productPk={product.pk} cartProductQuantity={Cart.products.get(product.pk)} />
            )}
        </div>
    )
}

function Products({ products }) {
    
    const productsItems = []
    for (const product of products) {
        productsItems.push(<Product key={product.pk} product={product} />)
    }

    return (
        <div id='products'>
            {productsItems}
        </div>
    )
}

class Dialog extends Component {
    constructor(props) {
        super(props)
        this.tgWebApp = props.tgWebApp
        this.fetchInterface = props.fetchInterface
        this.openInvoice = () => {

            const orderProducts = []
            for (const product of this.props.products) {
                if (this.props.cart.products.has(product.pk)) {
                    orderProducts.push({
                        product: product,
                        quantity: this.props.cart.products.get(product.pk)
                    })
                }
            }

            this.fetchInterface('createInvoiceLink', {
                orderProducts: orderProducts,
                title: "Название",
                description: "Описание"
            }).then(invoiceLink => {
                this.tgWebApp.openInvoice(invoiceLink)
            })
        }
    }
    render() {
        return (
            <>
                <div id='dialog-pile'></div>
                <div id='dialog' onClick={this.openInvoice}>
                    <div id='dialog-button' className='button'>
                        <div id='dialog-button-title'>Оформить заказ</div>
                        <div id='dialog-button-total'>{this.props.cart.calculateTotal(this.props.products)} &#8381;</div>
                    </div>
                </div>
            </>
        )
    }
}

export default function Home() {

    const webInterface = useContext(WebInterfaceContext)

    const [products, setProducts] = useState([])

    useEffect(() => {
        webInterface.use('getProducts').then(products => setProducts(products))
    }, [])

    return (
        <div id='home'>
            <Navigation />
            {products.length > 0 && <Products products={products} />}
            {/* {this.props.cart.products.size > 0 && <Dialog tgWebApp={this.tgWebApp} cart={this.props.cart} products={products} fetchInterface={this.fetchInterface} />} */}
        </div>
    )
}