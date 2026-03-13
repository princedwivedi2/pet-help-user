import { useState } from 'react';
import paymentService from '../../services/paymentService';
import Modal from '../common/Modal/Modal';
import Button from '../common/Button/Button';
import Icon from '../common/Icon/Icon';
import styles from './PaymentModal.module.css';

export default function PaymentModal({ open, onClose, payableType, payableUuid, amount, vetName, description, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.createOrder({
        payable_type: payableType,
        payable_uuid: payableUuid,
        payment_model: 'platform_fee',
      });

      const orderData = res?.data || res;
      const orderId = orderData.razorpay_order_id || orderData.order_id;
      const paymentUuid = orderData.payment_uuid;
      const razorpayKey = orderData.razorpay_key || orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_placeholder';

      if (!window.Razorpay) {
        setError('Payment gateway not loaded. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: (amount || 500) * 100,
        currency: 'INR',
        name: 'PetSathi',
        description: description || `Payment to ${vetName || 'Vet'}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await paymentService.verify({
              payment_uuid: paymentUuid,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess(true);
            setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
          } catch (err) {
            setError(err?.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {},
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Complete Payment">
      <div className={styles.content}>
        {success ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✓</div>
            <h3>Payment Successful!</h3>
            <p>Your payment has been confirmed.</p>
          </div>
        ) : (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Service</span>
                <span>{description || (payableType === 'sos' ? 'Emergency Service' : 'Consultation')}</span>
              </div>
              {vetName && (
                <div className={styles.summaryRow}>
                  <span>Veterinarian</span>
                  <span>{vetName}</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className={styles.amount}>₹{Number(amount || 500).toLocaleString('en-IN')}</span>
              </div>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.actions}>
              <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button onClick={handlePay} loading={loading}>
                <Icon name="wallet" size={16} />
                Pay ₹{Number(amount || 500).toLocaleString('en-IN')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
