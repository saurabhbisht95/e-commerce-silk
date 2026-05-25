import { useEffect } from 'react'
import './QuickViewModal.css'

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

function QuickViewModal({ product, products, onClose, onSelectProduct, onAddToCart }) {
  useEffect(() => {
    if (!product) return undefined

    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [product, onClose])

  if (!product) return null

  const similarProducts = products
    .filter(item => item.id !== product.id && item.category === product.category)
    .slice(0, 4)

  return (
    <div className="qv-overlay" role="presentation" onClick={onClose}>
      <section
        className="qv-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} quick view`}
        onClick={event => event.stopPropagation()}
      >
        <button className="qv-close" type="button" aria-label="Close quick view" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="qv-product">
          <div className="qv-image-wrap">
            <img src={product.imageLarge || product.image} alt={product.name} className="qv-image" />
          </div>

          <div className="qv-details">
            <span className="qv-category">{product.category}</span>
            <h3 className="qv-title">{product.name}</h3>
            <p className="qv-price">{product.price}</p>
            <p className="qv-copy">
              Handpicked from the Doon Silk collection with a refined weave, soft drape, and a polished finish for festive and everyday styling.
            </p>
            <button className="qv-primary-btn" type="button" onClick={() => onAddToCart?.(product)}>Add to Cart</button>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="qv-similar">
            <div className="qv-similar-header">
              <span>Similar {product.category}</span>
            </div>

            <div className="qv-similar-grid">
              {similarProducts.map(item => (
                <button
                  type="button"
                  className="qv-similar-card"
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                >
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                  <strong>{item.price}</strong>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default QuickViewModal
