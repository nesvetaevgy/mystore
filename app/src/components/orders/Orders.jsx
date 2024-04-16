import { Component, useContext, useEffect, useState } from 'react'
import { WebInterfaceContext } from '../../WebInterfaceContext'
import { useNavigate } from 'react-router-dom'
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

class Order extends Component {
	constructor(props) {
		super(props)
		this.order = props.order
		this.calculateOrderProductsTotal = props.calculateOrderProductsTotal
		this.humanizeTimestamp = props.humanizeTimestamp
	}
	render() {
		
		const orderPhotosItems = []
		for (let i = 0; i < Math.min(this.order.fields.products.length, 3); i++) {
			orderPhotosItems.push(<OrderPhoto src={this.order.fields.products[i].product.fields.photo} />)
		}
		if (this.order.fields.products.length > 3) {
			orderPhotosItems.push(<OrderPhotoOther />)
		}

		return (
			<Link to={`/orders/order?pk=${this.props.order.pk}`}>
				<div className='order'>
					<div className='order-info'>
						<div className='order-info-timestamp'>{this.humanizeTimestamp(this.order.fields.timestamp)}</div>
						<div className='order-info-total'>{this.calculateOrderProductsTotal(this.order.fields.products)} &#8381;</div>
					</div>
					<div className='order-photos'>
						{orderPhotosItems}
					</div>
				</div>
			</Link>
		)
	}
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
				<>Order</>
			)}
		</div>
	)
}