import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import { orderApi } from '../api/orders'
import './CommercePages.css'

function Orders() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState(location.state?.orderNumber ? `Order ${location.state.orderNumber} placed successfully.` : '')

  useEffect(() => {
    let isMounted = true
    orderApi.myOrders()
      .then(nextOrders => {
        if (isMounted) setOrders(nextOrders)
      })
      .catch(error => {
        if (isMounted) setMessage(error.message)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Orders</h1>
          <p className="commerce-copy">Track order history and status.</p>
          {message && <div className={`commerce-alert ${location.state?.orderNumber ? 'commerce-success' : ''}`}>{message}</div>}

          {orders.length === 0 ? (
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
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.status}</td>
                      <td>₹{Number(order.pricing?.total || 0).toLocaleString('en-IN')}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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
