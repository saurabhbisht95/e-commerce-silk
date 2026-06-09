// import React from 'react';
// import { motion } from 'framer-motion';
// import './CategorySection.css';

// // Custom ornament SVG to match the design style
// const OrnamentIcon = () => (
//   <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
//     <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
//     <circle cx="12" cy="10" r="1.5" fill="var(--color-cream)" />
//   </svg>
// );

// const categories = [
//   {
//     id: 'fabric',
//     title: 'Fabric',
//     image: '../assets/fabric.webp',
//     link: '#fabric'
//   },
//   {
//     id: 'kurta',
//     title: 'Kurta',
//     image: '../assets/kurta.webp',
//     link: '#kurta'
//   },
//   {
//     id: 'saree',
//     title: 'Saree',
//     image: '../assets/saree.webp',
//     link: '#saree'
//   },
//   {
//     id: 'shawls',
//     title: 'Shawls',
//     image: '../assets/shawl.webp',
//     link: '#shawls'
//   },
//   {
//     id: 'muffler',
//     title: 'Muffler',
//     image: '../assets/muffler.webp',
//     link: '#muffler'
//   },
//   {
//     id: 'stoles',
//     title: 'Stoles',
//     image: '../assets/stole.webp',
//     link: '#stoles'
//   },
//   {
//     id: 'suits',
//     title: 'Suits',
//     image: '../assets/suit.webp',
//     link: '#suits'
//   },
//   {
//     id: 'collections',
//     title: 'Collections',
//     image: '../assets/',
//     link: '#collections'
//   }
// ];

// // Animation variants for Framer Motion
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.15
//     }
//   }
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       ease: [0.25, 0.46, 0.45, 0.94] // var(--ease-silk) equivalent
//     }
//   }
// };

// function CategorySection() {
//   return (
//     <section className="category-section section-pad texture-overlay">
//       <div className="container">

//         {/* Section Header */}
//         <div className="category-header">
//           <span className="section-label">Shop By Category</span>
//         </div>

//         {/* Category Grid */}
//         <motion.div
//           className="category-grid"
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, margin: "-100px" }}
//         >
//           {categories.map((category) => (
//             <motion.a
//               href={category.link}
//               className="category-card"
//               key={category.id}
//               variants={cardVariants}
//             >
//               <div className="category-card-inner">

//                 {/* Arch-shaped Image Wrapper */}
//                 <div className="category-image-wrapper arch-clip">
//                   <img
//                     src={category.image}
//                     alt={category.title}
//                     className="category-image"
//                     loading="lazy"
//                   />
//                 </div>

//                 {/* Overlapping Content Box */}
//                 <div className="category-content">
//                   <div className="category-icon">
//                     <OrnamentIcon />
//                   </div>
//                   <h3 className="category-title">{category.title}</h3>
//                   <span className="category-explore">
//                     Explore <span className="category-explore-arrow">→</span>
//                   </span>
//                 </div>

//               </div>
//             </motion.a>
//           ))}
//         </motion.div>

//       </div>
//     </section>
//   );
// }

// export default CategorySection;

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CategorySection.css';

// ✅ Import all images at the top
import fabricImg from '../../assets/fabric.webp';
import kurtaImg from '../../assets/kurta.webp';
import sareeImg from '../../assets/saree.webp';
import shawlImg from '../../assets/shawl.webp';
import mufflerImg from '../../assets/muffler.webp';
import stoleImg from '../../assets/stole.webp';
import suitImg from '../../assets/suit.webp';
import collectionsImg from '../../assets/collection.webp';

const OrnamentIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    <circle cx="12" cy="10" r="1.5" fill="var(--color-cream)" />
  </svg>
);

// ✅ Use imported image variables, not string paths
const categories = [
  { id: 'fabric', title: 'Fabric', image: fabricImg, link: '/shop?category=fabrics' },
  { id: 'kurta', title: 'Kurta', image: kurtaImg, link: '/shop?category=kurtas' },
  { id: 'saree', title: 'Saree', image: sareeImg, link: '/shop?category=sarees' },
  { id: 'shawls', title: 'Shawls', image: shawlImg, link: '/shop?category=shawls' },
  { id: 'muffler', title: 'Muffler', image: mufflerImg, link: '/shop?category=mufflers' },
  { id: 'stoles', title: 'Stoles', image: stoleImg, link: '/shop?category=stoles' },
  { id: 'suits', title: 'Suits', image: suitImg, link: '/shop?category=suits' },
  { id: 'collections', title: 'Collections', image: collectionsImg, link: '/shop' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

function CategorySection() {
  return (
    <section className="category-section section-pad texture-overlay">
      <div className="container">
        <div className="category-header">
          <span className="section-label">Shop By Category</span>
        </div>

        <motion.div
          className="category-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category) => (
            <motion.div
              className="category-card"
              key={category.id}
              variants={cardVariants}
            >
              <Link to={category.link} className="category-card-inner">
                <div className="category-image-wrapper arch-clip">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="category-image"
                    loading="lazy"
                  />
                </div>
                <div className="category-content">
                  <div className="category-icon">
                    <OrnamentIcon />
                  </div>
                  <h3 className="category-title">{category.title}</h3>
                  <span className="category-explore">
                    Explore <span className="category-explore-arrow">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CategorySection;
