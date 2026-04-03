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
import Skeleton from '../../components/common/Skeleton/Skeleton';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import visitRecordService from '../../services/visitRecordService';
import { PAYMENT_STATUS } from '../../utils/constants';
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
  const [cancelError, setCancelError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [payTarget, setPayTarget] = useState(null);
  const [visitRecordTarget, setVisitRecordTarget] = useState(null);
  const [visitRecord, setVisitRecord] = useState(null);
  const [visitRecordLoading, setVisitRecordLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError('');
      const params = { page, per_page: 10 };
      if (tab !== 'all') params.status = tab;
      const raw = await execute(params);
      setAppointments(apiList(raw, 'appointments'));
      setMeta(apiPagination(raw));
    } catch (err) {
      setLoadError(err?.message || 'Failed to load appointments');
    }
  }, [execute, tab, page]);

  useEffect(() => { load(); }, [load]);

  const handleTabChange = (key) => { setTab(key); setPage(1); };

  const openVisitRecord = async (appt) => {
    setVisitRecordTarget(appt);
    setVisitRecord(null);
    setVisitRecordLoading(true);
    try {
      const res = await visitRecordService.getForAppointment(appt.uuid);
      setVisitRecord(res?.data?.visit_record || res?.data || null);
    } catch {
      setVisitRecord(null);
    } finally {
      setVisitRecordLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError('');
    try {
      await appointmentService.cancel(cancelTarget.uuid, {
        reason: cancelReason || 'Cancelled by user',
      });
      setCancelTarget(null);
      setCancelReason('');
      load();
    } catch (err) {
      setCancelError(err?.message || 'Failed to cancel appointment');
    } finally {
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

      {loadError && <div className={styles.error}>{loadError}</div>}

      <Tabs tabs={TABS} active={tab} onChange={handleTabChange} />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '18px 20px', border: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton variant="line" width="55%" height="15px" />
                  <Skeleton variant="line" width="35%" height="12px" />
                  <Skeleton variant="line" width="45%" height="12px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <Skeleton variant="rect" width="72px" height="22px" style={{ borderRadius: 99 }} />
                  <Skeleton variant="rect" width="56px" height="28px" style={{ borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
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
                    {appt.payment_status && (
                      <Badge variant={PAYMENT_STATUS[appt.payment_status]?.variant || 'default'} size="sm">
                        {PAYMENT_STATUS[appt.payment_status]?.label || appt.payment_status}
                      </Badge>
                    )}
                    {appt.appointment_type && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{appt.appointment_type.replace(/_/g, ' ')}</span>
                    )}
                    {(appt.status === 'confirmed' || appt.status === 'accepted') && appt.payment_status !== 'paid' && (
                      <Button size="sm" onClick={() => setPayTarget(appt)}>Pay Now</Button>
                    )}
                    {appt.status === 'completed' && (
                      <Button size="sm" variant="ghost" onClick={() => openVisitRecord(appt)}>View Record</Button>
                    )}
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

      <Modal open={!!cancelTarget} onClose={() => { setCancelTarget(null); setCancelError(''); }} title="Cancel Appointment">
        <p style={{ marginBottom: 12 }}>Are you sure you want to cancel this appointment?</p>
        <FormInput
          label="Reason for cancellation"
          as="textarea"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Why are you cancelling?"
        />
        {cancelError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{cancelError}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="ghost" onClick={() => { setCancelTarget(null); setCancelError(''); }}>Keep</Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelling}>Yes, Cancel</Button>
        </div>
      </Modal>

      <Modal open={!!visitRecordTarget} onClose={() => setVisitRecordTarget(null)} title="Visit Record">
        {visitRecordLoading ? (
          <Loader center />
        ) : visitRecord ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Diagnosis', visitRecord.diagnosis],
              ['Treatment', visitRecord.treatment],
              ['Prescription', visitRecord.prescription_text],
              ['Notes', visitRecord.notes],
            ].map(([label, value]) => value ? (
              <div key={label}>
                <strong style={{ fontSize: 13, color: '#374151' }}>{label}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4b5563' }}>{value}</p>
              </div>
            ) : null)}
            {visitRecord.prescription_file && (
              <a href={visitRecord.prescription_file} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>View prescription file</a>
            )}
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: 14 }}>No visit record has been added for this appointment yet.</p>
        )}
      </Modal>

      <PaymentModal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        payableType="appointment"
        payableUuid={payTarget?.uuid}
        amount={payTarget?.fee || payTarget?.consultation_fee || 500}
        vetName={payTarget?.vet_profile?.clinic_name || payTarget?.vet_profile?.vet_name}
        onSuccess={() => { setPayTarget(null); load(); }}
      />
    </div>
  );
}
