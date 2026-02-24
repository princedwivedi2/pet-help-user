import { useEffect } from 'react';
import styles from './Modal.module.css';
import Icon from '../Icon/Icon';

export default function Modal({ open, isOpen, onClose, title, children, footer, size = 'md' }) {
  const visible = open ?? isOpen;

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      const handler = (e) => e.key === 'Escape' && onClose?.();
      window.addEventListener('keydown', handler);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handler);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.panel} ${styles[size] || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
