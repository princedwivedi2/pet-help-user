import styles from './SearchBar.module.css';
import Icon from '../Icon/Icon';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.iconWrap}>
        <Icon name="search" size={16} />
      </span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className={styles.clear} onClick={() => onChange('')} aria-label="Clear">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
}
