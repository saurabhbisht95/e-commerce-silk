import { useEffect } from 'react'
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import Cart from './pages/Cart.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import AdminPanel from './pages/admin/AdminPanel.jsx'
import { CommerceProvider } from './context/CommerceContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { useAuth } from './context/authContext'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

// Helper component to handle page transitions with AnimatePresence
function RequireAuth({ children }) {
  const { user, isAuthLoading } = useAuth()
  if (isAuthLoading) return null
  return user ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }) {
  const { isAdmin, isAuthLoading } = useAuth()
  if (isAuthLoading) return null
  return isAdmin ? children : <Navigate to="/account" replace />
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <CommerceProvider>
        <Router>
          <ScrollToTop />
          <AnimatedRoutes />
        </Router>
      </CommerceProvider>
    </AuthProvider>
  )
}

export default App
