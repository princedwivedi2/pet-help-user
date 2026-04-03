import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../../components/common/FormInput/FormInput';
import Button from '../../components/common/Button/Button';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left panel — illustration (desktop only) */}
      <div className={styles.illustrationPanel}>
        <div className={styles.illustrationContent}>
          <svg className={styles.illustration} viewBox="0 0 400 320" fill="none">
            <ellipse cx="200" cy="290" rx="160" ry="18" fill="#f97316" opacity="0.08"/>
            <path d="M120 240c0-44 36-80 80-80s80 36 80 80" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.2"/>
            <circle cx="200" cy="160" r="55" fill="#fff7ed" stroke="#f97316" strokeWidth="2.5"/>
            <path d="M185 148c-3-12-18-16-22-4s6 20 14 16" fill="#f97316" opacity="0.7"/>
            <path d="M215 148c3-12 18-16 22-4s-6 20-14 16" fill="#f97316" opacity="0.7"/>
            <circle cx="188" cy="168" r="4" fill="#1c1917"/>
            <circle cx="212" cy="168" r="4" fill="#1c1917"/>
            <ellipse cx="200" cy="178" rx="5" ry="3.5" fill="#1c1917"/>
            <path d="M194 182c3 4 9 4 12 0" stroke="#1c1917" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M130 250c10-5 20 5 30 0s20 5 30 0 20 5 30 0 20 5 30 0" stroke="#f97316" strokeWidth="2" opacity="0.15" fill="none"/>
            <circle cx="100" cy="120" r="8" fill="#8b5cf6" opacity="0.15"/>
            <circle cx="310" cy="100" r="12" fill="#f97316" opacity="0.1"/>
            <circle cx="85" cy="200" r="5" fill="#f97316" opacity="0.1"/>
            <path d="M290 180l8 6-3 10-10 0-3-10z" fill="#8b5cf6" opacity="0.12"/>
          </svg>
          <h2 className={styles.illustrationTitle}>Welcome to PetSathi</h2>
          <p className={styles.illustrationDesc}>
            Your pet's health companion. Book appointments, track health records, and connect with trusted vets.
          </p>
          <div className={styles.trustBadges}>
            <div className={styles.badge}><span className={styles.badgeNum}>10K+</span> Pet Parents</div>
            <div className={styles.badge}><span className={styles.badgeNum}>500+</span> Vets</div>
            <div className={styles.badge}><span className={styles.badgeNum}>4.8</span> Rating</div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
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
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Log in to your account</p>
          </div>

          {resetSuccess && (
            <div className={styles.success}>Password reset successfully. Log in with your new password.</div>
          )}
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
              required
            />
            <FormInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Log in
            </Button>
          </form>

          <p className={styles.forgotRow}>
            <Link to="/forgot-password" className={styles.link}>Forgot password?</Link>
          </p>
          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>Sign up</Link>
          </p>
          <p className={styles.vetFooter}>
            <Link to="/vet/apply" className={styles.link}>Join as Vet</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
