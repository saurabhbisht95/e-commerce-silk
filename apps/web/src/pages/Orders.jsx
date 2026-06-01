import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { orderApi } from '../api/orders'
import { useCommerce } from '../context/commerceContext'
import { useToast } from '../context/toastContext'
import { toUserMessage } from '../utils/apiMessages'
import './CommercePages.css'

function Orders() {
  const location = useLocation()
  const toast = useToast()
  const { refreshCart } = useCommerce()
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState(location.state?.orderNumber ? `Order ${location.state.orderNumber} placed successfully.` : '')
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [workingOrderId, setWorkingOrderId] = useState('')

  const loadOrders = useCallback(async () => {
    const nextOrders = await orderApi.myOrders()
    setOrders(nextOrders)
  }, [])

  useEffect(() => {
    if (location.state?.orderNumber) toast.success(`Order ${location.state.orderNumber} placed successfully.`)
  }, [location.state?.orderNumber, toast])

  useEffect(() => {
    let isMounted = true
    orderApi.myOrders()
      .then(nextOrders => {
        if (isMounted) setOrders(nextOrders)
      })
      .catch(error => {
        if (isMounted) {
          const errorMessage = toUserMessage(error, 'Could not load orders.')
          setMessage(errorMessage)
          toast.error(errorMessage)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingOrders(false)
      })
    return () => {
      isMounted = false
    }
  }, [toast])

  const cancelOrder = async order => {
    const reason = window.prompt('Reason for cancellation')
    if (!reason) return
    if (reason.trim().length < 3) {
      toast.warning('Cancellation reason must be at least 3 characters.')
      return
    }

    setWorkingOrderId(order.id)
    try {
      await orderApi.cancel(order.id, reason.trim())
      await loadOrders()
      toast.success(`Order ${order.orderNumber} cancelled.`)
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not cancel this order.'))
    } finally {
      setWorkingOrderId('')
    }
  }

  const requestReturn = async order => {
    const reason = window.prompt('Reason for return request')
    if (!reason) return
    if (reason.trim().length < 3) {
      toast.warning('Return reason must be at least 3 characters.')
      return
    }

    setWorkingOrderId(order.id)
    try {
      await orderApi.requestReturn(order.id, reason.trim())
      await loadOrders()
      toast.success(`Return request submitted for ${order.orderNumber}.`)
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not submit return request.'))
    } finally {
      setWorkingOrderId('')
    }
  }

  const reorder = async order => {
    setWorkingOrderId(order.id)
    try {
      await orderApi.reorder(order.id)
      await refreshCart()
      toast.success(`Items from ${order.orderNumber} were added to cart.`)
    } catch (error) {
      toast.error(toUserMessage(error, 'Could not reorder these items.'))
    } finally {
      setWorkingOrderId('')
    }
  }

  const canCancel = status => !['delivered', 'cancelled', 'refunded'].includes(status)
  const canReturn = status => status === 'delivered'

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Orders</h1>
          <p className="commerce-copy">Track order history and status.</p>
          {message && <div className={`commerce-alert ${location.state?.orderNumber ? 'commerce-success' : ''}`}>{message}</div>}

          {isLoadingOrders ? (
            <div className="commerce-panel" style={{ marginTop: 18 }}>
              <p>Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="commerce-panel" style={{ marginTop: 18 }}>
              <p>No orders yet.</p>
              <Link className="commerce-btn" to="/shop">Shop Collections</Link>
            </div>
          ) : (
            <div className="commerce-table-wrap" style={{ marginTop: 18 }}>
              <table className="commerce-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.status}</td>
                      <td>₹{Number(order.pricing?.total || 0).toLocaleString('en-IN')}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="commerce-actions">
                          <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => reorder(order)} disabled={Boolean(workingOrderId)}>
                            {workingOrderId === order.id ? 'Working...' : 'Reorder'}
                          </button>
                          {canCancel(order.status) && (
                            <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => cancelOrder(order)} disabled={Boolean(workingOrderId)}>
                              Cancel
                            </button>
                          )}
                          {canReturn(order.status) && (
                            <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => requestReturn(order)} disabled={Boolean(workingOrderId)}>
                              Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Orders
