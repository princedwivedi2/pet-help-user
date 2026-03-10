import { useParams, Link } from 'react-router-dom';
import styles from './Legal.module.css';

const pages = {
  'terms': {
    title: 'Terms & Conditions',
    content: `
## 1. Acceptance of Terms
By accessing or using PetSathi ("the Platform"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Platform.

## 2. Platform Services
PetSathi is a pet healthcare platform connecting pet owners with licensed veterinarians. Services include:
- Online consultations, clinic visits, and home visits
- Emergency SOS requests for urgent pet care
- Appointment booking and management
- Pet health records and visit history

## 3. User Accounts
- You must provide accurate, current information during registration.
- You are responsible for maintaining the confidentiality of your account credentials.
- One account per person; sharing accounts is prohibited.

## 4. Veterinary Services
- PetSathi does not provide veterinary services directly. All medical advice comes from licensed veterinarians on the platform.
- We verify veterinarian credentials but do not guarantee outcomes.
- In case of emergency, always contact your nearest emergency veterinary clinic.

## 5. Payments & Refunds
- All payments are processed securely via Razorpay.
- Refunds for cancelled appointments follow our cancellation policy.
- Platform fees are non-refundable once services are rendered.
- All prices are in Indian Rupees (INR).

## 6. Cancellation Policy
- Free cancellation up to 2 hours before scheduled appointment.
- Late cancellations may incur a fee up to 50% of the consultation charge.
- No-shows will be charged the full consultation fee.

## 7. User Conduct
Users must not:
- Provide false information
- Harass or abuse veterinarians or other users
- Use the platform for non-pet-related purposes
- Attempt to circumvent platform fees

## 8. Limitation of Liability
PetSathi is not liable for:
- Veterinary treatment outcomes
- Loss or damage to property during home visits
- Service interruptions beyond our control

## 9. Changes to Terms
We reserve the right to modify these terms at any time. Continued use constitutes acceptance.

## 10. Contact
For questions about these terms, contact us at support@petsathi.in
    `,
  },
  'privacy': {
    title: 'Privacy Policy',
    content: `
## 1. Information We Collect
- **Personal Information**: Name, email, phone number, address
- **Pet Information**: Pet profiles, medical history, photos
- **Location Data**: GPS coordinates for vet search and home visits
- **Payment Data**: Transaction records (processed by Razorpay; we do not store card details)
- **Usage Data**: App interactions, device information

## 2. How We Use Your Information
- Provide and improve our services
- Connect you with nearby veterinarians
- Process payments and send receipts
- Send notifications about appointments and SOS updates
- Improve platform safety and security

## 3. Information Sharing
We share data only with:
- Veterinarians you choose to consult with
- Payment processors (Razorpay)
- Law enforcement when required by law
- We never sell your personal data to third parties

## 4. Data Security
- All data transmitted via HTTPS/TLS encryption
- Passwords are hashed and never stored in plaintext
- Regular security audits and vulnerability assessments
- Access controls and audit logging

## 5. Data Retention
- Account data: Retained while your account is active
- Medical records: Retained for 5 years per regulatory requirements
- Payment records: Retained for 7 years per tax regulations
- You can request data deletion by contacting support

## 6. Your Rights
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Opt out of marketing communications
- Export your data in a portable format

## 7. Cookies & Tracking
- We use essential cookies for authentication
- Analytics cookies to improve service (can be opted out)
- No third-party advertising trackers

## 8. Contact
Privacy concerns: privacy@petsathi.in
    `,
  },
  'refund': {
    title: 'Refund & Cancellation Policy',
    content: `
## 1. Appointment Cancellations

### By Pet Owner
- **Free cancellation**: Up to 2 hours before the scheduled time
- **Late cancellation** (< 2 hours): 50% of consultation fee may be charged
- **No-show**: Full consultation fee is charged

### By Veterinarian
- Full refund if vet cancels the appointment
- Platform will assist in rebooking with another available vet

## 2. Refund Processing
- Refunds are processed within 5-7 business days
- Refund will be credited to the original payment method
- Platform processing fees are non-refundable

## 3. Emergency SOS Refunds
- SOS charges are non-refundable once a vet has been dispatched
- If no vet responds and the request expires, no charge is applied
- Partial refunds may be considered on a case-by-case basis

## 4. Subscription Refunds
- Subscriptions can be cancelled anytime
- Prorated refunds for annual plans cancelled within 30 days
- Monthly subscriptions are non-refundable for the current period

## 5. Dispute Resolution
- Contact support@petsathi.in within 48 hours of the transaction
- Provide transaction ID and reason for dispute
- Resolution within 7 business days

## 6. Contact
Refund queries: billing@petsathi.in
    `,
  },
};

export default function Legal() {
  const { type } = useParams();
  const page = pages[type];

  if (!page) {
    return (
      <div className={styles.page}>
        <h1>Page Not Found</h1>
        <p>Available legal pages:</p>
        <ul>
          <li><Link to="/legal/terms">Terms & Conditions</Link></li>
          <li><Link to="/legal/privacy">Privacy Policy</Link></li>
          <li><Link to="/legal/refund">Refund & Cancellation Policy</Link></li>
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{page.title}</h1>
      <div className={styles.content}>
        {page.content.split('\n').map((line, i) => {
          if (line.startsWith('## ')) return <h2 key={i} className={styles.h2}>{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className={styles.h3}>{line.replace('### ', '')}</h3>;
          if (line.startsWith('- **')) {
            const parts = line.replace('- **', '').split('**:');
            return <p key={i} className={styles.listItem}><strong>{parts[0]}</strong>:{parts[1] || ''}</p>;
          }
          if (line.startsWith('- ')) return <p key={i} className={styles.listItem}>{line.replace('- ', '• ')}</p>;
          if (line.trim()) return <p key={i}>{line}</p>;
          return null;
        })}
      </div>
      <div className={styles.links}>
        {Object.entries(pages).filter(([k]) => k !== type).map(([key, p]) => (
          <Link key={key} to={`/legal/${key}`} className={styles.link}>{p.title}</Link>
        ))}
      </div>
    </div>
  );
}
