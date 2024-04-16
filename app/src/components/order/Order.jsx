import { Component } from 'react'
import './Order.css'

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

export default class Order extends Component {
	constructor(props) {
        super(props)
        this.state = {
        	order: {
        		fields: {
        			products: []
        		}
        	}
        }
        this.humanizeTimestamp = props.humanizeTimestamp
        this.calculateOrderProductsTotal = props.calculateOrderProductsTotal
        this.fetchInterface = props.fetchInterface
    }
    componentDidMount() {
    	const searchParams = new URLSearchParams(window.location.search)
    	this.fetchInterface('getOrder', Object.fromEntries(searchParams)).then(order => this.setState({
    		...this.state,
    		order: order
    	}))
    }
	render() {
		
		const orderProductsItems = []
		for (const orderProduct of this.state.order.fields.products) {
			orderProductsItems.push(<OrderProduct orderProduct={orderProduct} />)
		}

		return this.state.order.pk && (
			<div id='order'>
				<div id='order-info'>
					<div id='order-info-timestamp'>{this.humanizeTimestamp(this.state.order.fields.timestamp)}</div>
					<div id='order-info-total'>{this.calculateOrderProductsTotal(this.state.order.fields.products)} &#8381;</div>
				</div>
				<div className='section'>
					<div className='section-title'>Состав заказа</div>
					<div id='order-products' className='section-content'>
						{orderProductsItems}
					</div>
				</div>
			</div>
		)
	}
}