import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import QuickViewModal from '../components/product/QuickViewModal.jsx';
import { useCommerce } from '../context/commerceContext';
import './Shop.css';

// SVG Icons for the product cards
const ShuffleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"></polyline>
    <line x1="4" y1="20" x2="21" y2="3"></line>
    <polyline points="21 16 21 21 16 21"></polyline>
    <line x1="15" y1="15" x2="21" y2="21"></line>
    <line x1="4" y1="4" x2="9" y2="9"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { products, addToCart, addToWishlist } = useCommerce();

  const openQuickViewFromKeyboard = (event, product) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setQuickViewProduct(product);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="page-shop"
    >
      <Header />

      <main className="shop-main">
        {/* Shop Header Banner */}
        <div className="shop-banner texture-overlay">
          <div className="container">
            <h1 className="shop-title">Our Collections</h1>
            <p className="shop-subtitle">Discover the finest handwoven silks of Uttarakhand</p>
          </div>
        </div>

        <div className="container shop-container">
          {/* Sidebar Filters */}
          <aside className="shop-sidebar">
            <h3 className="filter-title">Categories</h3>
            <ul className="filter-list">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                    <span className="filter-count">
                      ({cat === 'All' ? products.length : products.filter(p => p.category === cat).length})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div className="shop-content">
            <div className="shop-header-actions">
              <span className="results-count">Showing {filteredProducts.length} results</span>
            </div>

            <div className="shop-grid">
              {filteredProducts.map(product => (
                <div
                  className="shop-product-card"
                  key={product.backendId || product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setQuickViewProduct(product)}
                  onKeyDown={(event) => openQuickViewFromKeyboard(event, product)}
                  aria-label={`Open quick view for ${product.name}`}
                >

                  {/* Image Wrapper with Hover Pill */}
                  <div className="sp-image-wrapper">
                    <img src={product.image} alt={product.name} className="sp-image" loading="lazy" />

                    {/* Hover Actions Pill */}
                    <div className="sp-actions-pill">
                      <button className="sp-action-btn" type="button" aria-label="Compare"><ShuffleIcon /></button>
                      <button
                        className="sp-action-btn"
                        type="button"
                        aria-label={`Quick View ${product.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                      >
                        <SearchIcon />
                      </button>
                      <button
                        className="sp-action-btn"
                        type="button"
                        aria-label="Like"
                        onClick={(event) => {
                          event.stopPropagation();
                          addToWishlist(product);
                        }}
                      >
                        <HeartIcon />
                      </button>
                    </div>
                  </div>

                  {/* Product Details at Bottom */}
                  <div className="sp-details">
                    <h4 className="sp-name">{product.name}</h4>
                    <span className="sp-category">{product.category}</span>
                    <span className="sp-price">{product.price}</span>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <QuickViewModal
        product={quickViewProduct}
        products={products}
        onClose={() => setQuickViewProduct(null)}
        onSelectProduct={setQuickViewProduct}
        onAddToCart={addToCart}
      />
    </motion.div>
  );
}

export default Shop;
