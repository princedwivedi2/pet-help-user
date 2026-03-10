import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon/Icon';
import styles from './Landing.module.css';

const FEATURES = [
  { icon: 'vets', title: 'Find Vets Near You', desc: 'Search verified veterinarians and book appointments instantly.' },
  { icon: 'sos', title: 'Emergency SOS', desc: 'One-tap emergency alert to connect with nearby vets when your pet needs urgent care.' },
  { icon: 'guides', title: 'Emergency Guides', desc: 'Step-by-step first-aid guides for common pet emergencies.' },
  { icon: 'community', title: 'Community', desc: 'Ask questions, share experiences, and connect with fellow pet parents.' },
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

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Your pet's health,<br />our priority
          </h1>
          <p className={styles.heroDesc}>
            PetSathi connects you with trusted veterinarians, provides emergency care
            guidance, and builds a community of caring pet parents.
          </p>
          <div className={styles.heroCta}>
            <Link to="/register" className={styles.ctaPrimary}>Get started free</Link>
            <Link to="/find-vets" className={styles.ctaSecondary}>Find vets</Link>
          </div>
          <div className={styles.vetCta}>
            <Link to="/vet/apply" className={styles.vetCtaLink}>Are you a veterinarian? Join as Vet</Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <h2 className={styles.sectionTitle}>Everything your pet needs</h2>
          <p className={styles.sectionDesc}>
            From routine check-ups to emergency situations, PetSathi has you covered.
          </p>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className={styles.featureName}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to give your pet the best care?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of pet parents who trust PetSathi for their pet's wellbeing.
          </p>
          <Link to="/register" className={styles.ctaPrimary}>Create free account</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} PetSathi. All rights reserved.</p>
      </footer>
    </div>
  );
}
