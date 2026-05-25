import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { orderApi } from '../api/orders'
import { useAuth } from '../context/authContext'
import { useCommerce } from '../context/commerceContext'
import './CommercePages.css'

const initialAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
}

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, cartProducts, refreshCart } = useCommerce()
  const [shippingAddress, setShippingAddress] = useState(initialAddress)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = event => {
    setShippingAddress(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submitOrder = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const order = await orderApi.create({
        shippingAddress,
        paymentProvider: 'cod',
      })
      await refreshCart()
      navigate('/orders', { state: { orderNumber: order?.orderNumber } })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Checkout</h1>
          <p className="commerce-copy">Cash on delivery is enabled. Online payment adapters are ready in the backend.</p>

          {!user ? (
            <div className="commerce-panel">
              <p>Please sign in before checkout.</p>
              <Link className="commerce-btn" to="/login">Sign In</Link>
            </div>
          ) : cartProducts.length === 0 ? (
            <div className="commerce-panel">
              <p>Your cart is empty.</p>
              <Link className="commerce-btn" to="/shop">Shop Collections</Link>
            </div>
          ) : (
            <div className="commerce-grid">
              <form className="commerce-form" onSubmit={submitOrder}>
                {message && <div className="commerce-alert">{message}</div>}
                {Object.entries(shippingAddress).map(([key, value]) => (
                  <label className="commerce-field" key={key}>
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input name={key} value={value} onChange={updateField} required={!['line2'].includes(key)} />
                  </label>
                ))}
                <button className="commerce-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Placing Order...' : 'Place COD Order'}
                </button>
              </form>

              <aside className="commerce-panel">
                <h2>Order Summary</h2>
                <p>{cartProducts.length} item(s)</p>
                <p>Subtotal: ₹{Number(cart?.pricing?.subtotal || 0).toLocaleString('en-IN')}</p>
                <p>Shipping: ₹{Number(cart?.pricing?.shipping || 0).toLocaleString('en-IN')}</p>
                <p><strong>Total: ₹{Number(cart?.pricing?.total || 0).toLocaleString('en-IN')}</strong></p>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Checkout
