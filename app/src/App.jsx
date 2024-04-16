import { Component, useContext, useReducer, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { WebAppContext } from './WebAppContext'
import { WebInterfaceContext } from './WebInterfaceContext'
import { CartContext, CartDispatchContext } from './CartContext'
import axios from 'axios'
import Home from './components/home/Home'
import Orders from './components/orders/Orders'
import Order from './components/order/Order'
import './App.css'

// class Cart {
//     constructor(cartProducts = new Map()) {
//         this.products = cartProducts
//     }
//     calculateSale(price, sale = 0) {
//         return (price * (100 - sale) / 100).toFixed(2)
//     }
//     calculateTotal(products) {
//         let total = 0
//         for (const product of products) {
//             if (this.products.has(product.pk)) {
//                 total += this.calculateSale(product.fields.price, product.fields.details.sale) * this.products.get(product.pk)
//             }
//         }
//         return total.toFixed(2)
//     }
// }

function BackButton() {

    const WebApp = useContext(WebAppContext)

    const location = useLocation()

    useEffect(() => {
        WebApp.BackButton.onClick(() => {
            window.history.back()
        })
    }, [])

    useEffect(() => {
        if (location.pathname !== '/') {
            WebApp.BackButton.show()
        } else {
            WebApp.BackButton.hide()
        }
    }, [location])
    
    return <></>
}

export default function App() {

    // function addCartProduct(productPk) {
    //     const cartProducts = this.state.cart.products
    //     cartProducts.set(productPk, cartProducts.has(productPk) ? cartProducts.get(productPk) + 1 : 1)
    //     this.setState({
    //         ...this.state,
    //         cart: new Cart(cartProducts)
    //     })
    // }

    // function removeCartProduct(productPk) {
    //     const cartProducts = this.state.cart.products
    //     const newCartProductQuantity = cartProducts.get(productPk) - 1
    //     newCartProductQuantity ? cartProducts.set(productPk, newCartProductQuantity) : cartProducts.delete(productPk)
    //     this.setState({
    //         ...this.state,
    //         cart: new Cart(cartProducts)
    //     })
    // }

    // function clearCart() {
    //     const cartProducts = this.state.cart.products
    //     cartProducts.clear()
    //     this.setState({
    //         ...this.state,
    //         cart: new Cart(cartProducts)
    //     })
    // }

    // function calculateSale(price, sale = 0) {
    //     return price * (100 - sale) / 100
    // }

    // function calculateOrderProductsTotal(orderProducts) {
    //     let total = 0
    //     for (const orderProduct of orderProducts) {
    //         total += this.calculateSale(orderProduct.product.fields.price, orderProduct.product.fields.details.sale) * orderProduct.quantity
    //     }
    //     return total.toFixed(2)
    // }

    // const humanizedMonths = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
    // function humanizeTimestamp(timestamp) {
    //     const date = new Date(timestamp)
    //     return `${date.getDate()} ${this.humanizedMonths[date.getMonth()]} ${date.toLocaleTimeString().slice(0, 5)}`
    // }

    // function fetchInterface(method, params = {}) {
    //     return axios.post(`${window.location.origin}/interface/${method}`, {
    //         ...params,
    //     }, {
    //         headers: {
    //             'X-Csrftoken': this.validata.csrftoken,
    //             'X-Validata': JSON.stringify(this.validata)
    //         }
    //     }).then(response => response.data.result)
    // }

    const validata = (() => {
        const webAppInitDataSearchParams = new URLSearchParams(window.Telegram.WebApp.initData)
        const hash = webAppInitDataSearchParams.get('hash')
        webAppInitDataSearchParams.delete('hash')
        webAppInitDataSearchParams.sort()
        const dataCheckString = webAppInitDataSearchParams.toString().replaceAll('&', '\n')
        return {
            dataCheckString: dataCheckString,
            hash: hash
        }
    })()

    const WebInterface = {
        use: async (method, params = {}) => {
            return axios.post(`/interface/${method}`, params, {
                headers: {
                    'X-Validata': JSON.stringify(validata)
                }
            }).then(response => response.data.result)
        }
    }

    const [cart, cartDispatch] = useReducer(cartReducer, initialCart)

    const Cart = {
        products: new Map(),
        addProduct: (productPk) => {
            cartDispatch({
                type: 'ADD_PRODUCT',
                productPk: productPk
            })
        }
    }

    return (
        <TelegramWebAppContext.Provider value={window.Telegram.WebApp}>
            <WebInterfaceContext.Provider value={WebInterface}>
                <CartContext.Provider value={Cart}>
                    <BrowserRouter>
                        <BackButton />
                        <Routes>
                            <Route path='/' element={<Home />} />
                            <Route path='/orders' element={<Orders />} />
                            <Route path='/orders/order' element={<Order />} />
                        </Routes>
                    </BrowserRouter>
                </CartContext.Provider>
            </WebInterfaceContext.Provider>
        </TelegramWebAppContext.Provider>
    )
}

const initialCart = new Map()
function cartReducer(cart, action) {
    switch (action.type) {
        case 'addProduct':
            return cart
        default:
            return cart
    }
}