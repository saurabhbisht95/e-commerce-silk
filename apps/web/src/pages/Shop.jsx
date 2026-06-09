import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import Footer from '../components/layout/Footer.jsx';
import QuickViewModal from '../components/product/QuickViewModal.jsx';
import { productApi } from '../api/products';
import { useCommerce } from '../context/commerceContext';
import { useToast } from '../context/toastContext';
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

const CATEGORY_ALIASES = {
  fabric: 'fabrics',
  kurta: 'kurtas',
  saree: 'sarees',
  shawl: 'shawls',
  muffler: 'mufflers',
  stole: 'stoles',
  suit: 'suits',
}

const slugifyCategory = value => {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return CATEGORY_ALIASES[slug] || slug
}

const labelFromSlug = slug => slug
  .split('-')
  .filter(Boolean)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')

function Shop() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [shopProducts, setShopProducts] = useState([]);
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [shopError, setShopError] = useState(null);
  const { products, addToCart, addToWishlist, isCatalogLoading, isWishlistUpdating } = useCommerce();

  const selectedCategory = slugifyCategory(searchParams.get('category'));

  const openQuickViewFromKeyboard = (event, product) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setQuickViewProduct(product);
    }
  };

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map();
    categoryMap.set('', { label: 'All', slug: '', count: products.length });

    products.forEach(product => {
      const slug = slugifyCategory(product.category);
      if (!slug) return;
      const current = categoryMap.get(slug);
      categoryMap.set(slug, {
        label: current?.label || product.category || labelFromSlug(slug),
        slug,
        count: (current?.count || 0) + 1,
      });
    });

    return [...categoryMap.values()];
  }, [products]);

  const selectedCategoryLabel = selectedCategory
    ? categoryOptions.find(category => category.slug === selectedCategory)?.label || labelFromSlug(selectedCategory)
    : 'All Collections';

  useEffect(() => {
    let isMounted = true;

    const loadShopProducts = async () => {
      setIsShopLoading(true);
      setShopError(null);

      try {
        const result = await productApi.list({
          limit: 100,
          sort: 'newest',
          ...(selectedCategory ? { categorySlug: selectedCategory } : {}),
        });

        if (!isMounted) return;
        setShopProducts(result.products);
      } catch (error) {
        if (!isMounted) return;
        const fallbackProducts = selectedCategory
          ? products.filter(product => slugifyCategory(product.category) === selectedCategory)
          : products;
        setShopProducts(fallbackProducts);
        setShopError(error.message);
      } finally {
        if (isMounted) setIsShopLoading(false);
      }
    };

    loadShopProducts();

    return () => {
      isMounted = false;
    };
  }, [products, selectedCategory]);

  const handleCategoryChange = slug => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug) nextParams.set('category', slug);
    else nextParams.delete('category');
    setSearchParams(nextParams);
  };

  const filteredProducts = shopProducts;

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
              {categoryOptions.map(category => (
                <li key={category.slug || 'all'}>
                  <button
                    className={`filter-btn ${selectedCategory === category.slug ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.slug)}
                  >
                    {category.label}
                    <span className="filter-count">
                      ({category.count})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div className="shop-content">
            <div className="shop-header-actions">
              <span className="results-count">
                {isShopLoading || isCatalogLoading
                  ? `Loading ${selectedCategoryLabel}...`
                  : `Showing ${filteredProducts.length} ${selectedCategoryLabel} result${filteredProducts.length === 1 ? '' : 's'}`}
              </span>
              {shopError && <span className="shop-data-note">Showing saved catalog while backend reconnects</span>}
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
                      <button
                        className="sp-action-btn"
                        type="button"
                        aria-label="Compare"
                        onClick={(event) => {
                          event.stopPropagation();
                          toast.info('Product comparison is not available yet.');
                        }}
                      >
                        <ShuffleIcon />
                      </button>
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
                        disabled={isWishlistUpdating}
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

            {!isShopLoading && !filteredProducts.length && (
              <div className="shop-empty-state">
                <h3>No products found</h3>
                <p>Try another category or check back after the catalog is updated.</p>
              </div>
            )}
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
