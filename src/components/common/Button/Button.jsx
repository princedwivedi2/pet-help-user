import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const sizeMap = { small: 'sm', sm: 'sm', md: 'md', lg: 'lg' };
  const sizeClass = styles[sizeMap[size] || size] || styles.md;
  const cls = [styles.btn, styles[variant] || '', sizeClass, fullWidth ? styles.full : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
