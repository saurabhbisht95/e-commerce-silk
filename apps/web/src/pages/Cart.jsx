import { Link } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { getBackendProductId } from '../api/products'
import { useCommerce } from '../context/commerceContext'
import './CommercePages.css'

function Cart() {
  const { cart, cartProducts, updateCartItem, removeCartItem } = useCommerce()

  const updateQuantity = product => event => {
    const quantity = Number(event.target.value)
    if (quantity < 1) return
    updateCartItem({ productId: getBackendProductId(product), quantity })
  }

  const removeItem = product => {
    removeCartItem({ productId: getBackendProductId(product) })
  }

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Cart</h1>
          <p className="commerce-copy">Review selected Doon Silk pieces before checkout.</p>

          {cartProducts.length === 0 ? (
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
                          <input type="number" min="1" value={product.quantity || 1} onChange={updateQuantity(product)} />
                        </label>
                        <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => removeItem(product)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="commerce-panel">
                <h2>Summary</h2>
                <p>Subtotal: ₹{Number(cart?.pricing?.subtotal || 0).toLocaleString('en-IN')}</p>
                <p>Shipping: ₹{Number(cart?.pricing?.shipping || 0).toLocaleString('en-IN')}</p>
                <p><strong>Total: ₹{Number(cart?.pricing?.total || 0).toLocaleString('en-IN')}</strong></p>
                <Link className="commerce-btn" to="/checkout">Checkout</Link>
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
