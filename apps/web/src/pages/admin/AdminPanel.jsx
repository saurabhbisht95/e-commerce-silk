import { useEffect, useMemo, useState } from 'react'
import Header from '../../components/layout/Header.jsx'
import Footer from '../../components/layout/Footer.jsx'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../context/authContext'
import '../CommercePages.css'

const emptyForm = {
  id: '',
  name: '',
  sku: '',
  category: '',
  brand: 'Doon Silk',
  price: '',
  stock: '',
  status: 'active',
  description: '',
  shortDescription: '',
  imageUrl: '',
  featured: false,
  trending: false,
}

const buildProductPayload = (form, uploadedImages = []) => {
  const images = uploadedImages.length
    ? uploadedImages
    : /^https?:\/\//.test(form.imageUrl)
      ? [{ url: form.imageUrl, alt: form.name, position: 0 }]
      : undefined

  return {
    name: form.name,
    sku: form.sku,
    category: form.category,
    brand: form.brand,
    price: Number(form.price),
    stock: Number(form.stock || 0),
    status: form.status,
    description: form.description,
    shortDescription: form.shortDescription,
    flags: {
      featured: form.featured,
      trending: form.trending,
    },
    ...(images ? { images } : {}),
  }
}

function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedProduct = useMemo(
    () => products.find(product => product.mongoId === form.id || product.id === form.id),
    [form.id, products]
  )

  const loadAdminData = async () => {
    const [dashboard, productResult, categoryResult] = await Promise.all([
      adminApi.dashboard().catch(() => null),
      adminApi.listProducts({ limit: 100, status: 'active' }),
      adminApi.listCategories(),
    ])
    setStats(dashboard)
    setProducts(productResult.products)
    setCategories(categoryResult)
  }

  useEffect(() => {
    if (isAdmin) {
      Promise.resolve().then(() => loadAdminData()).catch(error => setMessage(error.message))
    }
  }, [isAdmin])

  const updateField = event => {
    const { name, value, type, checked } = event.target
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const editProduct = product => {
    setForm({
      id: product.mongoId,
      name: product.name || '',
      sku: product.sku || '',
      category: product.categoryId || '',
      brand: product.brand || 'Doon Silk',
      price: product.amount || '',
      stock: product.stock || '',
      status: product.status || 'active',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      imageUrl: product.image || '',
      featured: Boolean(product.flags?.featured),
      trending: Boolean(product.flags?.trending),
    })
    setFiles([])
    setMessage('')
  }

  const resetForm = () => {
    setForm(emptyForm)
    setFiles([])
  }

  const saveProduct = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const uploadedImages = files.length ? await adminApi.uploadImages(files) : []
      const payload = buildProductPayload(form, uploadedImages)
      if (form.id) await adminApi.updateProduct(form.id, payload)
      else await adminApi.createProduct(payload)
      await loadAdminData()
      resetForm()
      setMessage('Product saved successfully.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const createCategory = async event => {
    event.preventDefault()
    if (!newCategory.trim()) return
    setMessage('')
    try {
      const category = await adminApi.createCategory({ name: newCategory.trim(), isActive: true })
      setCategories(current => [...current, category])
      setForm(current => ({ ...current, category: category.id }))
      setNewCategory('')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const deleteProduct = async product => {
    setMessage('')
    try {
      await adminApi.deleteProduct(product.mongoId)
      await loadAdminData()
      if (form.id === product.mongoId) resetForm()
      setMessage('Product removed successfully.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (!user || !isAdmin) {
    return (
      <>
        <Header />
        <main className="commerce-page">
          <div className="commerce-shell">
            <h1 className="commerce-title">Admin Panel</h1>
            <div className="commerce-alert">Admin access is required.</div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="commerce-page">
        <div className="commerce-shell">
          <h1 className="commerce-title">Admin Panel</h1>
          <p className="commerce-copy">Manage products, stock, categories, and images uploaded through the backend.</p>

          {message && <div className="commerce-alert">{message}</div>}

          <div className="commerce-grid" style={{ margin: '18px 0 24px' }}>
            <section className="commerce-panel">
              <h2>Revenue</h2>
              <p>₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </section>
            <section className="commerce-panel">
              <h2>Orders</h2>
              <p>{stats?.totalOrders || 0}</p>
            </section>
            <section className="commerce-panel">
              <h2>Products</h2>
              <p>{stats?.activeProducts || products.length}</p>
            </section>
          </div>

          <div className="admin-layout">
            <section className="commerce-form commerce-form--wide">
              <h2>{selectedProduct ? 'Edit Product' : 'Create Product'}</h2>

              <form className="commerce-form commerce-form--wide" onSubmit={saveProduct}>
                <label className="commerce-field">
                  <span>Name</span>
                  <input name="name" value={form.name} onChange={updateField} required />
                </label>
                <label className="commerce-field">
                  <span>SKU</span>
                  <input name="sku" value={form.sku} onChange={updateField} required />
                </label>
                <label className="commerce-field">
                  <span>Category</span>
                  <select name="category" value={form.category} onChange={updateField} required>
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
                <div className="commerce-grid">
                  <label className="commerce-field">
                    <span>Price</span>
                    <input name="price" type="number" min="0" value={form.price} onChange={updateField} required />
                  </label>
                  <label className="commerce-field">
                    <span>Stock</span>
                    <input name="stock" type="number" min="0" value={form.stock} onChange={updateField} required />
                  </label>
                </div>
                <label className="commerce-field">
                  <span>Status</span>
                  <select name="status" value={form.status} onChange={updateField}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
                <label className="commerce-field">
                  <span>Short Description</span>
                  <input name="shortDescription" value={form.shortDescription} onChange={updateField} />
                </label>
                <label className="commerce-field">
                  <span>Description</span>
                  <textarea name="description" value={form.description} onChange={updateField} />
                </label>
                <label className="commerce-field">
                  <span>Image URL</span>
                  <input name="imageUrl" value={form.imageUrl} onChange={updateField} placeholder="Optional if uploading files" />
                </label>
                <label className="commerce-field">
                  <span>Upload Images</span>
                  <input type="file" accept="image/*" multiple onChange={event => setFiles(Array.from(event.target.files || []))} />
                </label>
                <label className="commerce-field">
                  <span>Flags</span>
                  <label><input name="featured" type="checkbox" checked={form.featured} onChange={updateField} /> Featured</label>
                  <label><input name="trending" type="checkbox" checked={form.trending} onChange={updateField} /> Trending</label>
                </label>
                <div className="commerce-actions">
                  <button className="commerce-btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                  <button className="commerce-btn commerce-btn--ghost" type="button" onClick={resetForm}>New Product</button>
                </div>
              </form>

              <form className="commerce-form commerce-form--wide" onSubmit={createCategory}>
                <label className="commerce-field">
                  <span>Quick Category</span>
                  <input value={newCategory} onChange={event => setNewCategory(event.target.value)} placeholder="Add category" />
                </label>
                <button className="commerce-btn commerce-btn--ghost" type="submit">Add Category</button>
              </form>
            </section>

            <section className="commerce-table-wrap">
              <h2>Products</h2>
              <table className="commerce-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.mongoId || product.id}>
                      <td><img className="admin-thumb" src={product.image} alt={product.name} /></td>
                      <td>{product.name}<br /><small>{product.category}</small></td>
                      <td>{product.price}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="commerce-actions">
                          <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => editProduct(product)}>Edit</button>
                          <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => deleteProduct(product)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default AdminPanel
