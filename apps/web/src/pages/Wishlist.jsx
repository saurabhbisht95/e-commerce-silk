import { Link } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAuth } from '../context/authContext'
import { useCommerce } from '../context/commerceContext'
import './CommercePages.css'

function Wishlist() {
  const { user } = useAuth()
  const { wishlistProducts, addToCart, removeFromWishlist } = useCommerce()

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Wishlist</h1>
          <p className="commerce-copy">Save favorite products to revisit later.</p>

          {!user ? (
            <div className="commerce-panel">
              <p>Please sign in to manage your wishlist.</p>
              <Link className="commerce-btn" to="/login">Sign In</Link>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="commerce-panel">
              <p>Your wishlist is empty.</p>
              <Link className="commerce-btn" to="/shop">Browse Products</Link>
            </div>
          ) : (
            <div className="commerce-list">
              {wishlistProducts.map(product => (
                <article className="commerce-item" key={product.backendId || product.id}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <h3>{product.name}</h3>
                    <small>{product.category}</small>
                    <span className="commerce-price">{product.price}</span>
                    <div className="commerce-actions" style={{ marginTop: 10 }}>
                      <button className="commerce-btn" type="button" onClick={() => addToCart(product)}>Add to Cart</button>
                      <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => removeFromWishlist(product)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Wishlist
