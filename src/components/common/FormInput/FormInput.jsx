import styles from './FormInput.module.css';

export default function FormInput({
  label,
  name,
  type = 'text',
  as,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = '',
  options = [],
  rows = 4,
  children,
  min,
  max,
  step,
  ...rest
}) {
  const id = `field-${name || label?.replace(/\s+/g, '-')?.toLowerCase() || Math.random()}`;
  const inputType = as || type;

  const renderInput = () => {
    if (inputType === 'textarea') {
      return (
        <textarea
          id={id}
          name={name}
          className={`${styles.input} ${styles.textarea} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          {...rest}
        />
      );
    }

    if (inputType === 'select') {
      return (
        <select
          id={id}
          name={name}
          className={`${styles.input} ${styles.select} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...rest}
        >
          {children ? (
            children
          ) : (
            <>
              <option value="">{placeholder || 'Select...'}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </>
          )}
        </select>
      );
    }

    const inputProps = {
      id,
      name,
      type,
      className: `${styles.input} ${error ? styles.inputError : ''}`,
      onChange,
      placeholder,
      disabled,
      min,
      max,
      step,
      ...rest,
    };

    if (type !== 'file') {
      inputProps.value = value;
    }

    return <input {...inputProps} />;
  };

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      {renderInput()}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
