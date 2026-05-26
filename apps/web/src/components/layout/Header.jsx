import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { useCommerce } from '../../context/commerceContext'
import { useAuth } from '../../context/authContext'
import doonSilkLogo from '../../assets/doonsilklogo.png'
import './Header.css'

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const IconFlower = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
  </svg>
)

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" ry="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const AipanBorderSVG = ({ className = 'aipan-pattern-border' }) => (
  <svg width="100%" height="14" className={className} preserveAspectRatio="none">
    <defs>
      <pattern id="aipan" x="0" y="0" width="40" height="14" patternUnits="userSpaceOnUse">
        <path d="M20 2 L25 7 L20 12 L15 7 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="20" cy="7" r="1.5" fill="currentColor" />
        <circle cx="6" cy="7" r="1.2" fill="currentColor" />
        <circle cx="34" cy="7" r="1.2" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#aipan)" />
  </svg>
)

const ScallopedArchSVG = () => (
  <svg viewBox="0 0 320 180" className="scalloped-arch" fill="none" preserveAspectRatio="none">
    <path
      d="M 0 180 L 0 120 C 0 100, 30 80, 60 70 C 90 60, 80 30, 160 5 C 240 30, 230 60, 260 70 C 290 80, 320 100, 320 120 L 320 180"
      fill="var(--color-cream-light)"
    />
    <path
      d="M 0 180 L 0 120 C 0 100, 30 80, 60 70 C 90 60, 80 30, 160 5 C 240 30, 230 60, 260 70 C 290 80, 320 100, 320 120 L 320 180"
      stroke="url(#archGrad)"
      strokeWidth="3"
    />
    <path
      d="M 8 180 L 8 123 C 8 105, 36 86, 64 76 C 92 67, 83 38, 160 14 C 237 38, 228 67, 256 76 C 284 86, 312 105, 312 123 L 312 180"
      stroke="var(--color-maroon)"
      strokeWidth="1"
      opacity="0.4"
    />
    <defs>
      <linearGradient id="archGrad" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C8A96A" />
        <stop offset="30%" stopColor="#E2C98A" />
        <stop offset="50%" stopColor="#FFF2D8" />
        <stop offset="70%" stopColor="#E2C98A" />
        <stop offset="100%" stopColor="#C8A96A" />
      </linearGradient>
    </defs>
  </svg>
)

const NavDeco = () => (
  <div className="nav-deco">
    <svg viewBox="0 0 10 10" fill="currentColor">
      <path d="M5 0 L10 5 L5 10 L0 5 Z" />
      <circle cx="5" cy="5" r="1.5" fill="var(--color-cream-light)" />
    </svg>
  </div>
)

const HEADER_LINKS = ['Fabric', 'Kurta', 'Saree', 'Shawls', 'Muffler', 'Stoles', 'Suits', 'Collections']
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

function Header() {
  const scrollY = useScrollPosition()
  const isScrolled = scrollY > 40
  const [activePanel, setActivePanel] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { products, cartProducts, cartCount, wishlistProducts, refreshCart, refreshWishlist } = useCommerce()
  const { user, isAdmin, logout } = useAuth()

  const previewProducts = cartProducts.slice(0, 4)
  const searchResults = products.filter(product => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return `${product.name} ${product.category}`.toLowerCase().includes(query)
  }).slice(0, 6)

  const togglePanel = panelName => {
    setActivePanel(current => (current === panelName ? null : panelName))
  }

  const closePanel = () => setActivePanel(null)

  const handleLogout = async () => {
    await logout()
    await Promise.all([refreshCart(), refreshWishlist()])
    closePanel()
  }

  return (
    <header className={`ds-header ${isScrolled ? 'ds-header--scrolled' : ''}`}>
      <div className="ds-top-strip">
        <div className="ds-top-strip__inner container">
          <div className="ds-top-strip__group">
            <div className="top-strip-item">
              <IconFlower />
              <span>Handwoven in Doon Valley</span>
            </div>
            <span className="top-strip-sep hide-mobile">|</span>
            <div className="top-strip-item hide-mobile">
              <IconFlower />
              <span>100% Pure Silk</span>
            </div>
          </div>

          <div className="ds-top-strip__group">
            <div className="top-strip-item hide-mobile">
              <IconTruck />
              <span>Free Shipping on Orders Above Rs.1999</span>
            </div>
            <span className="top-strip-sep hide-mobile">|</span>
            <div className="top-strip-item">
              <IconGlobe />
              <span>Worldwide Delivery</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-header__body">
        <div className="ds-header__main container">
          <button
            className="ds-hamburger"
            aria-label="Open Menu"
            aria-expanded={activePanel === 'menu'}
            onClick={() => togglePanel('menu')}
          >
            <IconMenu />
          </button>

          <div className="ds-header__actions">
            <button
              className="ds-icon-btn ds-search-trigger"
              aria-label="Search"
              aria-expanded={activePanel === 'search'}
              onClick={() => togglePanel('search')}
            >
              <IconSearch />
            </button>
            <button
              className="ds-icon-btn"
              aria-label="Wishlist"
              aria-expanded={activePanel === 'wishlist'}
              onClick={() => togglePanel('wishlist')}
            >
              <IconHeart />
            </button>
            <button
              className="ds-icon-btn hide-mobile"
              aria-label="Account"
              aria-expanded={activePanel === 'account'}
              onClick={() => togglePanel('account')}
            >
              <IconUser />
            </button>
            <button
              className="ds-icon-btn"
              aria-label="Cart"
              aria-expanded={activePanel === 'cart'}
              onClick={() => togglePanel('cart')}
            >
              <IconCart />
              <span className="ds-cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>

        <nav className="ds-nav-bar container">
          <div className="ds-nav-group ds-nav-left">
            {HEADER_LINKS.slice(0, 4).map((link, index) => (
              <div className="nav-link-wrapper" key={link}>
                <Link to="/shop" className="nav-link" onClick={closePanel}>{link}</Link>
                <NavDeco />
                {index < 3 && <span className="nav-sep">|</span>}
              </div>
            ))}
          </div>

          <div className="ds-nav-logo-spacer" aria-hidden="true"></div>

          <div className="ds-nav-group ds-nav-right">
            {HEADER_LINKS.slice(4).map((link, index) => (
              <div className="nav-link-wrapper" key={link}>
                <Link to="/shop" className="nav-link" onClick={closePanel}>{link}</Link>
                <NavDeco />
                {index < 3 && <span className="nav-sep">|</span>}
              </div>
            ))}
          </div>
        </nav>

        <div className="ds-logo-container">
          <ScallopedArchSVG />
          <Link to="/" className="ds-logo-content" onClick={closePanel}>
            <div className="ds-logo-mark">
              <img src={doonSilkLogo} alt="" aria-hidden="true" />
            </div>
            <span className="ds-logo-name">DOON SILK</span>
          </Link>
        </div>
      </div>

      {activePanel && (
        <div className="ds-panel">
          <div className="ds-panel__inner container">
            <button className="ds-panel__close" type="button" onClick={closePanel}>Close</button>

            {activePanel === 'menu' && (
              <div className="ds-panel-grid ds-panel-grid--menu">
                {HEADER_LINKS.map(item => (
                  <Link key={item} to="/shop" className="ds-panel-link" onClick={closePanel}>
                    {item}
                  </Link>
                ))}
              </div>
            )}

            {activePanel === 'search' && (
              <div className="ds-search-panel">
                <label className="ds-search-label" htmlFor="header-search">Search Doon Silk</label>
                <input
                  id="header-search"
                  className="ds-search-input"
                  type="search"
                  value={searchTerm}
                  placeholder="Search sarees, kurtas, fabrics..."
                  onChange={event => setSearchTerm(event.target.value)}
                  autoFocus
                />
                <div className="ds-panel-products">
                  {searchResults.map(product => (
                    <Link to="/shop" className="ds-panel-product" key={product.backendId || product.id} onClick={closePanel}>
                      <img src={product.image} alt={product.name} />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.category} - {product.price}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'wishlist' && (
              <div className="ds-mini-panel">
                <h3>Wishlist</h3>
                <div className="ds-panel-products">
                  {wishlistProducts.map(product => (
                    <Link to="/shop" className="ds-panel-product" key={product.backendId || product.id} onClick={closePanel}>
                      <img src={product.image} alt={product.name} />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.price}</small>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link to="/wishlist" className="ds-panel-cta" onClick={closePanel}>View Wishlist</Link>
              </div>
            )}

            {activePanel === 'account' && (
              <div className="ds-mini-panel">
                <h3>Account</h3>
                <p>{user ? `Signed in as ${user.name}` : 'Sign in to manage orders, wishlist items, and saved addresses.'}</p>
                <div className="ds-account-actions">
                  {user ? (
                    <>
                      <Link to="/account" onClick={closePanel}>Account</Link>
                      <Link to="/orders" onClick={closePanel}>Orders</Link>
                      {isAdmin && <a href={ADMIN_URL} onClick={closePanel}>Admin</a>}
                      <button type="button" onClick={handleLogout}>Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={closePanel}>Sign In</Link>
                      <Link to="/register" onClick={closePanel}>Create Account</Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'cart' && (
              <div className="ds-mini-panel">
                <h3>Cart</h3>
                <div className="ds-panel-products">
                  {previewProducts.map(product => (
                    <Link to="/shop" className="ds-panel-product" key={product.backendId || product.id} onClick={closePanel}>
                      <img src={product.image} alt={product.name} />
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.price}</small>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link to="/cart" className="ds-panel-cta" onClick={closePanel}>Checkout</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ color: 'var(--color-maroon)' }}>
        <AipanBorderSVG className="aipan-pattern-border aipan-pattern-border--main" />
      </div>
    </header>
  )
}

export default Header
