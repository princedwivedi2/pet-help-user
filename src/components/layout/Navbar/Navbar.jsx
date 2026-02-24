import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Icon from '../../common/Icon/Icon';
import styles from './Navbar.module.css';

const PUBLIC_NAV = [
  { path: '/find-vets', label: 'Find Vets' },
  { path: '/guides', label: 'Guides' },
  { path: '/blog', label: 'Blog' },
  { path: '/community', label: 'Community' },
];

const AUTH_NAV = [
  { path: '/home', label: 'Home' },
  { path: '/find-vets', label: 'Find Vets' },
  { path: '/pets', label: 'My Pets' },
  { path: '/appointments', label: 'Appointments' },
  { path: '/sos', label: 'SOS' },
  { path: '/guides', label: 'Guides' },
  { path: '/blog', label: 'Blog' },
  { path: '/community', label: 'Community' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isAuthenticated ? AUTH_NAV : PUBLIC_NAV;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to={isAuthenticated ? '/home' : '/'} className={styles.logo}>
          <span className={styles.logoMark}>P</span>
          <span className={styles.logoText}>PetSathi</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Mobile-only auth actions */}
          <div className={styles.mobileAuth}>
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Notifications
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </NavLink>
                <button
                  className={styles.mobileLogout}
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                >
                  Log out
                </button>
              </>
            ) : (
              <div className={styles.mobileAuthLinks}>
                <Link to="/login" className={styles.mobileLoginLink} onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className={styles.mobileRegisterLink} onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className={styles.iconBtn}>
                <Icon name="notification" size={20} />
              </Link>
              <Link to="/profile" className={styles.avatar}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Link>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>Log in</Link>
              <Link to="/register" className={styles.registerLink}>Sign up</Link>
            </div>
          )}

          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
