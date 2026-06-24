import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt } from 'react-icons/fa'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { addressApi } from '../api/addresses'
import { locationApi } from '../api/location'
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

const addressFieldRows = [
  ['fullName', 'phone'],
  ['line1'],
  ['line2'],
  ['city', 'state'],
  ['postalCode', 'country'],
]

const addressFieldLabels = {
  fullName: 'Full Name',
  phone: 'Phone',
  line1: 'Address Line 1',
  line2: 'Address Line 2',
  city: 'City',
  state: 'State',
  postalCode: 'Postal Code',
  country: 'Country',
}

const locationRequestOptions = {
  // Network-assisted positioning is much more reliable on laptops and hosted
  // sites. The previous forced GPS/high-accuracy mode often returned code 2
  // (POSITION_UNAVAILABLE) on devices without a dedicated GPS receiver.
  enableHighAccuracy: false,
  timeout: 20000,
  maximumAge: 5 * 60 * 1000,
}

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, locationRequestOptions)
  })

const getLocationErrorMessage = error => {
  if (error?.code === 1) return 'Location permission was blocked. Please allow location access or enter the address manually.'
  if (error?.code === 2) return 'Your device could not determine its location. Turn on Location Services and Wi-Fi, allow location for this browser, then try again.'
  if (error?.code === 3) return 'Location request timed out. Please try again.'
  return toUserMessage(error, 'Could not detect your current address. Please enter it manually.')
}

const mergeDetectedAddress = (current, detected = {}) => ({
  ...current,
  line1: detected.line1 || current.line1,
  line2: detected.line2 || current.line2,
  city: detected.city || current.city,
  state: detected.state || current.state,
  postalCode: detected.postalCode || current.postalCode,
  country: detected.country || current.country || 'India',
})

function Checkout() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { cart, cartProducts, refreshCart } = useCommerce()
  const [shippingAddress, setShippingAddress] = useState(initialAddress)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

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

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const unsupportedMessage = 'Your browser does not support location access. Please enter the address manually.'
      setMessage(unsupportedMessage)
      toast.warning(unsupportedMessage)
      return
    }

    if (!window.isSecureContext) {
      const insecureMessage = 'Location access requires HTTPS. Please open the secure version of this website.'
      setMessage(insecureMessage)
      toast.warning(insecureMessage)
      return
    }

    setIsLocating(true)
    setMessage('')
    try {
      const position = await getCurrentPosition()
      const detectedAddress = await locationApi.reverseGeocode({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })

      if (!detectedAddress) throw new Error('Address not found')

      setShippingAddress(current => mergeDetectedAddress(current, detectedAddress))
      toast.success('Current location added. Please confirm the address before placing your order.')
    } catch (error) {
      const errorMessage = getLocationErrorMessage(error)
      setMessage(errorMessage)
      toast.warning(errorMessage)
    } finally {
      setIsLocating(false)
    }
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
              <Link className="commerce-btn commerce-btn--block" to="/login">Sign In</Link>
            </div>
          ) : cartProducts.length === 0 ? (
            <div className="commerce-panel">
              <p>Your cart is empty.</p>
              <Link className="commerce-btn commerce-btn--block" to="/shop">Shop Collections</Link>
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
                <div className="commerce-location-tools">
                  <button
                    className="commerce-btn commerce-btn--ghost"
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={isLocating || isSubmitting}
                  >
                    <FaMapMarkerAlt aria-hidden="true" />
                    {isLocating ? 'Detecting Address...' : 'Use My Current Location'}
                  </button>
                  <p>Allow location access to auto-fill the address. Please check house number and landmark before placing the order.</p>
                </div>
                {addressFieldRows.map(row => (
                  <div className={`commerce-field-row${row.length === 1 ? ' commerce-field-row--single' : ''}`} key={row.join('-')}>
                    {row.map(key => (
                      <label className="commerce-field" key={key}>
                        <span>{addressFieldLabels[key]}</span>
                        <input
                          name={key}
                          value={shippingAddress[key]}
                          onChange={updateField}
                          required={key !== 'line2'}
                        />
                      </label>
                    ))}
                  </div>
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
