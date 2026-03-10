import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import paymentService from '../../services/paymentService';
import { apiList, apiPagination, formatDateTime } from '../../utils/helpers';
import { PAYMENT_STATUS } from '../../utils/constants';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Button from '../../components/common/Button/Button';
import styles from './Payments.module.css';

export default function Payments() {
  const { loading, execute } = useApi(paymentService.getAll);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    try {
      const raw = await execute({ page: p, per_page: 15 });
      setPayments(apiList(raw, 'payments'));
      setPagination(apiPagination(raw));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(page); }, [page]);

  if (loading && payments.length === 0) return <Loader center />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Payments</h1>
        <p className={styles.subtitle}>Payment history for your appointments and SOS requests</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" message="Your payment history will appear here." />
      ) : (
        <div className={styles.list}>
          {payments.map((payment) => {
            const status = PAYMENT_STATUS[payment.payment_status] || { label: payment.payment_status, variant: 'default' };
            return (
              <Card key={payment.uuid} className={styles.card}>
                <div className={styles.cardRow}>
                  <div className={styles.cardInfo}>
                    <div className={styles.amount}>₹{(payment.amount / 100).toFixed(2)}</div>
                    <div className={styles.meta}>
                      {payment.vet_profile?.clinic_name || payment.vet_profile?.vet_name || '—'}
                    </div>
                    <div className={styles.date}>{formatDateTime(payment.created_at)}</div>
                    <div className={styles.model}>
                      {payment.payment_model === 'platform_fee' ? 'Platform Fee' : 'Full Payment'}
                      {payment.payment_method === 'offline' && ' • Cash'}
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {payment.razorpay_payment_id && (
                      <div className={styles.txnId}>Txn: {payment.razorpay_payment_id}</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className={styles.pagination}>
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className={styles.pageInfo}>Page {pagination.current_page} of {pagination.last_page}</span>
          <Button size="sm" variant="outline" disabled={page >= pagination.last_page} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
