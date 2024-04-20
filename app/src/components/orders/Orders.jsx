import { Component, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { CalculateContext } from '../../CalculateContext'
import { HumanizeContext } from '../../HumanizeContext'
import { Loading } from '../Loading'
import './Orders.css'

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
				<div className='order-info-total'>{humanize.total(calculate.orderProductsTotal(order.fields.products))} {humanize.symbol.ruble}</div>
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

	return orders.length > 0 ? (
		<div id='orders'>
			{orders.map(order => order.fields.status === 'paid' && (
				<Order key={order.pk} order={order} />
			))}
		</div>
	) : (
		<Loading />
	)
}