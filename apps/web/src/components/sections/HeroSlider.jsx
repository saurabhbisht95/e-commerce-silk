import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

// Swiper core styles
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { HERO_SLIDES } from '../../data/siteData'
import { bannerApi } from '../../api/banners'
import './HeroSlider.css'
import heroSideArt from '../../assets/herosideart.webp'

/* ── Aipan mandala SVG (left panel decorative element) ── */
const AipanMandala = () => (
  <svg viewBox="0 0 300 300" className="hs-mandala" aria-hidden="true" fill="none">
    {/* Outer ring */}
    <circle cx="150" cy="150" r="130" stroke="rgba(200,169,106,0.25)" strokeWidth="0.8" />
    <circle cx="150" cy="150" r="110" stroke="rgba(200,169,106,0.2)" strokeWidth="0.6" strokeDasharray="4 6" />
    <circle cx="150" cy="150" r="90"  stroke="rgba(200,169,106,0.3)" strokeWidth="0.8" />
    {/* Petal ring — 12 petals */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180
      const cx = 150 + 90 * Math.cos(angle)
      const cy = 150 + 90 * Math.sin(angle)
      return (
        <ellipse
          key={i}
          cx={cx} cy={cy} rx="7" ry="18"
          transform={`rotate(${i * 30 + 90}, ${cx}, ${cy})`}
          fill="rgba(200,169,106,0.18)"
          stroke="rgba(200,169,106,0.4)"
          strokeWidth="0.6"
        />
      )
    })}
    {/* Middle ring petals — 8 petals */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * 45 * Math.PI) / 180
      const cx = 150 + 55 * Math.cos(angle)
      const cy = 150 + 55 * Math.sin(angle)
      return (
        <ellipse
          key={i}
          cx={cx} cy={cy} rx="5" ry="14"
          transform={`rotate(${i * 45 + 90}, ${cx}, ${cy})`}
          fill="rgba(200,169,106,0.15)"
          stroke="rgba(200,169,106,0.5)"
          strokeWidth="0.7"
        />
      )
    })}
    {/* Inner circle */}
    <circle cx="150" cy="150" r="28" stroke="rgba(200,169,106,0.5)" strokeWidth="1" fill="rgba(200,169,106,0.05)" />
    <circle cx="150" cy="150" r="18" stroke="rgba(200,169,106,0.4)" strokeWidth="0.8" fill="rgba(200,169,106,0.08)" />
    {/* Center lotus */}
    {Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 60 * Math.PI) / 180
      const cx = 150 + 10 * Math.cos(angle)
      const cy = 150 + 10 * Math.sin(angle)
      return <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(200,169,106,0.5)" />
    })}
    <circle cx="150" cy="150" r="4" fill="rgba(200,169,106,0.8)" />
    {/* Corner decorative dots */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180
      return (
        <circle
          key={i}
          cx={150 + 128 * Math.cos(rad)}
          cy={150 + 128 * Math.sin(rad)}
          r="2.5"
          fill="rgba(200,169,106,0.45)"
        />
      )
    })}
  </svg>
)

/* ── Decorative arch frame for right panel ── */
const ArchFrame = () => (
  <svg viewBox="0 0 220 280" className="hs-arch-frame" fill="none" aria-hidden="true">
    {/* Primary Outer Frame (Scalloped) */}
    <path
      d="M14 275 L14 82 C14 70, 32 58, 50 52 C68 46, 62 28, 110 13 C158 28, 152 46, 170 52 C188 58, 206 70, 206 82 L206 275"
      stroke="rgba(200,169,106,0.6)"
      strokeWidth="1.2"
    />
    {/* Secondary Inner Frame (Scalloped, slightly scaled down) */}
    <path
      d="M25 275 L25 85 C25 75, 41 65, 57 60 C73 55, 68 39, 110 26 C152 39, 147 55, 163 60 C179 65, 195 75, 195 85 L195 275"
      stroke="rgba(200,169,106,0.25)"
      strokeWidth="0.8"
      strokeDasharray="4 4"
    />
    
    {/* Crown */}
    <circle cx="110" cy="11" r="3" fill="rgba(200,169,106,0.7)" />
    
    {/* Side finials */}
    <circle cx="14" cy="82" r="2.5" fill="rgba(200,169,106,0.6)" />
    <circle cx="206" cy="82" r="2.5" fill="rgba(200,169,106,0.6)" />
    <circle cx="25" cy="85" r="1.5" fill="rgba(200,169,106,0.4)" />
    <circle cx="195" cy="85" r="1.5" fill="rgba(200,169,106,0.4)" />
    
    {/* Base line */}
    <line x1="14" y1="275" x2="206" y2="275" stroke="rgba(200,169,106,0.6)" strokeWidth="1.2" />
    <line x1="25" y1="271" x2="195" y2="271" stroke="rgba(200,169,106,0.25)" strokeWidth="0.8" strokeDasharray="4 4" />
  </svg>
)

/* ── SVG Masked Secondary Image ── */
const ArchMaskedImage = ({ src }) => (
  <svg viewBox="0 0 220 280" className="hs-arch-masked-image" aria-hidden="true">
    <defs>
      <clipPath id="arch-clip">
        <path d="M14 275 L14 82 C14 70, 32 58, 50 52 C68 46, 62 28, 110 13 C158 28, 152 46, 170 52 C188 58, 206 70, 206 82 L206 275 Z" />
      </clipPath>
    </defs>
    <image
      href={src}
      width="220"
      height="280"
      preserveAspectRatio="xMidYMid slice"
      clipPath="url(#arch-clip)"
      className="hs-side-img"
    />
  </svg>
)

/* ── Custom nav arrow ── */
const ArrowIcon = ({ dir = 'right' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'right'
      ? <><polyline points="9 18 15 12 9 6" /></>
      : <><polyline points="15 18 9 12 15 6" /></>
    }
  </svg>
)

/* ══════════════════════════════════════
   HERO SLIDER — PHASE 2
══════════════════════════════════════ */
function HeroSlider() {
  const prevRef = useRef(null)
  const nextRef = useRef(null)
  const [managedSlides, setManagedSlides] = useState([])

  useEffect(() => {
    let isMounted = true

    bannerApi
      .list()
      .then(banners => {
        if (isMounted) setManagedSlides(banners.filter(banner => banner.modelImage))
      })
      .catch(() => {
        if (isMounted) setManagedSlides([])
      })

    return () => {
      isMounted = false
    }
  }, [])

  const slides = useMemo(
    () => (managedSlides.length ? managedSlides : HERO_SLIDES),
    [managedSlides]
  )

  return (
    <section className="hs-section" aria-label="Hero slider">

      {/* Custom nav buttons — rendered outside Swiper so we can style freely */}
      <button ref={prevRef} className="hs-nav-btn hs-nav-btn--prev" aria-label="Previous slide">
        <ArrowIcon dir="left" />
      </button>
      <button ref={nextRef} className="hs-nav-btn hs-nav-btn--next" aria-label="Next slide">
        <ArrowIcon dir="right" />
      </button>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        speed={800}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.hs-pagination' }}
        navigation={true}
        onBeforeInit={swiper => {
          swiper.params.navigation.prevEl = prevRef.current
          swiper.params.navigation.nextEl = nextRef.current
        }}
        loop={true}
        className="hs-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="hs-slide">
            {({ isActive }) => (
              <div className="hs-slide__inner">

              {/* ── BACKGROUND LAYER: Full-bleed Hero model image ── */}
              <div className="hs-bg-layer">
                <img
                  src={slide.modelImage}
                  alt={`Slide ${slide.id} — Indian model in traditional silk`}
                  className="hs-bg-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="hs-bg-grad" aria-hidden="true" />
              </div>

              {/* ── FOREGROUND CONTENT ── */}
              <div className="hs-fg-layer container">
                
                {/* ── LEFT PANEL: Aipan + text ── */}
                <div className="hs-panel hs-panel--left">
                  {/* Mandala background */}
                  <div className="hs-mandala-wrap" aria-hidden="true">
                    <span className="hs-mandala-fallback">
                      <AipanMandala />
                    </span>
                    <img src={heroSideArt} alt="" className="hs-mandala" />
                  </div>

                  {/* Text content */}
                  <div className="hs-content">
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div
                          key={`text-${slide.id}`}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.12 } },
                            exit:   { transition: { staggerChildren: 0.06 } },
                          }}
                        >
                          {/* Headline lines */}
                          {slide.headline.map((line, i) => (
                            <motion.h1
                              key={i}
                              className="hs-headline"
                              variants={{
                                hidden:  { opacity: 0, y: 32 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
                                exit:    { opacity: 0, y: -16, transition: { duration: 0.3 } },
                              }}
                            >
                              {line}
                            </motion.h1>
                          ))}

                          {/* Gold divider */}
                          <motion.div
                            className="hs-divider"
                            variants={{
                              hidden:  { scaleX: 0, opacity: 0 },
                              visible: { scaleX: 1, opacity: 1, transition: { duration: 0.6, delay: 0.1 } },
                              exit:    { scaleX: 0, opacity: 0, transition: { duration: 0.2 } },
                            }}
                          >
                            <span className="hs-divider__line" />
                            <span className="hs-divider__icon">✦</span>
                            <span className="hs-divider__line" />
                          </motion.div>

                          {/* Subtext */}
                          <motion.p
                            className="hs-subtext"
                            variants={{
                              hidden:  { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } },
                              exit:    { opacity: 0, transition: { duration: 0.2 } },
                            }}
                          >
                            {slide.subtext.split('\n').map((t, i) => (
                              <span key={i}>{t}<br /></span>
                            ))}
                          </motion.p>

                          {/* CTA button */}
                          <motion.div
                            variants={{
                              hidden:  { opacity: 0, y: 16 },
                              visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25 } },
                              exit:    { opacity: 0, transition: { duration: 0.2 } },
                            }}
                          >
                            <a href={slide.ctaHref} className="hs-cta-btn">
                              <span>{slide.cta}</span>
                              <span className="hs-cta-btn__icon" aria-hidden="true">✾</span>
                            </a>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── RIGHT PANEL: Weaving / product visual ── */}
                <div className="hs-panel hs-panel--right">
                  <div className="hs-arch-compose">
                    <ArchMaskedImage src={slide.sideImage || slide.modelImage} />
                    <div className="hs-arch-frame-overlay" aria-hidden="true">
                      <ArchFrame />
                    </div>
                  </div>

                  {/* Slide counter */}
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        className="hs-counter"
                        key={`counter-${slide.id}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <span className="hs-counter__current">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="hs-counter__sep" />
                        <span className="hs-counter__total">
                          {String(slides.length).padStart(2, '0')}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom pagination dots */}
      <div className="hs-pagination" aria-label="Slide pagination" />

    </section>
  )
}

export default HeroSlider
