import { useEffect, useReducer, useContext } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { TelegramWebAppContext } from './TelegramWebAppContext'
import { WebInterfaceContext } from './WebInterfaceContext'
import { CartContext, CartDispatchContext } from './CartContext'
import { CalculateContext } from './CalculateContext'
import { HumanizeContext } from './HumanizeContext'
import axios from 'axios'
import Home from './components/home/Home'
import Product from './components/product/Product'
import Orders from './components/orders/Orders'
import Order from './components/order/Order'
import './App.css'

function BackButton() {

    const TelegramWebApp = useContext(TelegramWebAppContext)

    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        TelegramWebApp.BackButton.onClick(() => navigate(-1))
    }, [])

    useEffect(() => {
        location.pathname !== '/' ? TelegramWebApp.BackButton.show() : TelegramWebApp.BackButton.hide()
    }, [location])
    
    return <></>
}

export default function App() {

    // WebApp
    
    const telegramWebApp = window.Telegram.WebApp

    // WebInterface

    const csrftoken = ''
    
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
                    'X-Validata': JSON.stringify(validata)
                }
            }).then(response => response.data.result)
        }
    }

    // Cart

    const [cart, cartDispatch] = useReducer(cartReducer, initialCart)

    // Calculate

    const calculate = {
        calculateTotal: (price, sale = 0) => {
            return price * (100 - sale) / 100
        },
        calculateCartTotal: (cart, products) => {
            let total = 0
            for (const product of products) {
                if (cart.products.has(product.pk)) {
                    total += calculate.calculateTotal(product.fields.price, product.fields.details.sale) * cart.products.get(product.pk)
                }
            }
            return total
        },
        orderProductsTotal: orderProducts => {
            let total = 0
            for (const orderProduct of orderProducts) {
                total += calculate.calculateTotal(orderProduct.product.fields.price, orderProduct.product.fields.details.sale) * orderProduct.quantity
            }
            return total
        }
    }

    // Humanize

    const humanize = {
        months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        datetime: datetime => {
            const date = new Date(datetime)
            return `${date.getDate()} ${humanize.months[date.getMonth()]} ${date.toLocaleTimeString().slice(0, 5)}`
        },
        humanizeTotal: price => {
            return price.toFixed(2)
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
    switch (action.type) {
        case 'addProduct': {
            const newCart = {...cart}
            newCart.products.set(action.pk, newCart.products.has(action.pk) ? newCart.products.get(action.pk) + 1 : 1)
            return newCart
        }
        case 'removeProduct': {
            const newCart = {...cart}
            const newProductQty = newCart.products.get(action.pk) - 1
            newProductQty ? newCart.products.set(action.pk, newProductQty) : newCart.products.delete(action.pk)
            return newCart
        }
        case 'clearProducts': {
            const newCart = {...cart}
            newCart.products.clear()
            return newCart
        }
        default: {
            return cart
        }
    }
}