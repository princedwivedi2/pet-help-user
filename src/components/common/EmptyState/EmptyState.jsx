import styles from './EmptyState.module.css';
import Icon from '../Icon/Icon';

const ILLUSTRATIONS = {
  search: (
    <svg viewBox="0 0 160 120" fill="none">
      <circle cx="80" cy="55" r="40" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
      <circle cx="80" cy="55" r="18" stroke="#f97316" strokeWidth="2" fill="none"/>
      <line x1="93" y1="68" x2="110" y2="85" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="45" cy="30" r="4" fill="#8b5cf6" opacity="0.15"/>
      <circle cx="120" cy="35" r="3" fill="#f97316" opacity="0.15"/>
      <circle cx="35" cy="75" r="5" fill="#f97316" opacity="0.1"/>
    </svg>
  ),
  pets: (
    <svg viewBox="0 0 160 120" fill="none">
      <ellipse cx="80" cy="100" rx="50" ry="8" fill="#f97316" opacity="0.06"/>
      <circle cx="80" cy="55" r="32" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
      <path d="M68 48c-2-8-12-10-14-3s4 13 9 10" fill="#f97316" opacity="0.6"/>
      <path d="M92 48c2-8 12-10 14-3s-4 13-9 10" fill="#f97316" opacity="0.6"/>
      <circle cx="73" cy="56" r="3" fill="#1c1917"/>
      <circle cx="87" cy="56" r="3" fill="#1c1917"/>
      <ellipse cx="80" cy="63" rx="3.5" ry="2.5" fill="#1c1917"/>
      <path d="M75 67c3 3 7 3 10 0" stroke="#1c1917" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 160 120" fill="none">
      <rect x="40" y="25" width="80" height="70" rx="12" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
      <rect x="40" y="25" width="80" height="22" rx="12" fill="#f97316" opacity="0.12"/>
      <line x1="60" y1="20" x2="60" y2="32" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <line x1="100" y1="20" x2="100" y2="32" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
      <rect x="55" y="58" width="12" height="8" rx="2" fill="#f97316" opacity="0.2"/>
      <rect x="74" y="58" width="12" height="8" rx="2" fill="#f97316" opacity="0.2"/>
      <rect x="93" y="58" width="12" height="8" rx="2" fill="#f97316" opacity="0.15"/>
      <rect x="55" y="74" width="12" height="8" rx="2" fill="#f97316" opacity="0.15"/>
      <rect x="74" y="74" width="12" height="8" rx="2" fill="#8b5cf6" opacity="0.2"/>
    </svg>
  ),
  community: (
    <svg viewBox="0 0 160 120" fill="none">
      <circle cx="60" cy="50" r="18" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5"/>
      <circle cx="100" cy="50" r="18" fill="#fef3c7" stroke="#f97316" strokeWidth="1.5"/>
      <circle cx="80" cy="45" r="20" fill="white" stroke="#f97316" strokeWidth="1.5"/>
      <circle cx="74" cy="42" r="2.5" fill="#1c1917"/>
      <circle cx="86" cy="42" r="2.5" fill="#1c1917"/>
      <ellipse cx="80" cy="48" rx="3" ry="2" fill="#1c1917"/>
      <path d="M50 85c8-5 15 0 22-3s12 3 18 0 12 3 20 0" stroke="#f97316" strokeWidth="1.5" opacity="0.15" fill="none"/>
    </svg>
  ),
};

export default function EmptyState({ title = 'Nothing here yet', message, action, illustration = 'search' }) {
  const svgIllustration = ILLUSTRATIONS[illustration] || ILLUSTRATIONS.search;

  return (
    <div className={styles.empty}>
      <div className={styles.illustrationWrap}>
        {svgIllustration}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
