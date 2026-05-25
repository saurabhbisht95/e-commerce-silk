import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './CollectionShowcase.css';

// Import Assets
import ivoryBg from '../../assets/ivorybg.webp';
import ivoryModal from '../../assets/ivorymodal.webp';
import royalRedBg from '../../assets/royalredbg.webp';
import royalRedModal from '../../assets/royalredmodal.webp';
import himalayanBlueBg from '../../assets/himalayanbluebg.webp';
import himalayanBlueModal from '../../assets/himalayanbluemodal.webp';

const collections = [
  {
    id: 'ivory',
    title: 'IVORY',
    subtitle: 'Timeless. Pure.\nAlways Classic.',
    bg: ivoryBg,
    model: ivoryModal,
    colorClass: 'theme-ivory',
    link: '#ivory'
  },
  {
    id: 'red',
    title: 'ROYAL RED',
    subtitle: 'Bold. Regal.\nUnforgettable.',
    bg: royalRedBg,
    model: royalRedModal,
    colorClass: 'theme-red',
    link: '#red'
  },
  {
    id: 'blue',
    title: 'HIMALAYAN BLUE',
    subtitle: 'Calm. Elegant.\nNaturally You.',
    bg: himalayanBlueBg,
    model: himalayanBlueModal,
    colorClass: 'theme-blue',
    link: '#blue'
  }
];

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const MandalaIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="collection-mandala">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
  </svg>
);

function CollectionShowcase() {
  return (
    <section className="collection-section section-pad texture-overlay">
      <div className="container">
        <div className="collection-header">
          <span className="section-label">Explore Our Collections</span>
        </div>

        <motion.div 
          className="collection-slider-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Custom Navigation Arrows */}
          <button className="collection-prev" aria-label="Previous Collection">
            <ArrowLeftIcon />
          </button>
          <button className="collection-next" aria-label="Next Collection">
            <ArrowRightIcon />
          </button>

          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.collection-prev',
              nextEl: '.collection-next',
            }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="collection-swiper"
          >
            {collections.map((collection) => (
              <SwiperSlide key={collection.id}>
                <a 
                  href={collection.link} 
                  className={`collection-card ${collection.colorClass}`}
                  style={{ backgroundImage: `url(${collection.bg})` }}
                >
                  
                  <div className="collection-content">
                    <MandalaIcon />
                    <h3 className="collection-title">{collection.title}</h3>
                    <span className="collection-label">COLLECTION</span>
                    
                    <p className="collection-subtitle">
                      {collection.subtitle.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </p>
                    
                    <span className="collection-explore">
                      SHOP NOW <span className="collection-explore-arrow">→</span>
                    </span>
                  </div>

                  <div className="collection-model-wrapper">
                    <img 
                      src={collection.model} 
                      alt={`${collection.title} Model`} 
                      className="collection-model"
                      loading="lazy"
                    />
                  </div>

                </a>
              </SwiperSlide>
            ))}
          </Swiper>

        </motion.div>
      </div>
    </section>
  );
}

export default CollectionShowcase;