import { useEffect, useReducer, useContext } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { TelegramWebAppContext } from './TelegramWebAppContext'
import { WebInterfaceContext } from './WebInterfaceContext'
import { CartContext, CartDispatchContext } from './CartContext'
import { CalculateContext } from './CalculateContext'
import { HumanizeContext } from './HumanizeContext'
import Home from './components/home/Home'
import Product from './components/product/Product'
import Orders from './components/orders/Orders'
import Order from './components/order/Order'
import Cart from './components/cart/Cart'
import './App.css'

function BackButton() {

    const location = useLocation()
    const navigate = useNavigate()

    const telegramWebApp = useContext(TelegramWebAppContext)

    useEffect(() => {
        telegramWebApp.BackButton.onClick(() => navigate(-1))
    }, [])

    useEffect(() => {
        location.pathname !== '/' ? telegramWebApp.BackButton.show() : telegramWebApp.BackButton.hide()
    }, [location])
    
    return <></>
}

function saveMapData(key, map) {
    window.sessionStorage.setItem(key, JSON.stringify(Object.fromEntries(map)))
}

function loadMapData(key) {
    const map = new Map(Object.entries(JSON.parse(window.sessionStorage.getItem(key))))
    map.forEach((value, key) => {
        map.set(parseInt(key), value)
    })
    map.forEach((value, key) => {
        if (typeof key === "string") {
            map.delete(key)
        }
    })
    return map
}

export default function App() {

    // TelegramWebApp
    
    const telegramWebApp = window.Telegram.WebApp

    // WebInterface

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');
    
    const validata = (() => {
        const telegramWebAppInitDataSearchParams = new URLSearchParams(telegramWebApp.initData)
        const hash = telegramWebAppInitDataSearchParams.get('hash')
        telegramWebAppInitDataSearchParams.delete('hash')
        telegramWebAppInitDataSearchParams.sort()
        const dataCheckString = telegramWebAppInitDataSearchParams.toString().replaceAll('&', '\n')
        return {
            dataCheckString: dataCheckString,
            hash: hash
        }
    })()

    const webInterface = {
        use: async (method, params = {}) => {
            return axios.post(`/interface/${method}`, params, {
                headers: {
                    'X-Csrftoken': csrftoken,
                    'X-Validation-Data': JSON.stringify(validata)
                }
            }).then(response => response.data.result)
        }
    }

    // Cart

    const [cart, cartDispatch] = useReducer(cartReducer, initialCart)

    useEffect(() => {
        cartDispatch({
            type: 'loadProducts'
        })
    }, [])

    // Calculate

    const calculate = {
        total: (price, sale = 0) => {
            return price * (100 - sale) / 100
        },
        cartTotal: (cart, products) => {
            let total = 0
            for (const product of products) {
                if (cart.products.has(product.pk)) {
                    total += calculate.total(product.fields.price, product.fields.details.sale) * cart.products.get(product.pk)
                }
            }
            return total
        },
        orderProductsTotal: orderProducts => {
            let total = 0
            for (const orderProduct of orderProducts) {
                total += calculate.total(orderProduct.product.fields.price, orderProduct.product.fields.details.sale) * orderProduct.quantity
            }
            return total
        }
    }

    // Humanize

    const humanize = {
        symbol: {
            ruble: "\u20bd"
        },
        months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        datetime: datetime => {
            const date = new Date(datetime)
            return `${date.getDate()} ${humanize.months[date.getMonth()]} ${date.toLocaleTimeString().slice(0, 5)}`
        },
        total: total => {
            return total.toFixed(2)
        }
    }

    return (
        <TelegramWebAppContext.Provider value={telegramWebApp}>
            <WebInterfaceContext.Provider value={webInterface}>
                <CartContext.Provider value={cart}>
                    <CartDispatchContext.Provider value={cartDispatch}>
                        <CalculateContext.Provider value={calculate}>
                            <HumanizeContext.Provider value={humanize}>
                                <BrowserRouter>
                                    <BackButton />
                                    <Routes>
                                        <Route path='/' element={<Home />} />
                                        <Route path='/product' element={<Product />} />
                                        <Route path='/orders' element={<Orders />} />
                                        <Route path='/orders/order' element={<Order />} />
                                        <Route path='/cart' element={<Cart />} />
                                    </Routes>
                                </BrowserRouter>
                            </HumanizeContext.Provider>
                        </CalculateContext.Provider>
                    </CartDispatchContext.Provider>
                </CartContext.Provider>
            </WebInterfaceContext.Provider>
        </TelegramWebAppContext.Provider>
    )
}

const initialCart = {
    products: new Map()
}
function cartReducer(cart, action) {

    const newCart = {...cart}

    switch (action.type) {
        case 'addProduct':
            newCart.products.set(action.pk, newCart.products.has(action.pk) ? newCart.products.get(action.pk) + 1 : 1)
            break
        case 'removeProduct':
            const newProductQty = newCart.products.get(action.pk) - 1
            newProductQty ? newCart.products.set(action.pk, newProductQty) : newCart.products.delete(action.pk)
            break
        case 'clearProducts':
            newCart.products.clear()
            break
        case 'changeProduct':
            newCart.products.set(action.pk, action.qty)
            break
        case 'deleteProduct':
            newCart.products.delete(action.pk)
            break
        case 'loadProducts':
            newCart.products = window.sessionStorage.getItem('cartProducts') ? loadMapData('cartProducts') : new Map()
            break
    }

    saveMapData('cartProducts', newCart.products)

    return newCart

}