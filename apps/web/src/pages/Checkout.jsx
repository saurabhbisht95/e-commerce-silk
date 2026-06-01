import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { addressApi } from '../api/addresses'
import { orderApi } from '../api/orders'
import { useAuth } from '../context/authContext'
import { useCommerce } from '../context/commerceContext'
import { useToast } from '../context/toastContext'
import { toUserMessage } from '../utils/apiMessages'
import { getFirstValidationMessage, validateAddressForm } from '../utils/validation'
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
  const toast = useToast()
  const { user } = useAuth()
  const { cart, cartProducts, refreshCart } = useCommerce()
  const [shippingAddress, setShippingAddress] = useState(initialAddress)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    if (!user) return undefined

    addressApi.list()
      .then(addresses => {
        if (!isMounted) return
        setSavedAddresses(addresses)
        const defaultAddress = addresses.find(address => address.isDefault) || addresses[0]
        if (defaultAddress) {
          setShippingAddress({
            fullName: defaultAddress.fullName || '',
            phone: defaultAddress.phone || '',
            line1: defaultAddress.line1 || '',
            line2: defaultAddress.line2 || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            postalCode: defaultAddress.postalCode || '',
            country: defaultAddress.country || 'India',
          })
        }
      })
      .catch(() => null)

    return () => {
      isMounted = false
    }
  }, [user])

  const updateField = event => {
    setShippingAddress(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const useSavedAddress = event => {
    const address = savedAddresses.find(item => item.id === event.target.value)
    if (!address) return
    setShippingAddress({
      fullName: address.fullName || '',
      phone: address.phone || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
    })
  }

  const submitOrder = async event => {
    event.preventDefault()
    if (!user) {
      const validationMessage = 'Please sign in before checkout.'
      setMessage(validationMessage)
      toast.warning(validationMessage)
      return
    }
    if (!cartProducts.length) {
      const validationMessage = 'Your cart is empty.'
      setMessage(validationMessage)
      toast.warning(validationMessage)
      return
    }

    const validationMessage = getFirstValidationMessage(validateAddressForm(shippingAddress))
    if (validationMessage) {
      setMessage(validationMessage)
      toast.warning(validationMessage)
      return
    }

    setIsSubmitting(true)
    setMessage('')
    try {
      const order = await orderApi.create({
        shippingAddress: Object.fromEntries(
          Object.entries(shippingAddress).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        ),
        paymentProvider: 'cod',
      })
      await refreshCart()
      toast.success(`Order ${order?.orderNumber || ''} placed successfully.`.trim())
      navigate('/orders', { state: { orderNumber: order?.orderNumber } })
    } catch (error) {
      const errorMessage = toUserMessage(error, 'Could not place your order. Please try again.')
      setMessage(errorMessage)
      toast.error(errorMessage)
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
              <form className="commerce-form" onSubmit={submitOrder} noValidate>
                {message && <div className="commerce-alert">{message}</div>}
                {savedAddresses.length > 0 && (
                  <label className="commerce-field">
                    <span>Saved Address</span>
                    <select onChange={useSavedAddress} defaultValue="">
                      <option value="">Choose saved address</option>
                      {savedAddresses.map(address => (
                        <option value={address.id} key={address.id}>
                          {address.label || 'Address'} - {address.city}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
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
                {cart?.coupon?.code && <p>Coupon: <strong>{cart.coupon.code}</strong></p>}
                {Number(cart?.pricing?.discount || 0) > 0 && (
                  <p>Discount: -₹{Number(cart?.pricing?.discount || 0).toLocaleString('en-IN')}</p>
                )}
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
