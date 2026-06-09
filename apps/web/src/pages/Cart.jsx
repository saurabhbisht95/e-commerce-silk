import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { getBackendProductId } from '../api/products'
import { useCommerce } from '../context/commerceContext'
import './CommercePages.css'

function Cart() {
  const {
    cart,
    cartProducts,
    updateCartItem,
    removeCartItem,
    applyCoupon,
    removeCoupon,
    isCartUpdating,
    isCatalogLoading,
  } = useCommerce()
  const [couponCode, setCouponCode] = useState('')

  const updateQuantity = product => event => {
    const quantity = Number(event.target.value)
    if (quantity < 1 || isCartUpdating) return
    updateCartItem({ productId: getBackendProductId(product), quantity })
  }

  const removeItem = product => {
    if (isCartUpdating) return
    removeCartItem({ productId: getBackendProductId(product) })
  }

  const submitCoupon = async event => {
    event.preventDefault()
    const nextCart = await applyCoupon(couponCode)
    if (nextCart?.coupon?.code) setCouponCode('')
  }

  const activeCouponCode = cart?.coupon?.code

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Cart</h1>
          <p className="commerce-copy">Review selected Doon Silk pieces before checkout.</p>

          {isCatalogLoading && !cart ? (
            <div className="commerce-panel">
              <p>Loading your cart...</p>
            </div>
          ) : cartProducts.length === 0 ? (
            <div className="commerce-panel">
              <p>Your cart is empty.</p>
              <Link className="commerce-btn" to="/shop">Shop Collections</Link>
            </div>
          ) : (
            <div className="commerce-grid">
              <div className="commerce-list">
                {cartProducts.map(product => (
                  <article className="commerce-item" key={product.backendId || product.id}>
                    <img src={product.image} alt={product.name} />
                    <div>
                      <h3>{product.name}</h3>
                      <small>{product.category}</small>
                      <span className="commerce-price">{product.price}</span>
                      <div className="commerce-actions" style={{ marginTop: 10 }}>
                        <label className="commerce-field" style={{ maxWidth: 120 }}>
                          <span>Qty</span>
                          <input type="number" min="1" value={product.quantity || 1} onChange={updateQuantity(product)} disabled={isCartUpdating} />
                        </label>
                        <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => removeItem(product)} disabled={isCartUpdating}>
                          {isCartUpdating ? 'Updating...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="commerce-panel">
                <h2>Summary</h2>
                <p>Subtotal: ₹{Number(cart?.pricing?.subtotal || 0).toLocaleString('en-IN')}</p>
                {Number(cart?.pricing?.discount || 0) > 0 && (
                  <p>Discount: -₹{Number(cart?.pricing?.discount || 0).toLocaleString('en-IN')}</p>
                )}
                <p>Shipping: ₹{Number(cart?.pricing?.shipping || 0).toLocaleString('en-IN')}</p>
                <p><strong>Total: ₹{Number(cart?.pricing?.total || 0).toLocaleString('en-IN')}</strong></p>

                {activeCouponCode ? (
                  <div className="commerce-actions" style={{ margin: '14px 0' }}>
                    <p style={{ margin: 0 }}>Coupon: <strong>{activeCouponCode}</strong></p>
                    <button className="commerce-btn commerce-btn--ghost" type="button" onClick={removeCoupon} disabled={isCartUpdating}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <form className="commerce-form" onSubmit={submitCoupon} noValidate style={{ margin: '14px 0', padding: 0, border: 0, background: 'transparent' }}>
                    <label className="commerce-field">
                      <span>Coupon Code</span>
                      <input value={couponCode} onChange={event => setCouponCode(event.target.value.toUpperCase())} disabled={isCartUpdating} />
                    </label>
                    <button className="commerce-btn commerce-btn--ghost" type="submit" disabled={isCartUpdating}>
                      {isCartUpdating ? 'Applying...' : 'Apply Coupon'}
                    </button>
                  </form>
                )}
                <Link className="commerce-btn commerce-btn--block" to="/checkout">Checkout</Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Cart
