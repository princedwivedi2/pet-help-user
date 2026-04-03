import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import BottomTabs from './BottomTabs/BottomTabs';
import PageTransition from '../common/PageTransition/PageTransition';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import styles from './Layout.module.css';

function EmailVerificationBanner() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerification();
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.verifyBanner}>
      <span>Please verify your email address to access all features.</span>
      {sent ? (
        <span className={styles.verifyBannerSent}>Email sent!</span>
      ) : (
        <button className={styles.verifyBannerBtn} onClick={handleResend} disabled={sending}>
          {sending ? 'Sending…' : 'Resend verification email'}
        </button>
      )}
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const showVerifyBanner = user && !user.email_verified_at;

  return (
    <div className={styles.layout}>
      <Navbar />
      {showVerifyBanner && <EmailVerificationBanner />}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomTabs />
    </div>
  );
}
