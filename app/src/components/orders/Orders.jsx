import { Component, useContext, useEffect, useState } from 'react'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { useNavigate } from 'react-router-dom'
import './Orders.css'
import { HumanizeContext } from '../../HumanizeContext'
import { CalculateContext } from '../../CalculateContext'

class OrderPhoto extends Component {
	constructor(props) {
		super(props)
		this.src = props.src
	}
	render() {
		return (
			<div className='order-photo'>
				<img src={'/media/' + this.src} />
			</div>
		)
	}
}

class OrderPhotoOther extends Component {
	render() {
		return (
			<div className='order-photo-other'>...</div>
		)
	}
}

function Order({ order }) {

	const navigate = useNavigate()

	const calculate = useContext(CalculateContext)
	const humanize = useContext(HumanizeContext)

	const orderPhotosItems = []
	for (let i = 0; i < Math.min(order.fields.products.length, 3); i++) {
		orderPhotosItems.push(<OrderPhoto src={order.fields.products[i].product.fields.photo} />)
	}
	if (order.fields.products.length > 3) {
		orderPhotosItems.push(<OrderPhotoOther />)
	}

	return (
		<div className='order' onClick={() => navigate(`/orders/order?pk=${order.pk}`)}>
			<div className='order-info'>
				<div className='order-info-timestamp'>{humanize.datetime(order.fields.timestamp)}</div>
				<div className='order-info-total'>{calculate.orderProductsTotal(order.fields.products)} &#8381;</div>
			</div>
			<div className='order-photos'>
				{orderPhotosItems}
			</div>
		</div>
	)
}

export default function Orders() {
	
	const webInterface = useContext(WebInterfaceContext)

    const [orders, setOrders] = useState([])

    useEffect(() => {
        webInterface.use('getOrders').then(orders => setOrders(orders))
    }, [])

	return (
		<div id='orders'>
			{orders.map(order =>
				<Order key={order.pk} order={order} />
			)}
		</div>
	)
}