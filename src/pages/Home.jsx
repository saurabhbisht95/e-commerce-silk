import { motion } from 'framer-motion'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import HeroSlider from '../components/sections/HeroSlider.jsx'
import TeamSection from '../components/sections/TeamSection.jsx'
import CategorySection from '../components/sections/CategorySection.jsx'
import BrandStory from '../components/sections/BrandStory.jsx'
import CollectionShowcase from '../components/sections/CollectionShowcase.jsx'
import FeaturedProducts from '../components/sections/FeaturedProducts.jsx'
import UGCReels from '../components/sections/UGCReels.jsx'
import CtaSection from '../components/sections/CtaSection.jsx'
import TrustStrip from '../components/sections/TrustStrip.jsx'

function Home() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <Header />
      <main>
        <HeroSlider />
        <TeamSection />
        <CategorySection />
        <BrandStory />
        <CollectionShowcase />
        <FeaturedProducts />
        <UGCReels />
        <CtaSection />
        <TrustStrip />
      </main>
      <Footer />
    </motion.div>
  )
}

export default Home
