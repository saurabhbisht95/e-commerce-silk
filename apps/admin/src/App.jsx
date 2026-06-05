import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi, apiConfig, resolveMediaUrl, setRequestSubscriber, tokenStore } from './api'

const sections = [
  { key: 'dashboard', label: 'Dashboard', short: 'DB', description: 'Daily command center' },
  { key: 'products', label: 'Products', short: 'PR', description: 'Catalog and stock' },
  { key: 'orders', label: 'Orders', short: 'OR', description: 'Fulfillment queue' },
  { key: 'content', label: 'Content', short: 'CO', description: 'Banners and categories' },
  { key: 'coupons', label: 'Coupons', short: 'CP', description: 'Offers and rules' },
  { key: 'customers', label: 'Customers', short: 'CU', description: 'Users and access' },
  { key: 'debug', label: 'Debug', short: 'DG', description: 'Runtime requests' },
]

const productStatuses = ['active', 'draft', 'archived']
const orderStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const roles = ['user', 'admin', 'super_admin']

const emptyProductForm = {
  id: '',
  name: '',
  sku: '',
  category: '',
  brand: 'Doon Silk',
  price: '',
  stock: '',
  status: 'active',
  shortDescription: '',
  description: '',
  imageUrl: '',
  featured: false,
  trending: false,
}

const emptyBannerForm = {
  id: '',
  headlineOne: '',
  headlineTwo: '',
  subtext: '',
  cta: 'Explore Collection',
  ctaHref: '/collections',
  modelImageUrl: '',
  sideImageUrl: '',
  sortOrder: '0',
  isActive: true,
}

const emptyCouponForm = {
  id: '',
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  expiresAt: '',
  usageLimit: '',
  userUsageLimit: '',
  isActive: true,
}

const money = value => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

const isAdminUser = user => user?.roles?.some(role => ['admin', 'super_admin'].includes(role))

const firstMessage = fields => Object.values(fields).find(Boolean) || ''

const validateProduct = form => firstMessage({
  name: form.name.trim().length >= 2 ? '' : 'Product name is required.',
  sku: form.sku.trim() ? '' : 'SKU is required.',
  category: form.category ? '' : 'Select a category.',
  price: Number(form.price) >= 0 && form.price !== '' ? '' : 'Enter a valid price.',
  stock: form.stock !== '' && Number.isInteger(Number(form.stock)) && Number(form.stock) >= 0 ? '' : 'Enter valid stock.',
})

const validateBanner = (form, modelFile) => firstMessage({
  headline: form.headlineOne.trim() ? '' : 'Banner headline is required.',
  cta: form.cta.trim() ? '' : 'Banner CTA is required.',
  image: modelFile || /^https?:\/\//.test(form.modelImageUrl) ? '' : 'Add or upload a main banner image.',
})

const validateCoupon = form => firstMessage({
  code: form.code.trim().length >= 2 ? '' : 'Coupon code is required.',
  value: Number(form.value) > 0 ? '' : 'Coupon value must be greater than 0.',
  expiresAt: form.expiresAt ? '' : 'Coupon expiry date is required.',
})

function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(min-width: 981px)').matches
  })
  const [toast, setToast] = useState(null)
  const [requestLog, setRequestLog] = useState([])
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [dashboard, setDashboard] = useState(null)
  const [analytics, setAnalytics] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [banners, setBanners] = useState([])
  const [coupons, setCoupons] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [productFiles, setProductFiles] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [bannerForm, setBannerForm] = useState(emptyBannerForm)
  const [bannerModelFile, setBannerModelFile] = useState(null)
  const [bannerSideFile, setBannerSideFile] = useState(null)
  const [couponForm, setCouponForm] = useState(emptyCouponForm)
  const [filters, setFilters] = useState({ productSearch: '', orderStatus: '', userSearch: '', couponSearch: '' })

  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() })
    window.setTimeout(() => setToast(current => (current?.message === message ? null : current)), 4200)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const desktopQuery = window.matchMedia('(min-width: 981px)')
    const syncSidebar = event => setSidebarOpen(event.matches)

    desktopQuery.addEventListener('change', syncSidebar)
    return () => desktopQuery.removeEventListener('change', syncSidebar)
  }, [])

  useEffect(() => {
    if (!sidebarOpen || typeof window === 'undefined') return undefined

    const closeOnEscape = event => {
      if (event.key === 'Escape' && window.matchMedia('(max-width: 980px)').matches) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [sidebarOpen])

  useEffect(() => {
    setRequestSubscriber(entry => {
      setRequestLog(current => [entry, ...current].slice(0, 80))
    })
  }, [])

  const loadHealth = useCallback(async () => {
    try {
      const result = await adminApi.health()
      setHealth(result)
      return result
    } catch (error) {
      setHealth({ success: false, message: error.message })
      return null
    }
  }, [])

  const loadAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        statsResult,
        analyticsResult,
        productResult,
        categoryResult,
        orderResult,
        userResult,
        bannerResult,
        couponResult,
        lowStockResult,
      ] = await Promise.all([
        adminApi.dashboard(),
        adminApi.salesAnalytics({ groupBy: 'day' }).catch(() => []),
        adminApi.listProducts({ limit: 100, search: filters.productSearch }),
        adminApi.listCategories(),
        adminApi.listOrders({ limit: 50, status: filters.orderStatus }),
        adminApi.listUsers({ limit: 50, search: filters.userSearch }),
        adminApi.listBanners({ includeInactive: true }),
        adminApi.listCoupons({ limit: 50, search: filters.couponSearch }),
        adminApi.lowStock(),
      ])

      setDashboard(statsResult)
      setAnalytics(analyticsResult)
      setProducts(productResult.products)
      setCategories(categoryResult)
      setOrders(orderResult.orders)
      setUsers(userResult.users)
      setBanners(bannerResult)
      setCoupons(couponResult.coupons)
      setLowStock(lowStockResult)
    } catch (error) {
      notify('error', error.message)
      if (error.status === 401 || error.status === 403) {
        tokenStore.clear()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [filters.couponSearch, filters.orderStatus, filters.productSearch, filters.userSearch, notify])

  useEffect(() => {
    const boot = async () => {
      await loadHealth()
      if (!tokenStore.get()) {
        setAuthChecked(true)
        return
      }

      try {
        const profile = await adminApi.me()
        if (!isAdminUser(profile)) {
          tokenStore.clear()
          notify('error', 'This account does not have admin access.')
        } else {
          setUser(profile)
        }
      } catch {
        tokenStore.clear()
      } finally {
        setAuthChecked(true)
      }
    }

    boot()
  }, [loadHealth, notify])

  useEffect(() => {
    if (!user) return undefined
    const timer = window.setTimeout(() => {
      loadAdminData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadAdminData, user])

  const activeSectionMeta = useMemo(
    () => sections.find(section => section.key === activeSection) || sections[0],
    [activeSection],
  )

  const dashboardCards = useMemo(() => [
    { label: 'Revenue', value: money(dashboard?.totalRevenue), detail: 'Store revenue', tone: 'gold' },
    { label: 'Orders', value: dashboard?.totalOrders || 0, detail: 'Total orders', tone: 'maroon' },
    { label: 'Pending', value: dashboard?.pendingOrders || 0, detail: 'Needs action', tone: 'amber' },
    { label: 'Products', value: dashboard?.activeProducts || 0, detail: 'Active catalog', tone: 'green' },
    { label: 'Users', value: dashboard?.totalUsers || 0, detail: 'Customer accounts', tone: 'blue' },
    { label: 'Low Stock', value: dashboard?.lowStockCount || lowStock.length, detail: 'Inventory alerts', tone: 'red' },
  ], [dashboard, lowStock.length])

  const closeSidebarOnMobile = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 980px)').matches) {
      setSidebarOpen(false)
    }
  }, [])

  const updateLogin = event => setLoginForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const updateProduct = event => {
    const { name, value, type, checked } = event.target
    setProductForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const updateBanner = event => {
    const { name, value, type, checked } = event.target
    setBannerForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const updateCoupon = event => {
    const { name, value, type, checked } = event.target
    setCouponForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const login = async event => {
    event.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      notify('warning', 'Enter admin email and password.')
      return
    }

    setLoading(true)
    try {
      const data = await adminApi.login({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      })
      if (!isAdminUser(data.user)) {
        tokenStore.clear()
        notify('error', 'Login succeeded, but this account is not an admin.')
        return
      }
      setUser(data.user)
      notify('success', 'Admin login successful.')
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await adminApi.logout()
    setUser(null)
    notify('info', 'Signed out.')
  }

  const resetProductForm = () => {
    setProductForm(emptyProductForm)
    setProductFiles([])
  }

  const editProduct = product => {
    setProductForm({
      id: product.mongoId || product.id,
      name: product.name || '',
      sku: product.sku || '',
      category: product.categoryId || '',
      brand: product.brand || 'Doon Silk',
      price: product.amount || product.price || '',
      stock: product.stock ?? '',
      status: product.status || 'active',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      imageUrl: /^https?:\/\//.test(product.image || '') ? product.image : '',
      featured: Boolean(product.flags?.featured),
      trending: Boolean(product.flags?.trending),
    })
    setProductFiles([])
    setActiveSection('products')
  }

  const saveProduct = async event => {
    event.preventDefault()
    const error = validateProduct(productForm)
    if (error) {
      notify('warning', error)
      return
    }

    setLoading(true)
    try {
      const uploaded = productFiles.length ? await adminApi.uploadImages(productFiles) : []
      const imageUrl = productForm.imageUrl.trim()
      const images = uploaded.length
        ? uploaded
        : /^https?:\/\//.test(imageUrl)
          ? [{ url: imageUrl, alt: productForm.name, position: 0 }]
          : undefined

      const body = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        category: productForm.category,
        brand: productForm.brand.trim() || 'Doon Silk',
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        status: productForm.status,
        shortDescription: productForm.shortDescription.trim(),
        description: productForm.description.trim(),
        flags: {
          featured: productForm.featured,
          trending: productForm.trending,
        },
        ...(images ? { images } : {}),
      }

      if (productForm.id) await adminApi.updateProduct(productForm.id, body)
      else await adminApi.createProduct(body)
      resetProductForm()
      await loadAdminData()
      notify('success', 'Product saved.')
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async product => {
    if (!window.confirm(`Archive ${product.name}?`)) return
    try {
      await adminApi.deleteProduct(product.mongoId || product.id)
      await loadAdminData()
      notify('success', 'Product archived.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const adjustStock = async product => {
    const change = window.prompt('Stock change. Use negative number to reduce stock.', '1')
    if (change === null) return
    const parsed = Number(change)
    if (!Number.isInteger(parsed) || parsed === 0) {
      notify('warning', 'Enter a non-zero whole number.')
      return
    }
    try {
      await adminApi.adjustStock(product.mongoId || product.id, { change: parsed, reason: 'Manual admin stock adjustment' })
      await loadAdminData()
      notify('success', 'Inventory updated.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const createCategory = async event => {
    event.preventDefault()
    if (!categoryName.trim()) {
      notify('warning', 'Category name is required.')
      return
    }
    try {
      await adminApi.createCategory({ name: categoryName.trim(), isActive: true })
      setCategoryName('')
      await loadAdminData()
      notify('success', 'Category created.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const removeCategory = async category => {
    if (!window.confirm(`Delete category ${category.name}?`)) return
    try {
      await adminApi.deleteCategory(category.id)
      await loadAdminData()
      notify('success', 'Category deleted.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const resetBannerForm = () => {
    setBannerForm(emptyBannerForm)
    setBannerModelFile(null)
    setBannerSideFile(null)
  }

  const editBanner = banner => {
    const headline = banner.headline || []
    setBannerForm({
      id: banner.id,
      headlineOne: headline[0] || '',
      headlineTwo: headline[1] || '',
      subtext: banner.subtext || '',
      cta: banner.cta || 'Explore Collection',
      ctaHref: banner.ctaHref || '/collections',
      modelImageUrl: /^https?:\/\//.test(banner.modelImage || '') ? banner.modelImage : '',
      sideImageUrl: /^https?:\/\//.test(banner.sideImage || '') ? banner.sideImage : '',
      sortOrder: String(banner.sortOrder ?? 0),
      isActive: Boolean(banner.isActive),
    })
    setActiveSection('content')
  }

  const saveBanner = async event => {
    event.preventDefault()
    const error = validateBanner(bannerForm, bannerModelFile)
    if (error) {
      notify('warning', error)
      return
    }

    setLoading(true)
    try {
      const [modelUploads, sideUploads] = await Promise.all([
        bannerModelFile ? adminApi.uploadImages([bannerModelFile]) : [],
        bannerSideFile ? adminApi.uploadImages([bannerSideFile]) : [],
      ])
      const modelImageUrl = modelUploads[0]?.url || bannerForm.modelImageUrl
      const sideImageUrl = sideUploads[0]?.url || bannerForm.sideImageUrl
      const headline = [bannerForm.headlineOne, bannerForm.headlineTwo].map(line => line.trim()).filter(Boolean)
      const body = {
        headline,
        subtext: bannerForm.subtext.trim(),
        cta: bannerForm.cta.trim(),
        ctaHref: bannerForm.ctaHref.trim(),
        modelImage: { url: modelImageUrl, publicId: modelUploads[0]?.publicId, alt: headline.join(' ') },
        ...(sideImageUrl ? { sideImage: { url: sideImageUrl, publicId: sideUploads[0]?.publicId, alt: `${headline.join(' ')} detail` } } : {}),
        sortOrder: Number(bannerForm.sortOrder || 0),
        isActive: bannerForm.isActive,
      }

      if (bannerForm.id) await adminApi.updateBanner(bannerForm.id, body)
      else await adminApi.createBanner(body)
      resetBannerForm()
      await loadAdminData()
      notify('success', 'Banner saved.')
    } catch (error) {
      notify('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeBanner = async banner => {
    if (!window.confirm('Delete this banner?')) return
    try {
      await adminApi.deleteBanner(banner.id)
      await loadAdminData()
      notify('success', 'Banner deleted. Static storefront banners remain as fallback.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const resetCouponForm = () => setCouponForm(emptyCouponForm)

  const editCoupon = coupon => {
    setCouponForm({
      id: coupon.id,
      code: coupon.code || '',
      description: coupon.description || '',
      type: coupon.type || 'percentage',
      value: coupon.value ?? '',
      minOrderAmount: coupon.minOrderAmount ?? '',
      maxDiscountAmount: coupon.maxDiscountAmount ?? '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      usageLimit: coupon.usageLimit ?? '',
      userUsageLimit: coupon.userUsageLimit ?? '',
      isActive: Boolean(coupon.isActive),
    })
    setActiveSection('coupons')
  }

  const saveCoupon = async event => {
    event.preventDefault()
    const error = validateCoupon(couponForm)
    if (error) {
      notify('warning', error)
      return
    }

    const body = {
      code: couponForm.code.trim().toUpperCase(),
      description: couponForm.description.trim(),
      type: couponForm.type,
      value: Number(couponForm.value),
      expiresAt: couponForm.expiresAt,
      isActive: couponForm.isActive,
      ...(couponForm.minOrderAmount !== '' ? { minOrderAmount: Number(couponForm.minOrderAmount) } : {}),
      ...(couponForm.maxDiscountAmount !== '' ? { maxDiscountAmount: Number(couponForm.maxDiscountAmount) } : {}),
      ...(couponForm.usageLimit !== '' ? { usageLimit: Number(couponForm.usageLimit) } : {}),
      ...(couponForm.userUsageLimit !== '' ? { userUsageLimit: Number(couponForm.userUsageLimit) } : {}),
    }

    try {
      if (couponForm.id) await adminApi.updateCoupon(couponForm.id, body)
      else await adminApi.createCoupon(body)
      resetCouponForm()
      await loadAdminData()
      notify('success', 'Coupon saved.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const removeCoupon = async coupon => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return
    try {
      await adminApi.deleteCoupon(coupon.id)
      await loadAdminData()
      notify('success', 'Coupon deleted.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const updateOrderStatus = async (order, status) => {
    if (!status || status === order.status) return
    try {
      await adminApi.updateOrderStatus(order.id, { status, note: 'Updated from separated admin panel' })
      await loadAdminData()
      notify('success', `Order ${order.orderNumber} updated.`)
    } catch (error) {
      notify('error', error.message)
    }
  }

  const updateUserRole = async (customer, role) => {
    try {
      await adminApi.updateUser(customer.id, { roles: [role], isActive: customer.isActive })
      await loadAdminData()
      notify('success', 'User role updated.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  const updateUserActive = async customer => {
    try {
      await adminApi.updateUser(customer.id, { isActive: !customer.isActive, roles: customer.roles })
      await loadAdminData()
      notify('success', 'User status updated.')
    } catch (error) {
      notify('error', error.message)
    }
  }

  if (!authChecked) {
    return <div className="boot-screen">Checking admin session...</div>
  }

  if (!user) {
    return (
      <main className="login-screen">
        <section className="login-card">
          <div>
            <p className="eyebrow">Doon Silk</p>
            <h1>Admin Console</h1>
            <p className="muted">Separate operations panel for products, orders, content, coupons, users, and debugging.</p>
          </div>
          {health && (
            <div className={`health-strip ${health.success ? 'ok' : 'bad'}`}>
              API: {health.success ? 'Connected' : health.message || 'Unavailable'}
            </div>
          )}
          <form onSubmit={login} className="stack" noValidate>
            <label>
              <span>Email</span>
              <input name="email" type="email" value={loginForm.email} onChange={updateLogin} autoComplete="email" />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" value={loginForm.password} onChange={updateLogin} autoComplete="current-password" />
            </label>
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <p className="hint">Use the super admin created from <code>apps/api/.env</code>.</p>
        </section>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </main>
    )
  }

  return (
    <div className={`admin-app ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <button className="sidebar-backdrop" type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
      <aside className="sidebar" aria-label="Admin navigation">
        <div className="sidebar-head">
          <div className="brand-mark" aria-hidden="true">DS</div>
          <div className="brand-copy">
            <p className="eyebrow">Doon Silk</p>
            <h1>Admin</h1>
          </div>
          <button
            className="icon-btn sidebar-toggle"
            type="button"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(current => !current)}
          >
            <span className="toggle-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="sidebar-summary">
          <span>Revenue</span>
          <strong>{money(dashboard?.totalRevenue)}</strong>
          <small>{dashboard?.totalOrders || 0} orders in system</small>
        </div>
        <nav>
          {sections.map(section => (
            <button
              className={activeSection === section.key ? 'active' : ''}
              type="button"
              key={section.key}
              title={section.label}
              onClick={() => {
                setActiveSection(section.key)
                closeSidebarOnMobile()
              }}
            >
              <span className="nav-icon" aria-hidden="true">{section.short}</span>
              <span className="nav-copy">
                <span>{section.label}</span>
                <small>{section.description}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip" title={user.email}>
            <span>{(user.name || user.email || 'A').slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <button type="button" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-btn sidebar-mobile-toggle"
              type="button"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <span className="hamburger-icon" aria-hidden="true" />
            </button>
            <div>
              <p className="eyebrow">Admin Workspace</p>
              <h2>{activeSectionMeta.label}</h2>
              <p>{activeSectionMeta.description}</p>
            </div>
          </div>
          <div className="topbar-actions">
            <span className={`api-chip ${health?.success ? 'ok' : 'bad'}`}>{health?.success ? 'API online' : 'API issue'}</span>
            <a href={apiConfig.storefrontUrl} target="_blank" rel="noreferrer">Open Storefront</a>
            <a href={apiConfig.apiDocsUrl} target="_blank" rel="noreferrer">Swagger</a>
            <button type="button" onClick={loadAdminData} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
          </div>
        </header>

        {activeSection === 'dashboard' && (
          <section className="section-grid">
            <div className="metric-grid">
              {dashboardCards.map(card => (
                <article className={`metric-card metric-${card.tone}`} key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <small>{card.detail}</small>
                </article>
              ))}
            </div>
            <Panel title="Sales Analytics">
              <div className="analytics-list">
                {analytics.slice(-10).map(row => (
                  <div key={row._id}>
                    <span>{row._id}</span>
                    <strong>{money(row.revenue)} / {row.orders} orders</strong>
                  </div>
                ))}
                {!analytics.length && <p className="muted">No sales data yet.</p>}
              </div>
            </Panel>
            <Panel title="Low Stock">
              <DataTable
                columns={['Product', 'SKU', 'Stock', 'Action']}
                rows={lowStock}
                renderRow={product => (
                  <tr key={product.id || product.mongoId}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.stock}</td>
                    <td><button type="button" onClick={() => adjustStock(product)}>Adjust</button></td>
                  </tr>
                )}
                empty="No low-stock products."
              />
            </Panel>
          </section>
        )}

        {activeSection === 'products' && (
          <section className="split-layout">
            <Panel title={productForm.id ? 'Edit Product' : 'Create Product'}>
              <form className="stack" onSubmit={saveProduct} noValidate>
                <Field label="Name" name="name" value={productForm.name} onChange={updateProduct} />
                <Field label="SKU" name="sku" value={productForm.sku} onChange={updateProduct} />
                <label>
                  <span>Category</span>
                  <select name="category" value={productForm.category} onChange={updateProduct}>
                    <option value="">Select category</option>
                    {categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <div className="inline-fields">
                  <Field label="Price" name="price" type="number" value={productForm.price} onChange={updateProduct} />
                  <Field label="Stock" name="stock" type="number" value={productForm.stock} onChange={updateProduct} />
                </div>
                <label>
                  <span>Status</span>
                  <select name="status" value={productForm.status} onChange={updateProduct}>
                    {productStatuses.map(status => <option value={status} key={status}>{status}</option>)}
                  </select>
                </label>
                <Field label="Short Description" name="shortDescription" value={productForm.shortDescription} onChange={updateProduct} />
                <label>
                  <span>Description</span>
                  <textarea name="description" value={productForm.description} onChange={updateProduct} />
                </label>
                <Field label="Image URL" name="imageUrl" value={productForm.imageUrl} onChange={updateProduct} />
                <label>
                  <span>Upload Images</span>
                  <input type="file" accept="image/*" multiple onChange={event => setProductFiles(Array.from(event.target.files || []))} />
                </label>
                <div className="check-row">
                  <label><input name="featured" type="checkbox" checked={productForm.featured} onChange={updateProduct} /> Featured</label>
                  <label><input name="trending" type="checkbox" checked={productForm.trending} onChange={updateProduct} /> Trending</label>
                </div>
                <div className="button-row">
                  <button className="primary-btn" type="submit">Save Product</button>
                  <button type="button" onClick={resetProductForm}>New</button>
                </div>
              </form>
            </Panel>
            <Panel title="Product Catalog">
              <Toolbar>
                <input placeholder="Search products" value={filters.productSearch} onChange={event => setFilters(current => ({ ...current, productSearch: event.target.value }))} />
                <button type="button" onClick={loadAdminData}>Search</button>
              </Toolbar>
              <DataTable
                columns={['Image', 'Product', 'Price', 'Stock', 'Status', 'Actions']}
                rows={products}
                renderRow={product => (
                  <tr key={product.mongoId || product.id}>
                    <td><img className="thumb" src={resolveMediaUrl(product.image)} alt={product.name} /></td>
                    <td><strong>{product.name}</strong><small>{product.category} / {product.sku}</small></td>
                    <td>{product.price}</td>
                    <td>{product.stock}</td>
                    <td><span className={`status-pill ${product.status}`}>{product.status}</span></td>
                    <td className="actions">
                      <button type="button" onClick={() => editProduct(product)}>Edit</button>
                      <button type="button" onClick={() => adjustStock(product)}>Stock</button>
                      <button type="button" onClick={() => removeProduct(product)}>Archive</button>
                    </td>
                  </tr>
                )}
                empty="No products found."
              />
            </Panel>
          </section>
        )}

        {activeSection === 'orders' && (
          <Panel title="Order Management">
            <Toolbar>
              <select value={filters.orderStatus} onChange={event => setFilters(current => ({ ...current, orderStatus: event.target.value }))}>
                <option value="">All statuses</option>
                {orderStatuses.map(status => <option value={status} key={status}>{status}</option>)}
              </select>
              <button type="button" onClick={loadAdminData}>Apply</button>
            </Toolbar>
            <DataTable
              columns={['Order', 'Customer', 'Total', 'Status', 'Date']}
              rows={orders}
              renderRow={order => (
                <tr key={order.id}>
                  <td><strong>{order.orderNumber}</strong><small>{order.payment?.provider || 'cod'}</small></td>
                  <td>{order.customer?.name}<small>{order.customer?.email}</small></td>
                  <td>{money(order.pricing?.total)}</td>
                  <td>
                    <select value={order.status} onChange={event => updateOrderStatus(order, event.target.value)}>
                      {orderStatuses.map(status => <option value={status} key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              )}
              empty="No orders found."
            />
          </Panel>
        )}

        {activeSection === 'content' && (
          <section className="split-layout">
            <Panel title="Categories">
              <form className="inline-form" onSubmit={createCategory}>
                <input placeholder="New category name" value={categoryName} onChange={event => setCategoryName(event.target.value)} />
                <button className="primary-btn" type="submit">Add</button>
              </form>
              <div className="chip-list">
                {categories.map(category => (
                  <span className="chip" key={category.id}>
                    {category.name}
                    <button type="button" onClick={() => removeCategory(category)}>x</button>
                  </span>
                ))}
              </div>
            </Panel>
            <Panel title={bannerForm.id ? 'Edit Banner' : 'Create Banner'}>
              <form className="stack" onSubmit={saveBanner} noValidate>
                <Field label="Headline Line 1" name="headlineOne" value={bannerForm.headlineOne} onChange={updateBanner} />
                <Field label="Headline Line 2" name="headlineTwo" value={bannerForm.headlineTwo} onChange={updateBanner} />
                <label><span>Subtext</span><textarea name="subtext" value={bannerForm.subtext} onChange={updateBanner} /></label>
                <div className="inline-fields">
                  <Field label="CTA" name="cta" value={bannerForm.cta} onChange={updateBanner} />
                  <Field label="CTA Link" name="ctaHref" value={bannerForm.ctaHref} onChange={updateBanner} />
                </div>
                <Field label="Main Image URL" name="modelImageUrl" value={bannerForm.modelImageUrl} onChange={updateBanner} />
                <label><span>Upload Main Image</span><input type="file" accept="image/*" onChange={event => setBannerModelFile(event.target.files?.[0] || null)} /></label>
                <Field label="Side Image URL" name="sideImageUrl" value={bannerForm.sideImageUrl} onChange={updateBanner} />
                <label><span>Upload Side Image</span><input type="file" accept="image/*" onChange={event => setBannerSideFile(event.target.files?.[0] || null)} /></label>
                <div className="inline-fields">
                  <Field label="Sort Order" name="sortOrder" type="number" value={bannerForm.sortOrder} onChange={updateBanner} />
                  <label className="check-field"><input name="isActive" type="checkbox" checked={bannerForm.isActive} onChange={updateBanner} /> Active</label>
                </div>
                <div className="button-row">
                  <button className="primary-btn" type="submit">Save Banner</button>
                  <button type="button" onClick={resetBannerForm}>New</button>
                </div>
              </form>
            </Panel>
            <Panel title="Homepage Banners">
              <DataTable
                columns={['Image', 'Headline', 'Status', 'Actions']}
                rows={banners}
                renderRow={banner => (
                  <tr key={banner.id}>
                    <td><img className="thumb" src={resolveMediaUrl(banner.modelImage)} alt={banner.headline?.join(' ')} /></td>
                    <td>{banner.headline?.join(' ')}<small>{banner.ctaHref}</small></td>
                    <td>{banner.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="actions"><button type="button" onClick={() => editBanner(banner)}>Edit</button><button type="button" onClick={() => removeBanner(banner)}>Delete</button></td>
                  </tr>
                )}
                empty="No uploaded banners. Storefront static banners are still the fallback."
              />
            </Panel>
          </section>
        )}

        {activeSection === 'coupons' && (
          <section className="split-layout">
            <Panel title={couponForm.id ? 'Edit Coupon' : 'Create Coupon'}>
              <form className="stack" onSubmit={saveCoupon} noValidate>
                <Field label="Code" name="code" value={couponForm.code} onChange={updateCoupon} />
                <Field label="Description" name="description" value={couponForm.description} onChange={updateCoupon} />
                <label><span>Type</span><select name="type" value={couponForm.type} onChange={updateCoupon}><option value="percentage">Percentage</option><option value="flat">Flat</option></select></label>
                <div className="inline-fields">
                  <Field label="Value" name="value" type="number" value={couponForm.value} onChange={updateCoupon} />
                  <Field label="Expires" name="expiresAt" type="date" value={couponForm.expiresAt} onChange={updateCoupon} />
                </div>
                <div className="inline-fields">
                  <Field label="Min Order" name="minOrderAmount" type="number" value={couponForm.minOrderAmount} onChange={updateCoupon} />
                  <Field label="Max Discount" name="maxDiscountAmount" type="number" value={couponForm.maxDiscountAmount} onChange={updateCoupon} />
                </div>
                <div className="inline-fields">
                  <Field label="Usage Limit" name="usageLimit" type="number" value={couponForm.usageLimit} onChange={updateCoupon} />
                  <Field label="User Limit" name="userUsageLimit" type="number" value={couponForm.userUsageLimit} onChange={updateCoupon} />
                </div>
                <label className="check-field"><input name="isActive" type="checkbox" checked={couponForm.isActive} onChange={updateCoupon} /> Active</label>
                <div className="button-row"><button className="primary-btn" type="submit">Save Coupon</button><button type="button" onClick={resetCouponForm}>New</button></div>
              </form>
            </Panel>
            <Panel title="Coupons">
              <Toolbar>
                <input placeholder="Search coupons" value={filters.couponSearch} onChange={event => setFilters(current => ({ ...current, couponSearch: event.target.value }))} />
                <button type="button" onClick={loadAdminData}>Search</button>
              </Toolbar>
              <DataTable
                columns={['Code', 'Type', 'Value', 'Expires', 'Status', 'Actions']}
                rows={coupons}
                renderRow={coupon => (
                  <tr key={coupon.id}>
                    <td><strong>{coupon.code}</strong><small>{coupon.description}</small></td>
                    <td>{coupon.type}</td>
                    <td>{coupon.value}</td>
                    <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '-'}</td>
                    <td>{coupon.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="actions"><button type="button" onClick={() => editCoupon(coupon)}>Edit</button><button type="button" onClick={() => removeCoupon(coupon)}>Delete</button></td>
                  </tr>
                )}
                empty="No coupons found."
              />
            </Panel>
          </section>
        )}

        {activeSection === 'customers' && (
          <Panel title="Customer Management">
            <Toolbar>
              <input placeholder="Search users" value={filters.userSearch} onChange={event => setFilters(current => ({ ...current, userSearch: event.target.value }))} />
              <button type="button" onClick={loadAdminData}>Search</button>
            </Toolbar>
            <DataTable
              columns={['User', 'Phone', 'Role', 'Status', 'Actions']}
              rows={users}
              renderRow={customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong><small>{customer.email}</small></td>
                  <td>{customer.phone || '-'}</td>
                  <td>
                    <select value={customer.roles?.[0] || 'user'} onChange={event => updateUserRole(customer, event.target.value)}>
                      {roles.map(role => <option value={role} key={role}>{role}</option>)}
                    </select>
                  </td>
                  <td>{customer.isActive ? 'Active' : 'Inactive'}</td>
                  <td><button type="button" onClick={() => updateUserActive(customer)}>{customer.isActive ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              )}
              empty="No users found."
            />
          </Panel>
        )}

        {activeSection === 'debug' && (
          <section className="section-grid">
            <Panel title="Runtime">
              <dl className="debug-list">
                <dt>API Base</dt><dd>{apiConfig.apiBaseUrl}</dd>
                <dt>Storefront</dt><dd>{apiConfig.storefrontUrl}</dd>
                <dt>Health</dt><dd>{health?.success ? 'Connected' : health?.message || 'Not checked'}</dd>
                <dt>Token</dt><dd>{tokenStore.get() ? 'Present' : 'Missing'}</dd>
              </dl>
              <div className="button-row">
                <button type="button" onClick={loadHealth}>Check Health</button>
                <button type="button" onClick={() => setRequestLog([])}>Clear Request Log</button>
              </div>
            </Panel>
            <Panel title="Recent API Requests">
              <DataTable
                columns={['Time', 'Method', 'Endpoint', 'Status', 'Duration', 'Request ID']}
                rows={requestLog}
                renderRow={entry => (
                  <tr key={entry.id} className={entry.ok ? '' : 'row-error'}>
                    <td>{entry.time}</td>
                    <td>{entry.method}</td>
                    <td>{entry.endpoint}</td>
                    <td>{entry.status}</td>
                    <td>{entry.duration} ms</td>
                    <td>{entry.requestId ? entry.requestId.slice(0, 8) : '-'}</td>
                  </tr>
                )}
                empty="No API requests logged yet."
              />
            </Panel>
          </section>
        )}
      </main>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>
}

function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <label>
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} />
    </label>
  )
}

function DataTable({ columns, rows, renderRow, empty }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(column => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(renderRow)}
          {!rows.length && <tr><td colSpan={columns.length}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function Toast({ toast, onClose }) {
  return (
    <div className={`toast toast-${toast.type}`}>
      <span>{toast.type}</span>
      <strong>{toast.message}</strong>
      <button type="button" onClick={onClose}>x</button>
    </div>
  )
}

export default App
