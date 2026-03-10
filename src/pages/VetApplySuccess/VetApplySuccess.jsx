import { Link } from 'react-router-dom';
import styles from './VetApplySuccess.module.css';

export default function VetApplySuccess() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className={styles.title}>Application Submitted</h1>

        <p className={styles.message}>
          Your veterinarian application has been received and is now under review.
          Our admin team will verify your credentials and documents.
        </p>

        <p className={styles.note}>
          You will be notified once your application is approved.
          After approval, you can log in using the vet portal.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.primaryLink}>Back to Home</Link>
          <Link to="/login" className={styles.secondaryLink}>Go to Login</Link>
        </div>
      </div>
    </div>
  );
}
