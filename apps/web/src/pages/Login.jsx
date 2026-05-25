import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAuth } from '../context/authContext'
import { useCommerce } from '../context/commerceContext'
import './CommercePages.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { refreshCart, refreshWishlist } = useCommerce()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      await login(form)
      await Promise.all([refreshCart(), refreshWishlist()])
      navigate('/account')
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
          <h1 className="commerce-title">Sign In</h1>
          <p className="commerce-copy">Access orders, wishlist items, saved cart, and checkout.</p>

          <form className="commerce-form" onSubmit={handleSubmit}>
            {message && <div className="commerce-alert">{message}</div>}
            <label className="commerce-field">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={updateField} required />
            </label>
            <label className="commerce-field">
              <span>Password</span>
              <input name="password" type="password" value={form.password} onChange={updateField} required />
            </label>
            <div className="commerce-actions">
              <button className="commerce-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
              <Link to="/register" className="commerce-btn commerce-btn--ghost">Create Account</Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Login
