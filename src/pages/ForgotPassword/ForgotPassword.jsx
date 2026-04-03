import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FormInput from '../../components/common/FormInput/FormInput';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';
import styles from './ForgotPassword.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.illustrationPanel}>
        <div className={styles.illustrationContent}>
          <svg className={styles.illustration} viewBox="0 0 400 320" fill="none">
            <ellipse cx="200" cy="290" rx="160" ry="18" fill="#f97316" opacity="0.08"/>
            <circle cx="200" cy="150" r="60" fill="#fff7ed" stroke="#f97316" strokeWidth="2.5"/>
            <rect x="175" y="130" width="50" height="38" rx="6" fill="#f97316" opacity="0.15" stroke="#f97316" strokeWidth="2"/>
            <circle cx="200" cy="153" r="7" fill="#f97316" opacity="0.8"/>
            <line x1="200" y1="158" x2="200" y2="166" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M175 130 Q200 110 225 130" stroke="#f97316" strokeWidth="2.5" fill="none"/>
            <circle cx="310" cy="100" r="12" fill="#f97316" opacity="0.1"/>
            <circle cx="85" cy="200" r="5" fill="#8b5cf6" opacity="0.12"/>
          </svg>
          <h2 className={styles.illustrationTitle}>Reset Your Password</h2>
          <p className={styles.illustrationDesc}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <motion.div
        className={styles.formPanel}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className={styles.formInner}>
          <div className={styles.header}>
            <Link to="/" className={styles.logo}>
              <span className={styles.logoMark}>P</span>
              <span className={styles.logoText}>PetSathi</span>
            </Link>
            <h1 className={styles.title}>Forgot password?</h1>
            <p className={styles.subtitle}>No worries, we'll send you reset instructions.</p>
          </div>

          {sent ? (
            <motion.div
              className={styles.successBox}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>Check your email</h3>
              <p className={styles.successText}>
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <p className={styles.successHint}>
                Didn't receive it? Check your spam folder or{' '}
                <button className={styles.resendBtn} onClick={() => setSent(false)}>
                  try again
                </button>
              </p>
            </motion.div>
          ) : (
            <>
              {error && <div className={styles.error}>{error}</div>}
              <form onSubmit={handleSubmit} className={styles.form}>
                <FormInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Send reset link
                </Button>
              </form>
            </>
          )}

          <p className={styles.footer}>
            <Link to="/login" className={styles.backLink}>
              ← Back to login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
