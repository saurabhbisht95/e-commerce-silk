import { motion } from 'framer-motion';
import './TrustStrip.css';

const LotusIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.5C12 21.5 5 16 5 11.5C5 7.5 8 5.5 12 2.5C16 5.5 19 7.5 19 11.5C19 16 12 21.5 12 21.5Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21.5C12 21.5 8 16.5 8 12C8 9 10 7.5 12 5.5C14 7.5 16 9 16 12C16 16.5 12 21.5 12 21.5Z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArtisanIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 6L10 6M17 10L7 10M19 14L5 14M20 18L4 18M12 2V22" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeafDropIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5C12 2.5 5 9 5 14.5C5 18.366 8.13401 21.5 12 21.5C15.866 21.5 19 18.366 19 14.5C19 9 12 2.5 12 2.5Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21.5V11" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15C10 15 8.5 13.5 8.5 11" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeliveryIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19L20 19M5 19L5 7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V19" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 19L9 15C9 13.8954 9.89543 13 11 13H13C14.1046 13 15 13.8954 15 15V19" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const trustValues = [
  {
    id: 1,
    title: 'PURE SILK',
    subtitle: '100% Natural And Premium',
    icon: <LotusIcon />
  },
  {
    id: 2,
    title: 'HANDCRAFTED',
    subtitle: 'By Skilled Artisans Of Uttarakhand',
    icon: <ArtisanIcon />
  },
  {
    id: 3,
    title: 'NATURAL DYES',
    subtitle: 'Eco-Friendly & Skin Safe',
    icon: <LeafDropIcon />
  },
  {
    id: 4,
    title: 'WORLDWIDE DELIVERY',
    subtitle: 'Bringing Doon To Your Doorstep',
    icon: <DeliveryIcon />
  },
  {
    id: 5,
    title: 'SECURE PAYMENT',
    subtitle: 'Safe, Fast & Reliable',
    icon: <ShieldIcon />
  }
];

function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="container">
        <div className="trust-grid">
          {trustValues.map((item, index) => (
            <motion.div 
              className="trust-item" 
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="trust-icon">
                {item.icon}
              </div>
              <div className="trust-text">
                <span className="trust-title">{item.title}</span>
                <span className="trust-subtitle">{item.subtitle}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
