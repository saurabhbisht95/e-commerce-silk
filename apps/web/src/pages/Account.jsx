import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { addressApi } from '../api/addresses'
import { useAuth } from '../context/authContext'
import { useToast } from '../context/toastContext'
import { toUserMessage } from '../utils/apiMessages'
import { getFirstValidationMessage, validateAddressForm } from '../utils/validation'
import './CommercePages.css'

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

const emptyAddress = {
  id: '',
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
}

const addressFieldRows = [
  ['label'],
  ['fullName', 'phone'],
  ['line1'],
  ['line2'],
  ['city', 'state'],
  ['postalCode', 'country'],
]

const addressFieldLabels = {
  label: 'Label',
  fullName: 'Full Name',
  phone: 'Phone',
  line1: 'Address Line 1',
  line2: 'Address Line 2',
  city: 'City',
  state: 'State',
  postalCode: 'Postal Code',
  country: 'Country',
}

function Account() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, isAdmin, logout } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState(emptyAddress)
  const [addressMessage, setAddressMessage] = useState('')
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  const loadAddresses = async () => {
    const nextAddresses = await addressApi.list()
    setAddresses(nextAddresses)
  }

  useEffect(() => {
    let isMounted = true
    if (!user) return undefined

    addressApi.list()
      .then(nextAddresses => {
        if (isMounted) setAddresses(nextAddresses)
      })
      .catch(error => {
        if (isMounted) {
          const errorMessage = toUserMessage(error, 'Could not load saved addresses.')
          setAddressMessage(errorMessage)
          toast.error(errorMessage)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingAddresses(false)
      })

    return () => {
      isMounted = false
    }
  }, [toast, user])

  const updateAddressField = event => {
    const { name, value, type, checked } = event.target
    setAddressForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetAddressForm = () => {
    setAddressForm(emptyAddress)
    setAddressMessage('')
  }

  const editAddress = address => {
    setAddressForm({
      id: address.id,
      label: address.label || 'Home',
      fullName: address.fullName || '',
      phone: address.phone || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      isDefault: Boolean(address.isDefault),
    })
    setAddressMessage('')
  }

  const saveAddress = async event => {
    event.preventDefault()
    const validationMessage = getFirstValidationMessage(validateAddressForm(addressForm))
    if (validationMessage) {
      setAddressMessage(validationMessage)
      toast.warning(validationMessage)
      return
    }

    const payload = Object.fromEntries(
      Object.entries(addressForm)
        .filter(([key]) => key !== 'id')
        .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    )

    setIsSavingAddress(true)
    try {
      if (addressForm.id) await addressApi.update(addressForm.id, payload)
      else await addressApi.create(payload)
      await loadAddresses()
      resetAddressForm()
      toast.success('Address saved successfully.')
    } catch (error) {
      const errorMessage = toUserMessage(error, 'Could not save address.')
      setAddressMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSavingAddress(false)
    }
  }

  const deleteAddress = async address => {
    if (!window.confirm('Delete this address?')) return
    try {
      await addressApi.remove(address.id)
      await loadAddresses()
      if (addressForm.id === address.id) resetAddressForm()
      toast.success('Address deleted successfully.')
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not delete address.'))
    }
  }

  const setDefaultAddress = async address => {
    try {
      await addressApi.setDefault(address.id)
      await loadAddresses()
      toast.success('Default address updated.')
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not update default address.'))
    }
  }

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
                <a className="commerce-btn" href={ADMIN_URL}>Open Admin Panel</a>
              </section>
            )}
          </div>

          <div className="account-address-layout">
            <section className="commerce-panel account-address-form-panel">
              <div className="commerce-section-heading">
                <h2>{addressForm.id ? 'Edit Address' : 'Add Address'}</h2>
                {addressForm.id && (
                  <button className="commerce-btn commerce-btn--ghost" type="button" onClick={resetAddressForm} disabled={isSavingAddress}>
                    New Address
                  </button>
                )}
              </div>
              {addressMessage && <div className="commerce-alert">{addressMessage}</div>}
              <form className="commerce-form commerce-form--embedded" onSubmit={saveAddress} noValidate>
                {addressFieldRows.map(row => (
                  <div className={`commerce-field-row${row.length === 1 ? ' commerce-field-row--single' : ''}`} key={row.join('-')}>
                    {row.map(key => (
                      <label className="commerce-field" key={key}>
                        <span>{addressFieldLabels[key]}</span>
                        <input
                          name={key}
                          value={addressForm[key]}
                          onChange={updateAddressField}
                          required={!['label', 'line2'].includes(key)}
                        />
                      </label>
                    ))}
                  </div>
                ))}
                <label className="commerce-checkline">
                  <input name="isDefault" type="checkbox" checked={addressForm.isDefault} onChange={updateAddressField} />
                  <span>
                    <strong>Default Address</strong>
                    <small>Use this address first during checkout.</small>
                  </span>
                </label>
                <div className="commerce-actions commerce-actions--end">
                  <button className="commerce-btn" type="submit" disabled={isSavingAddress}>
                    {isSavingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                  {!addressForm.id && (
                    <button className="commerce-btn commerce-btn--ghost" type="button" onClick={resetAddressForm} disabled={isSavingAddress}>Clear</button>
                  )}
                </div>
              </form>
            </section>

            <section className="commerce-table-wrap">
              <h2>Saved Addresses</h2>
              {isLoadingAddresses ? (
                <p className="commerce-muted">Loading saved addresses...</p>
              ) : addresses.length === 0 ? (
                <p className="commerce-muted">No saved addresses yet.</p>
              ) : (
                <div className="commerce-list">
                  {addresses.map(address => (
                    <article className="commerce-panel" key={address.id}>
                      <h3>{address.label || 'Address'} {address.isDefault ? '(Default)' : ''}</h3>
                      <p>{address.fullName} - {address.phone}</p>
                      <p className="commerce-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} {address.postalCode}</p>
                      <div className="commerce-actions commerce-actions--compact">
                        <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => editAddress(address)} disabled={isSavingAddress}>Edit</button>
                        {!address.isDefault && (
                          <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => setDefaultAddress(address)} disabled={isSavingAddress}>Set Default</button>
                        )}
                        <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => deleteAddress(address)} disabled={isSavingAddress}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="commerce-actions account-footer-actions">
            <button className="commerce-btn" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Account
