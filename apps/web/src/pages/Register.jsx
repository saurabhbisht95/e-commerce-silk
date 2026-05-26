import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useAuth } from '../context/authContext'
import { useCommerce } from '../context/commerceContext'
import { useToast } from '../context/toastContext'
import { toUserMessage } from '../utils/apiMessages'
import { getFirstValidationMessage, validateRegisterForm } from '../utils/validation'
import './CommercePages.css'

function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const { register } = useAuth()
  const { refreshCart, refreshWishlist } = useCommerce()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async event => {
    event.preventDefault()
    const validationMessage = getFirstValidationMessage(validateRegisterForm(form))
    if (validationMessage) {
      setMessage(validationMessage)
      toast.warning(validationMessage)
      return
    }

    setIsSubmitting(true)
    setMessage('')
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      })
      await Promise.all([refreshCart(), refreshWishlist()])
      navigate('/account')
    } catch (error) {
      setMessage(toUserMessage(error, 'Account creation failed. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Create Account</h1>
          <p className="commerce-copy">Create a customer account for cart, wishlist, addresses, and order history.</p>

          <form className="commerce-form" onSubmit={handleSubmit} noValidate>
            {message && <div className="commerce-alert">{message}</div>}
            <label className="commerce-field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={updateField} required />
            </label>
            <label className="commerce-field">
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={updateField} required />
            </label>
            <label className="commerce-field">
              <span>Phone</span>
              <input name="phone" value={form.phone} onChange={updateField} />
            </label>
            <label className="commerce-field">
              <span>Password</span>
              <input name="password" type="password" minLength="8" value={form.password} onChange={updateField} required />
            </label>
            <div className="commerce-actions">
              <button className="commerce-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
              <Link to="/login" className="commerce-btn commerce-btn--ghost">Sign In</Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Register
