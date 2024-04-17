import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CartContext, CartDispatchContext } from '../../CartContext'
import { HumanizeContext } from '../../HumanizeContext'
import { Loading } from '../Loading'
import './Product.css'

export default function Product() {

    const location = useLocation()
    const navigate = useNavigate()

    const webInterface = useContext(WebInterfaceContext)
    const cart = useContext(CartContext)
    const cartDispatch = useContext(CartDispatchContext)
    const humanize = useContext(HumanizeContext)

    const searchParams = new URLSearchParams(location.search)

    const [product, setProduct] = useState({})

    useEffect(() => {
        webInterface.use('getProduct', Object.fromEntries(searchParams)).then(product => setProduct(product))
    }, [])

    const [newCartProductQty, setCartProductQty] = useState(1)

    useEffect(() => {
        setCartProductQty(cart.products.has(product.pk) ? cart.products.get(product.pk) : 1)
    }, [product])

    function removeCartProductQty() {
        if (cart.products.has(product.pk) && newCartProductQty > 0 || !cart.products.has(product.pk) && newCartProductQty > 1) {
            setCartProductQty(newCartProductQty - 1)
        }
    }

    function addCartProductQty() {
        setCartProductQty(newCartProductQty + 1)
    }

    function action() {
        if (newCartProductQty > 0) {
            cartDispatch({
                type: 'changeProduct',
                pk: product.pk,
                qty: newCartProductQty
            })
        } else {
            cartDispatch({
                type: 'deleteProduct',
                pk: product.pk
            })
        }
        navigate(-1)
    }

    return product.pk ? (
        <div id='product'>
            <div id='product-info'>
                <div id='product-info-photo'>
                    <img src={'/media/' + product.fields.photo} />
                </div>
            </div>
            <div id='product_dialog'>
                <div id='product_dialog_info'>
                    <div id='product_dialog_info_title'>{product.fields.title}</div>
                    <div id='product_dialog_info_price'>{humanize.total(product.fields.price)} {humanize.symbol.ruble}</div>
                </div>
                <div id='product_dialog_choice'>
                    <div id='product_dialog_choice_extend'>
                        <div id='product_dialog_choice_extend_rmv' className='button' onClick={() => removeCartProductQty()}>-</div>
                        <div id='product_dialog_choice_extend_qty'>{newCartProductQty}</div>
                        <div id='product_dialog_choice_extend_add' className='button' onClick={() => addCartProductQty()}>+</div>
                    </div>
                    <div id='product_dialog_choice_action' className='button' onClick={() => action()}>
                        {!cart.products.has(product.pk) ? (
                            <>Добавить</>
                        ) : (
                            newCartProductQty > 0 ? (
                                newCartProductQty !== cart.products.get(product.pk) ? (
                                    <>Сохранить</>
                                ) : (
                                    <>Готово</>
                                )
                            ) : (
                                <>Удалить</>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <Loading />
    )

}