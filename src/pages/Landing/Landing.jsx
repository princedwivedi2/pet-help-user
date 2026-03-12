import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/common/Icon/Icon';
import styles from './Landing.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const FEATURES = [
  { icon: 'vets', title: 'Find Vets Near You', desc: 'Search verified veterinarians and book appointments instantly.', color: '#f97316' },
  { icon: 'sos', title: 'Emergency SOS', desc: 'One-tap emergency alert to connect with nearby vets when your pet needs urgent care.', color: '#ef4444' },
  { icon: 'guides', title: 'Emergency Guides', desc: 'Step-by-step first-aid guides for common pet emergencies.', color: '#8b5cf6' },
  { icon: 'community', title: 'Community', desc: 'Ask questions, share experiences, and connect with fellow pet parents.', color: '#06b6d4' },
];

const STATS = [
  { value: '10K+', label: 'Pet Parents' },
  { value: '500+', label: 'Verified Vets' },
  { value: '24/7', label: 'SOS Support' },
  { value: '4.8★', label: 'App Rating' },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>P</span>
            <span className={styles.logoText}>PetSathi</span>
          </Link>
          <div className={styles.headerActions}>
            <Link to="/login" className={styles.loginLink}>Log in</Link>
            <Link to="/register" className={styles.signupLink}>Sign up</Link>
          </div>
        </div>
      </header>

      {/* ── Hero with illustration ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <motion.h1
              className={styles.heroTitle}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Your pet's health,<br />our <span className={styles.heroHighlight}>priority</span>
            </motion.h1>
            <motion.p
              className={styles.heroDesc}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              PetSathi connects you with trusted veterinarians, provides emergency care
              guidance, and builds a community of caring pet parents.
            </motion.p>
            <motion.div
              className={styles.heroCta}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Link to="/register" className={styles.ctaPrimary}>Get started free</Link>
              <Link to="/find-vets" className={styles.ctaSecondary}>Find vets</Link>
            </motion.div>
            <motion.div
              className={styles.vetCta}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <Link to="/vet/apply" className={styles.vetCtaLink}>Are you a veterinarian? Join as Vet →</Link>
            </motion.div>
          </div>
          <motion.div
            className={styles.heroIllustration}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 400 400" fill="none">
              <circle cx="200" cy="200" r="180" fill="#fff7ed" opacity="0.5"/>
              <circle cx="200" cy="200" r="130" fill="#fef3c7" opacity="0.6"/>
              <circle cx="200" cy="180" r="70" fill="white" stroke="#f97316" strokeWidth="2.5"/>
              <path d="M178 165c-4-14-22-18-26-5s7 24 17 19" fill="#f97316" opacity="0.7"/>
              <path d="M222 165c4-14 22-18 26-5s-7 24-17 19" fill="#f97316" opacity="0.7"/>
              <circle cx="188" cy="185" r="5" fill="#1c1917"/>
              <circle cx="212" cy="185" r="5" fill="#1c1917"/>
              <circle cx="189" cy="183" r="1.5" fill="white"/>
              <circle cx="213" cy="183" r="1.5" fill="white"/>
              <ellipse cx="200" cy="197" rx="6" ry="4" fill="#1c1917"/>
              <path d="M193 202c4 5 10 5 14 0" stroke="#1c1917" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M160 260c10 0 15-8 25-8s15 8 25 8 15-8 25-8 15 8 25 8" stroke="#f97316" strokeWidth="2.5" opacity="0.2" fill="none" strokeLinecap="round"/>
              <circle cx="120" cy="120" r="12" fill="#8b5cf6" opacity="0.15"/>
              <circle cx="290" cy="130" r="8" fill="#f97316" opacity="0.15"/>
              <circle cx="100" cy="260" r="6" fill="#06b6d4" opacity="0.15"/>
              <circle cx="310" cy="270" r="10" fill="#f97316" opacity="0.1"/>
              <path d="M280 80l10 8-4 12-12 0-4-12z" fill="#8b5cf6" opacity="0.12"/>
              <path d="M130 310l8 6-3 10-10 0-3-10z" fill="#f97316" opacity="0.12"/>
              <rect x="155" y="275" width="90" height="12" rx="6" fill="#f97316" opacity="0.12"/>
              <rect x="170" y="295" width="60" height="8" rx="4" fill="#8b5cf6" opacity="0.08"/>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Stats ── */}
      <motion.section
        className={styles.stats}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.statsInner}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <h2 className={styles.sectionTitle}>Everything your pet needs</h2>
          <p className={styles.sectionDesc}>
            From routine check-ups to emergency situations, PetSathi has you covered.
          </p>
          <motion.div
            className={styles.featureGrid}
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className={styles.featureCard} variants={fadeUp} custom={i}>
                <div className={styles.featureIcon} style={{ background: `${f.color}14`, color: f.color }}>
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className={styles.featureName}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Create Account</h3>
              <p className={styles.stepDesc}>Sign up free and add your pet's profile in seconds.</p>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Find a Vet</h3>
              <p className={styles.stepDesc}>Browse verified vets nearby and pick the best match.</p>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Book & Visit</h3>
              <p className={styles.stepDesc}>Book appointments instantly and get your pet the care they deserve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className={styles.cta}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to give your pet the best care?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of pet parents who trust PetSathi for their pet's wellbeing.
          </p>
          <Link to="/register" className={styles.ctaPrimary}>Create free account</Link>
        </div>
      </motion.section>

      <footer className={styles.landingFooter}>
        <p>&copy; {new Date().getFullYear()} PetSathi. All rights reserved.</p>
      </footer>
    </div>
  );
}
