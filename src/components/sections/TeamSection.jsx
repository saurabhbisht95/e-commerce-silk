import { motion } from 'framer-motion'
import './TeamSection.css'

// Import images
import pushkarImg from '../../assets/Pushkar-Singh-Dhami-modified.png'
import dhanImg from '../../assets/Dr.-Dhan-Singh-Rawat-modified.png'
import meharbanImg from '../../assets/meharban.jpeg'
import anandImg from '../../assets/Anand-A.D.-Shukla-modified.png'

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Pushkar Singh Dhami',
    role: 'Hon. Chief Minister Uttarakhand',
    image: pushkarImg,
  },
  {
    id: 2,
    name: 'Dr. Dhan Singh Rawat',
    role: 'Hon. Cabinet Minister, Co-operatives & Higher Education',
    image: dhanImg,
  },
  {
    id: 3,
    name: 'Dr. Meharban Singh Bisht',
    role: 'Registrar Co-Operatives Societies Uttarakhand',
    image: meharbanImg,
  },
  {
    id: 4,
    name: 'Anand A.D. Shukla',
    role: 'Managing Director',
    image: anandImg,
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // --ease-silk equivalent
    },
  },
}

function TeamSection() {
  return (
    <section className="team-section section-pad" aria-label="Our Team">
      <div className="container">
        
        {/* Section Header */}
        <div className="team-header">
          <h2 className="team-title">Our Team</h2>
          <p className="team-subtitle">Driven by Passion, United for Excellence.</p>
        </div>

        {/* Team Grid */}
        <motion.div
          className="team-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {TEAM_MEMBERS.map(member => (
            <motion.div key={member.id} className="team-card" variants={cardVariants}>
              <div className="team-img-wrap">
                <img src={member.image} alt={member.name} className="team-img" loading="lazy" />
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default TeamSection
