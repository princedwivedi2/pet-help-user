import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Icon from '../../common/Icon/Icon';
import styles from './BottomTabs.module.css';

const GUEST_TABS = [
  { path: '/find-vets', icon: 'vets', label: 'Vets' },
  { path: '/guides', icon: 'guides', label: 'Guides' },
  { path: '/blog', icon: 'blog', label: 'Blog' },
  { path: '/community', icon: 'community', label: 'Community' },
];

const AUTH_TABS = [
  { path: '/home', icon: 'home', label: 'Home' },
  { path: '/find-vets', icon: 'vets', label: 'Vets' },
  { path: '/sos', icon: 'sos', label: 'SOS', highlight: true },
  { path: '/pets', icon: 'pets', label: 'Pets' },
  { path: '/profile', icon: 'profile', label: 'Profile' },
];

export default function BottomTabs() {
  const { isAuthenticated } = useAuth();
  const tabs = isAuthenticated ? AUTH_TABS : GUEST_TABS;

  return (
    <nav className={styles.bottomTabs}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `${styles.tab} ${isActive ? styles.active : ''} ${tab.highlight ? styles.highlight : ''}`
          }
        >
          <span className={`${styles.iconWrap} ${tab.highlight ? styles.sosIcon : ''}`}>
            <Icon name={tab.icon} size={20} />
          </span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
