import styles from './EmptyState.module.css';
import Icon from '../Icon/Icon';

export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.iconWrap}>
        <Icon name="search" size={28} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
