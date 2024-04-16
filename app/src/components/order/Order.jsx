import { Component, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './Order.css'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { HumanizeContext } from '../../HumanizeContext'
import { CalculateContext } from '../../CalculateContext'

class OrderProduct extends Component {
	constructor(props) {
		super(props)
		this.orderProduct = props.orderProduct
		this.calculateSale = (price, sale = 0) => {
            return price * (100 - sale) / 100
        }
		this.calculateOrderProductTotal = orderProduct => {
			return (this.calculateSale(orderProduct.product.fields.price, orderProduct.product.fields.details.sale) * orderProduct.quantity).toFixed(2)
		}
	}
	render() {
		return (
			<div className='order-product'>
				<div className='order-product-photo'>
					<img src={'/media/' + this.orderProduct.product.fields.photo} />
				</div>
				<div className='order-product-details'>
					<div className='order-product-details-info'>
						<div className='order-product-details-info-title'>{this.orderProduct.product.fields.title}</div>
						<div className='order-product-details-info-author'>{this.orderProduct.product.fields.details.author}</div>
					</div>
					<div className='order-product-details-total'><span className='order-product-details-info-quantity'>{this.orderProduct.quantity} шт</span> · {this.calculateOrderProductTotal(this.orderProduct)} &#8381;</div>
				</div>
			</div>
		)
	}
}

export default function Order() {
    
	const location = useLocation()
	const webInterface = useContext(WebInterfaceContext)
	const humanize = useContext(HumanizeContext)
	const calculate = useContext(CalculateContext)

	const [order, setOrder] = useState([])

	const searchParams = new URLSearchParams(location.search)

	useEffect(() => {
		webInterface.use('getOrder', Object.fromEntries(searchParams)).then(order => setOrder(order))
	}, [])

	return order.pk && (
		<div id='order'>
			<div id='order-info'>
				<div id='order-info-timestamp'>{humanize.datetime(order.fields.timestamp)}</div>
				<div id='order-info-total'>{calculate.orderProductsTotal(order.fields.products)} &#8381;</div>
			</div>
			<div className='section'>
				<div className='section-title'>Состав заказа</div>
				<div id='order-products' className='section-content'>
					{order.fields.products.map(orderProduct => <OrderProduct
						orderProduct={orderProduct}
					/>)}
				</div>
			</div>
		</div>
	)
}