import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAuth } from '../context/authContext'
import './CommercePages.css'

function Account() {
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Account</h1>
          <p className="commerce-copy">Welcome{user?.name ? `, ${user.name}` : ''}. Manage shopping activity from here.</p>

          <div className="commerce-grid">
            <section className="commerce-panel">
              <h2>Profile</h2>
              <p>{user?.email}</p>
              <p className="commerce-muted">{user?.phone || 'No phone added'}</p>
            </section>
            <section className="commerce-panel">
              <h2>Shopping</h2>
              <div className="commerce-actions">
                <Link className="commerce-btn commerce-btn--ghost" to="/orders">Orders</Link>
                <Link className="commerce-btn commerce-btn--ghost" to="/wishlist">Wishlist</Link>
                <Link className="commerce-btn commerce-btn--ghost" to="/cart">Cart</Link>
              </div>
            </section>
            {isAdmin && (
              <section className="commerce-panel">
                <h2>Admin</h2>
                <Link className="commerce-btn" to="/admin">Open Admin Panel</Link>
              </section>
            )}
          </div>

          <div className="commerce-actions" style={{ marginTop: 22 }}>
            <button className="commerce-btn" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Account
