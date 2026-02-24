import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.name}>PetSathi</span>
          <span className={styles.copy}>
            &copy; {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
        <nav className={styles.links}>
          <Link to="/find-vets">Find Vets</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/community">Community</Link>
        </nav>
      </div>
    </footer>
  );
}
