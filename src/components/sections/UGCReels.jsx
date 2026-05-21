import { useEffect, useRef, useState } from 'react'
import { PRODUCTS } from '../../data/products'
import './UGCReels.css'

const REEL_COPY = [
  ['@doonbride', 'Royal red drape for a festive evening', '0:18'],
  ['@silkdiaries', 'Soft ivory silk styled for brunch', '0:12'],
  ['@valleyweaves', 'Handloom texture close-up', '0:15'],
  ['@uttarakhandstyle', 'Stole styling in three ways', '0:21'],
  ['@heritagefits', 'Maroon shawl winter look', '0:16'],
  ['@festiveedit', 'Suit set with heirloom jewellery', '0:19'],
  ['@doonloom', 'Indigo muffler everyday styling', '0:10'],
  ['@silkwardrobe', 'Golden saree wedding guest look', '0:22'],
  ['@wovenstories', 'Mustard fabric moodboard', '0:14'],
  ['@kurtaedit', 'Rose silk kurta detail reel', '0:17'],
]

const REELS = PRODUCTS.slice(0, 10).map((product, index) => ({
  id: product.id,
  title: product.name,
  thumbnail: product.image,
  productCategory: product.category,
  creator: REEL_COPY[index][0],
  caption: REEL_COPY[index][1],
  duration: REEL_COPY[index][2],
}))

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

const ChevronIcon = ({ direction }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
  </svg>
)

function UGCReels() {
  const [activeIndex, setActiveIndex] = useState(null)
  const reelRailRef = useRef(null)
  const activeReel = activeIndex === null ? null : REELS[activeIndex]

  useEffect(() => {
    if (!activeReel) return undefined

    const handleKeyDown = event => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') setActiveIndex(index => (index === null ? index : (index + REELS.length - 1) % REELS.length))
      if (event.key === 'ArrowRight') setActiveIndex(index => (index === null ? index : (index + 1) % REELS.length))
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeReel])

  const openFromKeyboard = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setActiveIndex(index)
    }
  }

  const showPrevious = () => {
    setActiveIndex(index => (index === null ? index : (index + REELS.length - 1) % REELS.length))
  }

  const showNext = () => {
    setActiveIndex(index => (index === null ? index : (index + 1) % REELS.length))
  }

  const scrollRail = direction => {
    if (!reelRailRef.current) return

    const firstCard = reelRailRef.current.querySelector('.ugc-card')
    const cardWidth = firstCard?.getBoundingClientRect().width || 220
    reelRailRef.current.scrollBy({
      left: direction * (cardWidth * 2 + 32),
      behavior: 'smooth',
    })
  }

  return (
    <section className="ugc-section section-pad">
      <div className="container">
        <div className="ugc-header">
          <span className="section-label">UGC Reels</span>
          <div className="ugc-header-actions">
            <p>Real styling moments from the Doon Silk community.</p>
            <div className="ugc-rail-controls">
              <button type="button" aria-label="Scroll reels left" onClick={() => scrollRail(-1)}>
                <ChevronIcon direction="left" />
              </button>
              <button type="button" aria-label="Scroll reels right" onClick={() => scrollRail(1)}>
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>
        </div>

        <div className="ugc-grid" ref={reelRailRef}>
          {REELS.map((reel, index) => (
            <div
              className="ugc-card"
              key={reel.id}
              role="button"
              tabIndex={0}
              aria-label={`Play reel by ${reel.creator}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={event => openFromKeyboard(event, index)}
            >
              <img src={reel.thumbnail} alt={reel.caption} className="ugc-thumb" loading="lazy" />
              <div className="ugc-card-overlay">
                <span className="ugc-play"><PlayIcon /></span>
                <span className="ugc-duration">{reel.duration}</span>
              </div>
              <div className="ugc-card-info">
                <strong>{reel.creator}</strong>
                <span>{reel.productCategory}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeReel && (
        <div className="ugc-modal-backdrop" role="presentation" onClick={() => setActiveIndex(null)}>
          <section
            className="ugc-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeReel.creator} reel`}
            onClick={event => event.stopPropagation()}
          >
            <button className="ugc-modal-close" type="button" aria-label="Close reel" onClick={() => setActiveIndex(null)}>
              <CloseIcon />
            </button>

            <button className="ugc-modal-nav ugc-modal-nav--prev" type="button" aria-label="Previous reel" onClick={showPrevious}>
              <ChevronIcon direction="left" />
            </button>

            <div className="ugc-player">
              <img src={activeReel.thumbnail} alt={activeReel.caption} className="ugc-player-poster" />
              <div className="ugc-player-shade" />
              <div className="ugc-player-play">
                <PlayIcon />
              </div>
              <div className="ugc-player-meta">
                <strong>{activeReel.creator}</strong>
                <span>{activeReel.caption}</span>
              </div>
            </div>

            <button className="ugc-modal-nav ugc-modal-nav--next" type="button" aria-label="Next reel" onClick={showNext}>
              <ChevronIcon direction="right" />
            </button>
          </section>
        </div>
      )}
    </section>
  )
}

export default UGCReels
