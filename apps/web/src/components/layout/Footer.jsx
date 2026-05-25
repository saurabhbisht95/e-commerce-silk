import './Footer.css';
import { FaInstagram, FaFacebookF, FaPinterestP, FaYoutube } from 'react-icons/fa';

const VillagePattern = () => (
  <svg width="100%" height="40" className="village-pattern" preserveAspectRatio="none">
    <defs>
      <pattern id="village" x="0" y="0" width="240" height="40" patternUnits="userSpaceOnUse">
        <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Ground */}
          <line x1="0" y1="35" x2="240" y2="35" />
          
          {/* Hut 1 */}
          <path d="M15,35 L15,20 L25,12 L35,20 L35,35" />
          <path d="M22,35 L22,26 L28,26 L28,35" />
          
          {/* Tree */}
          <path d="M50,35 L50,22 M45,22 C45,15 55,15 55,22 C55,28 45,28 45,22 Z" />
          
          {/* Temple */}
          <path d="M75,35 L75,15 L90,5 L105,15 L105,35" />
          <path d="M90,5 L90,0 M87,0 L93,0" />
          <path d="M85,35 L85,25 L95,25 L95,35" />
          
          {/* Tree 2 */}
          <path d="M125,35 L125,18 M115,18 C115,5 135,5 135,18 C135,25 115,25 115,18 Z" />
          
          {/* Small Hut */}
          <path d="M155,35 L155,25 L165,18 L175,25 L175,35" />
          <path d="M162,35 L162,28 L168,28 L168,35" />
          
          {/* Decorative Plant */}
          <path d="M200,35 L200,28 M196,30 L200,28 L204,30 M197,25 L200,28 L203,25" />
        </g>
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#village)" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" />
  </svg>
);

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        
        <div className="footer-top">
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              DOON SILK
              <span>Heritage of Doon</span>
            </a>
            <p className="footer-tagline">
              Celebrating the rich weaving heritage of Doon with timeless silks and thoughtful creations.
            </p>
            <div className="footer-socials">
              <a href="#instagram" className="social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="#facebook" className="social-icon" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#pinterest" className="social-icon" aria-label="Pinterest"><FaPinterestP /></a>
              <a href="#youtube" className="social-icon" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="footer-col-title">Shop</h4>
            <div className="footer-links">
              <a href="#fabric" className="footer-link">Fabric</a>
              <a href="#kurta" className="footer-link">Kurta</a>
              <a href="#saree" className="footer-link">Saree</a>
              <a href="#muffler" className="footer-link">Muffler</a>
              <a href="#collections" className="footer-link">Collections</a>
              <a href="#gift-cards" className="footer-link">Gift Cards</a>
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="footer-col-title">Customer Care</h4>
            <div className="footer-links">
              <a href="#about" className="footer-link">About Us</a>
              <a href="#journey" className="footer-link">Our Journey</a>
              <a href="#shipping" className="footer-link">Shipping & Delivery</a>
              <a href="#returns" className="footer-link">Returns & Exchanges</a>
              <a href="#faq" className="footer-link">FAQ</a>
              <a href="#contact" className="footer-link">Contact Us</a>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="footer-col-title">Newsletter</h4>
            <p className="footer-newsletter-text">
              Be the first to know about new collections and exclusive offers.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input" 
                required 
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <ArrowRightIcon />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Village Pattern Divider */}
      <VillagePattern />

      {/* Bottom Legal */}
      <div className="container">
        <div className="footer-bottom">
          <p>© 2026 Saurabh Bisht. All Rights Reserved.</p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span style={{ opacity: 0.3 }}>|</span>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
