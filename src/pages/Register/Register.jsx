import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../../components/common/FormInput/FormInput';
import Button from '../../components/common/Button/Button';
import styles from './Register.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/home');
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      setError(err.response?.data?.message || err.message || 'Registration failed');
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
            <ellipse cx="200" cy="290" rx="160" ry="18" fill="#8b5cf6" opacity="0.08"/>
            <rect x="130" y="100" width="140" height="170" rx="20" fill="#fff7ed" stroke="#f97316" strokeWidth="2"/>
            <circle cx="200" cy="155" r="30" fill="#fef3c7" stroke="#f97316" strokeWidth="2"/>
            <path d="M188 148c-2-8-12-10-14-3s4 13 9 10" fill="#f97316" opacity="0.6"/>
            <path d="M212 148c2-8 12-10 14-3s-4 13-9 10" fill="#f97316" opacity="0.6"/>
            <circle cx="193" cy="158" r="3" fill="#1c1917"/>
            <circle cx="207" cy="158" r="3" fill="#1c1917"/>
            <ellipse cx="200" cy="165" rx="3.5" ry="2.5" fill="#1c1917"/>
            <path d="M155 200h90M155 220h70M155 240h50" stroke="#f97316" strokeWidth="2" opacity="0.2" strokeLinecap="round"/>
            <path d="M280 140l15 25-15 25" stroke="#8b5cf6" strokeWidth="2" opacity="0.3" fill="none" strokeLinecap="round"/>
            <path d="M120 140l-15 25 15 25" stroke="#8b5cf6" strokeWidth="2" opacity="0.3" fill="none" strokeLinecap="round"/>
            <circle cx="90" cy="110" r="6" fill="#f97316" opacity="0.12"/>
            <circle cx="320" cy="200" r="8" fill="#8b5cf6" opacity="0.12"/>
            <circle cx="300" cy="120" r="4" fill="#f97316" opacity="0.1"/>
          </svg>
          <h2 className={styles.illustrationTitle}>Join the Pet Family</h2>
          <p className={styles.illustrationDesc}>
            Create your free account and get access to trusted vets, emergency guides, and a vibrant pet community.
          </p>
          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span> Free to use forever
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span> Verified veterinarians
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureCheck}>✓</span> 24/7 emergency SOS
            </div>
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
            <h1 className={styles.title}>Create an account</h1>
            <p className={styles.subtitle}>Join PetSathi today</p>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <FormInput
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name?.[0]}
              placeholder="John Doe"
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email?.[0]}
              placeholder="name@example.com"
              required
            />
            <FormInput
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone?.[0]}
              placeholder="+91 98765 43210"
              required
            />
            <FormInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password?.[0]}
              placeholder="Min. 8 characters"
              required
            />
            <FormInput
              label="Confirm Password"
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              placeholder="Re-enter your password"
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Create account
            </Button>
          </form>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
