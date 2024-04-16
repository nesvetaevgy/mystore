import { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { WebInterfaceContext } from '../../WebInterfaceContext'

export default function Product() {

    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)

    const webInterface = useContext(WebInterfaceContext)

    const [product, setProduct] = useState({})

    useEffect(() => {
        webInterface.use('getProduct', Object.fromEntries(searchParams)).then(product => setProduct(product))
    }, [])

    return product.pk && (
        <div id='product'>
            <div id='product-info'>
                <div id='product-info-photo'>
                    <img src={'/media/' + product.fields.photo} />
                </div>
                <div id='product-info-title'>{product.fields.title}</div>
                <div id='product-info-price'>{product.fields.price}</div>
            </div>
        </div>
    )

}