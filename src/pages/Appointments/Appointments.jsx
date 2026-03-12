import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import appointmentService from '../../services/appointmentService';
import { apiList, apiPagination, formatDateTime } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Tabs from '../../components/common/Tabs/Tabs';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Pagination from '../../components/common/Pagination/Pagination';
import Button from '../../components/common/Button/Button';
import Modal from '../../components/common/Modal/Modal';
import FormInput from '../../components/common/FormInput/FormInput';
import styles from './Appointments.module.css';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_VARIANT = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'danger',
  confirmed: 'success',
  in_progress: 'primary',
  completed: 'default',
  cancelled: 'danger',
  cancelled_by_user: 'danger',
  cancelled_by_vet: 'danger',
};

export default function Appointments() {
  const { loading, execute } = useApi(appointmentService.getAll);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1 });
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = { page, per_page: 10 };
      if (tab !== 'all') params.status = tab;
      const raw = await execute(params);
      setAppointments(apiList(raw, 'appointments'));
      setMeta(apiPagination(raw));
    } catch (_) {}
  }, [execute, tab, page]);

  useEffect(() => { load(); }, [load]);

  const handleTabChange = (key) => { setTab(key); setPage(1); };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await appointmentService.cancel(cancelTarget.uuid, {
        reason: cancelReason || 'Cancelled by user',
      });
      setCancelTarget(null);
      setCancelReason('');
      load();
    } catch (_) {} finally {
      setCancelling(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>View and manage your appointments</p>
        </div>
        <Link to="/find-vets">
          <Button>Book Appointment</Button>
        </Link>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={handleTabChange} />

      {loading ? (
        <Loader center />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments" message="You don't have any appointments in this category." />
      ) : (
        <>
          <div className={styles.list}>
            {appointments.map((appt) => (
              <Card key={appt.uuid || appt.id}>
                <div className={styles.apptRow}>
                  <div className={styles.apptMain}>
                    <h3 className={styles.apptVet}>{appt.vet_profile?.clinic_name || appt.vet_profile?.vet_name || 'Vet'}</h3>
                    <p className={styles.apptPet}>Pet: {appt.pet?.name || 'N/A'}</p>
                    <p className={styles.apptDate}>{formatDateTime(appt.scheduled_at)}</p>
                    {appt.reason && <p className={styles.apptReason}>{appt.reason}</p>}
                  </div>
                  <div className={styles.apptSide}>
                    <Badge variant={STATUS_VARIANT[appt.status] || 'default'}>{appt.status}</Badge>
                    {(appt.status === 'pending' || appt.status === 'accepted' || appt.status === 'confirmed') && (
                      <Button size="sm" variant="ghost" onClick={() => { setCancelTarget(appt); setCancelReason(''); }}>Cancel</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination page={page} totalPages={meta.last_page} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Appointment">
        <p style={{ marginBottom: 12 }}>Are you sure you want to cancel this appointment?</p>
        <FormInput
          label="Reason for cancellation"
          as="textarea"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Why are you cancelling?"
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep</Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelling}>Yes, Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
