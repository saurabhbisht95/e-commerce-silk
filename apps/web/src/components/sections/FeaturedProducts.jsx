import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import QuickViewModal from '../product/QuickViewModal.jsx';
import { useCommerce } from '../../context/commerceContext';
import 'swiper/css';
import 'swiper/css/navigation';
import './FeaturedProducts.css';

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

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

function FeaturedProducts() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { products, featuredProducts, addToCart, addToWishlist } = useCommerce();

  const openQuickViewFromKeyboard = (event, product) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setQuickViewProduct(product);
    }
  };

  return (
    <section className="featured-section section-pad">
      <div className="container">
        <div className="featured-header">
          <span className="section-label">Featured Products</span>

          <div className="featured-header-actions">
            <Link to="/shop" className="view-all-link">View All &rarr;</Link>

            <div className="featured-nav-controls">
              <button className="featured-prev" type="button" aria-label="Previous Products">
                <ArrowLeftIcon />
              </button>
              <button className="featured-next" type="button" aria-label="Next Products">
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>

        <motion.div
          className="featured-slider-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.featured-prev',
              nextEl: '.featured-next',
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="featured-swiper"
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product.backendId || product.id}>
                <div
                  className="product-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setQuickViewProduct(product)}
                  onKeyDown={(event) => openQuickViewFromKeyboard(event, product)}
                  aria-label={`Open quick view for ${product.name}`}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />

                    <div className="product-actions-pill">
                      <button className="product-action-btn" type="button" aria-label="Compare"><ShuffleIcon /></button>
                      <button
                        className="product-action-btn"
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
                        className="product-action-btn"
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

                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <span className="product-category">{product.category}</span>
                    <span className="product-price">{product.price}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        products={products}
        onClose={() => setQuickViewProduct(null)}
        onSelectProduct={setQuickViewProduct}
        onAddToCart={addToCart}
      />
    </section>
  );
}

export default FeaturedProducts;
