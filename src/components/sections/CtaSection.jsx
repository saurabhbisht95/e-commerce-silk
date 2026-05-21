import { motion } from 'framer-motion';
import './CtaSection.css';
import legacyBg from '../../assets/legacy.webp';

const FlowerIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z" />
  </svg>
);

function CtaSection() {
  return (
    <section className="cta-section">
      <img 
        src={legacyBg}
        alt="Cultural legacy and heritage" 
        className="cta-background"
        loading="lazy"
      />
      <div className="cta-overlay texture-overlay"></div>
      
      <div className="cta-content">
        <motion.div
          className="cta-legacy-frame"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="cta-subtitle">Let's Build</span>
          <h2 className="cta-title">Legacy</h2>
          
          <div className="cta-ornament">
            <FlowerIcon />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CtaSection;
