import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '../../components/common/Icon/Icon';
import styles from './Landing.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  {
    icon: 'vets', title: 'Find Vets Near You',
    desc: 'Search verified veterinarians and book appointments instantly.',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
    glow: 'rgba(249,115,22,0.18)',
  },
  {
    icon: 'sos', title: 'Emergency SOS',
    desc: 'One-tap emergency alert to connect with nearby vets when your pet needs urgent care.',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    glow: 'rgba(239,68,68,0.18)',
  },
  {
    icon: 'guides', title: 'Emergency Guides',
    desc: 'Step-by-step first-aid guides for common pet emergencies.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    glow: 'rgba(139,92,246,0.18)',
  },
  {
    icon: 'community', title: 'Community',
    desc: 'Ask questions, share experiences, and connect with fellow pet parents.',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    glow: 'rgba(6,182,212,0.18)',
  },
];

const STATS = [
  { value: '10K+', label: 'Pet Parents' },
  { value: '500+', label: 'Verified Vets' },
  { value: '24/7', label: 'SOS Support' },
  { value: '4.8★', label: 'App Rating' },
];

const STEPS = [
  { n: '1', title: 'Create Account', desc: "Sign up free and add your pet's profile in seconds.", color: '#f97316' },
  { n: '2', title: 'Find a Vet', desc: 'Browse verified vets nearby and pick the best match.', color: '#8b5cf6' },
  { n: '3', title: 'Book & Visit', desc: 'Confirm your slot and get your pet the care they deserve.', color: '#06b6d4' },
];

export default function Landing() {
  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>P</span>
            <span className={styles.logoText}>PetSathi</span>
          </Link>
          <div className={styles.headerActions}>
            <Link to="/login" className={styles.loginLink}>Log in</Link>
            <Link to="/register" className={styles.signupLink}>Get started free</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* mesh blobs */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />

        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            {/* floating trust badge */}
            <motion.div
              className={styles.trustBadge}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className={styles.trustDot} />
              🐾 Trusted by 10,000+ pet parents
            </motion.div>

            <motion.h1
              className={styles.heroTitle}
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
            >
              Your pet's health,<br />our <span className={styles.heroHighlight}>priority</span>
            </motion.h1>

            <motion.p
              className={styles.heroDesc}
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
            >
              PetSathi connects you with trusted veterinarians, provides emergency care
              guidance, and builds a community of caring pet parents.
            </motion.p>

            <motion.div
              className={styles.heroCta}
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
            >
              <Link to="/register" className={styles.ctaPrimary}>
                Get started free
                <span className={styles.ctaArrow}>→</span>
              </Link>
              <Link to="/find-vets" className={styles.ctaSecondary}>Find vets</Link>
            </motion.div>

            <motion.p
              className={styles.vetCtaLink}
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
            >
              <Link to="/vet/apply">Are you a veterinarian? Join as Vet →</Link>
            </motion.p>
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
              <circle cx="120" cy="120" r="12" fill="#8b5cf6" opacity="0.2"/>
              <circle cx="290" cy="130" r="8" fill="#f97316" opacity="0.2"/>
              <circle cx="100" cy="260" r="6" fill="#06b6d4" opacity="0.2"/>
              <circle cx="310" cy="270" r="10" fill="#f97316" opacity="0.15"/>
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
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

      {/* ── Features — glassmorphism cards ── */}
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
                <div className={styles.featureIconWrap} style={{ background: f.gradient, boxShadow: `0 8px 24px ${f.glow}` }}>
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className={styles.featureName}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works — timeline ── */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionDesc}>Start in minutes. No complicated setup.</p>
          <div className={styles.timeline}>
            {STEPS.map((s, i) => (
              <div key={s.n} className={styles.timelineItem}>
                <div className={styles.timelineNode} style={{ background: s.color, boxShadow: `0 4px 16px ${s.color}44` }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && <div className={styles.timelineLine} />}
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className={styles.cta}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.ctaInner}>
          <div className={styles.ctaBadge}>🏥 Free to get started</div>
          <h2 className={styles.ctaTitle}>Ready to give your pet the best care?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of pet parents who trust PetSathi for their pet's wellbeing.
          </p>
          <Link to="/register" className={styles.ctaPrimary}>
            Create free account <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </motion.section>

      {/* ── Footer with columns ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.logoMark} style={{ width: 28, height: 28, fontSize: 12 }}>P</span>
              <span className={styles.footerLogoText}>PetSathi</span>
            </div>
            <p className={styles.footerTagline}>Caring for pets, connecting communities.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Product</h4>
              <Link to="/find-vets" className={styles.footerLink}>Find Vets</Link>
              <Link to="/guides" className={styles.footerLink}>Emergency Guides</Link>
              <Link to="/community" className={styles.footerLink}>Community</Link>
              <Link to="/blog" className={styles.footerLink}>Blog</Link>
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Company</h4>
              <Link to="/vet/apply" className={styles.footerLink}>Join as Vet</Link>
              <Link to="/legal/about" className={styles.footerLink}>About</Link>
              <Link to="/legal/contact" className={styles.footerLink}>Contact</Link>
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Legal</h4>
              <Link to="/legal/privacy" className={styles.footerLink}>Privacy Policy</Link>
              <Link to="/legal/terms" className={styles.footerLink}>Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} PetSathi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
