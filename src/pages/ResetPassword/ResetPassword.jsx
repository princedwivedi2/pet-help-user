import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FormInput from '../../components/common/FormInput/FormInput';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';
import styles from './ResetPassword.module.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [form, setForm] = useState({
    email: emailFromUrl,
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ ...form, token });
      navigate('/login?reset=success');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setError(data?.message || err.message || 'Password reset failed');
      }
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
            <path d="M182 148h36v28h-36z" rx="4" fill="#f97316" opacity="0.15" stroke="#f97316" strokeWidth="2"/>
            <path d="M190 148v-10a10 10 0 0 1 20 0v10" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="200" cy="164" r="5" fill="#f97316" opacity="0.9"/>
            <circle cx="310" cy="100" r="12" fill="#f97316" opacity="0.1"/>
            <circle cx="85" cy="200" r="5" fill="#8b5cf6" opacity="0.12"/>
          </svg>
          <h2 className={styles.illustrationTitle}>Set New Password</h2>
          <p className={styles.illustrationDesc}>
            Choose a strong password with at least 8 characters, one uppercase letter, and one number.
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
            <h1 className={styles.title}>Set new password</h1>
            <p className={styles.subtitle}>Your new password must be different from previous ones.</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
              required
              error={fieldErrors.email?.[0] || fieldErrors.email}
            />
            <FormInput
              label="New Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
              required
              error={fieldErrors.password?.[0] || fieldErrors.password}
            />
            <FormInput
              label="Confirm New Password"
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              placeholder="Re-enter your password"
              required
              error={fieldErrors.password_confirmation?.[0] || fieldErrors.password_confirmation}
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Reset password
            </Button>
          </form>

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
