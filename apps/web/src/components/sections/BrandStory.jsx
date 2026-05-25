import { motion } from 'framer-motion';
import './BrandStory.css';

// Import image
import ourStoryBg from '../../assets/our story.webp';

// Diamond/flower ornament for the divider
const DividerIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
  </svg>
);

// Small flower icon for the button
const ButtonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 14.5 8 18 8C21.5 8 22 12 22 12C22 12 16 13.5 16 17C16 20.5 12 22 12 22C12 22 9.5 16 6 16C2.5 16 2 12 2 12C2 12 8 10.5 8 7C8 3.5 12 2 12 2Z" />
  </svg>
);

function BrandStory() {
  return (
    <section className="brand-story" style={{ backgroundImage: `url(${ourStoryBg})` }}>
      <div className="story-overlay">
        <div className="container">
          <div className="story-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="story-label">Our Story</span>
              
              <h2 className="story-heading">
                The Soul of Doon,<br />
                Woven in Silk
              </h2>
              
              <div className="story-divider">
                <span className="story-divider-icon">
                  <DividerIcon />
                </span>
              </div>
              
              <p className="story-text">
                Born in the serene valleys of Uttarakhand, our silks celebrate the quiet elegance of tradition and the purity of handcrafted dreams.
              </p>
              
              <button className="btn-primary">
                Our Journey
                <ButtonIcon />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BrandStory;
