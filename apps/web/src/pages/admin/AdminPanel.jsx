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

const buildBannerPayload = (form, uploads = {}) => {
  const headline = [form.headlineOne, form.headlineTwo]
    .map(line => line.trim())
    .filter(Boolean)
  const modelImageUrl = uploads.model?.url || form.modelImageUrl
  const sideImageUrl = uploads.side?.url || form.sideImageUrl
  const alt = headline.join(' ') || 'Doon Silk banner'

  return {
    headline,
    subtext: form.subtext,
    cta: form.cta,
    ctaHref: form.ctaHref,
    modelImage: {
      url: modelImageUrl,
      publicId: uploads.model?.publicId,
      alt,
    },
    ...(sideImageUrl
      ? {
          sideImage: {
            url: sideImageUrl,
            publicId: uploads.side?.publicId,
            alt: `${alt} detail`,
          },
        }
      : {}),
    sortOrder: Number(form.sortOrder || 0),
    isActive: form.isActive,
  }
}

function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [bannerForm, setBannerForm] = useState(emptyBannerForm)
  const [files, setFiles] = useState([])
  const [bannerModelFile, setBannerModelFile] = useState(null)
  const [bannerSideFile, setBannerSideFile] = useState(null)
  const [newCategory, setNewCategory] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedProduct = useMemo(
    () => products.find(product => product.mongoId === form.id || product.id === form.id),
    [form.id, products]
  )

  const selectedBanner = useMemo(
    () => banners.find(banner => banner.id === bannerForm.id),
    [bannerForm.id, banners]
  )

  const loadAdminData = async () => {
    const [dashboard, productResult, categoryResult, bannerResult] = await Promise.all([
      adminApi.dashboard().catch(() => null),
      adminApi.listProducts({ limit: 100 }),
      adminApi.listCategories(),
      adminApi.listBanners(),
    ])
    setStats(dashboard)
    setProducts(productResult.products)
    setCategories(categoryResult)
    setBanners(bannerResult)
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

  const updateBannerField = event => {
    const { name, value, type, checked } = event.target
    setBannerForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
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

  const editBanner = banner => {
    const headline = banner.headline || []
    setBannerForm({
      id: banner.id,
      headlineOne: headline[0] || '',
      headlineTwo: headline[1] || '',
      subtext: banner.subtext || '',
      cta: banner.cta || 'Explore Collection',
      ctaHref: banner.ctaHref || '/collections',
      modelImageUrl: banner.modelImage || '',
      sideImageUrl: banner.sideImage || '',
      sortOrder: String(banner.sortOrder ?? 0),
      isActive: Boolean(banner.isActive),
    })
    setBannerModelFile(null)
    setBannerSideFile(null)
    setMessage('')
  }

  const resetBannerForm = () => {
    setBannerForm(emptyBannerForm)
    setBannerModelFile(null)
    setBannerSideFile(null)
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

  const saveBanner = async event => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const [modelUploads, sideUploads] = await Promise.all([
        bannerModelFile ? adminApi.uploadImages([bannerModelFile]) : [],
        bannerSideFile ? adminApi.uploadImages([bannerSideFile]) : [],
      ])
      const payload = buildBannerPayload(bannerForm, {
        model: modelUploads[0],
        side: sideUploads[0],
      })
      if (bannerForm.id) await adminApi.updateBanner(bannerForm.id, payload)
      else await adminApi.createBanner(payload)
      await loadAdminData()
      resetBannerForm()
      setMessage('Banner saved successfully.')
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

  const deleteBanner = async banner => {
    setMessage('')
    try {
      await adminApi.deleteBanner(banner.id)
      await loadAdminData()
      if (bannerForm.id === banner.id) resetBannerForm()
      setMessage('Banner removed successfully. Static hero slides will be used if no active banners remain.')
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
          <p className="commerce-copy">Manage products, stock, categories, images, and optional homepage banners uploaded through the backend.</p>

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

          <div className="admin-layout" style={{ marginTop: 28 }}>
            <section className="commerce-form commerce-form--wide">
              <h2>{selectedBanner ? 'Edit Banner' : 'Create Banner'}</h2>

              <form className="commerce-form commerce-form--wide" onSubmit={saveBanner}>
                <label className="commerce-field">
                  <span>Headline Line 1</span>
                  <input name="headlineOne" value={bannerForm.headlineOne} onChange={updateBannerField} required />
                </label>
                <label className="commerce-field">
                  <span>Headline Line 2</span>
                  <input name="headlineTwo" value={bannerForm.headlineTwo} onChange={updateBannerField} />
                </label>
                <label className="commerce-field">
                  <span>Subtext</span>
                  <textarea name="subtext" value={bannerForm.subtext} onChange={updateBannerField} />
                </label>
                <div className="commerce-grid">
                  <label className="commerce-field">
                    <span>CTA Text</span>
                    <input name="cta" value={bannerForm.cta} onChange={updateBannerField} required />
                  </label>
                  <label className="commerce-field">
                    <span>CTA Link</span>
                    <input name="ctaHref" value={bannerForm.ctaHref} onChange={updateBannerField} required />
                  </label>
                </div>
                <label className="commerce-field">
                  <span>Main Image URL</span>
                  <input name="modelImageUrl" value={bannerForm.modelImageUrl} onChange={updateBannerField} placeholder="Optional if uploading a main image" />
                </label>
                <label className="commerce-field">
                  <span>Upload Main Image</span>
                  <input type="file" accept="image/*" onChange={event => setBannerModelFile(event.target.files?.[0] || null)} />
                </label>
                <label className="commerce-field">
                  <span>Side Image URL</span>
                  <input name="sideImageUrl" value={bannerForm.sideImageUrl} onChange={updateBannerField} placeholder="Optional; main image is reused if empty" />
                </label>
                <label className="commerce-field">
                  <span>Upload Side Image</span>
                  <input type="file" accept="image/*" onChange={event => setBannerSideFile(event.target.files?.[0] || null)} />
                </label>
                <div className="commerce-grid">
                  <label className="commerce-field">
                    <span>Sort Order</span>
                    <input name="sortOrder" type="number" value={bannerForm.sortOrder} onChange={updateBannerField} />
                  </label>
                  <label className="commerce-field">
                    <span>Status</span>
                    <label><input name="isActive" type="checkbox" checked={bannerForm.isActive} onChange={updateBannerField} /> Active</label>
                  </label>
                </div>
                <div className="commerce-actions">
                  <button className="commerce-btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Banner'}
                  </button>
                  <button className="commerce-btn commerce-btn--ghost" type="button" onClick={resetBannerForm}>New Banner</button>
                </div>
              </form>
            </section>

            <section className="commerce-table-wrap">
              <h2>Banners</h2>
              <table className="commerce-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Headline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map(banner => (
                    <tr key={banner.id}>
                      <td><img className="admin-thumb" src={banner.modelImage} alt={banner.headline?.join(' ') || 'Banner'} /></td>
                      <td>{banner.headline?.join(' ')}<br /><small>{banner.ctaHref}</small></td>
                      <td>{banner.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        <div className="commerce-actions">
                          <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => editBanner(banner)}>Edit</button>
                          <button className="commerce-btn commerce-btn--ghost" type="button" onClick={() => deleteBanner(banner)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!banners.length && (
                    <tr>
                      <td colSpan="4">No uploaded banners yet. The current static hero slides remain active.</td>
                    </tr>
                  )}
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
