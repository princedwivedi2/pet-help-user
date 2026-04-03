import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import notificationService from '../../../services/notificationService';
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
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = () => {
      notificationService.getUnreadCount()
        .then((res) => setUnreadCount(res?.data?.unread_count ?? res?.data?.count ?? 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

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
              <Link to="/notifications" className={styles.iconBtn} style={{ position: 'relative' }}>
                <Icon name="notification" size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#ef4444', color: '#fff',
                    fontSize: 10, fontWeight: 700, borderRadius: '50%',
                    minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
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
