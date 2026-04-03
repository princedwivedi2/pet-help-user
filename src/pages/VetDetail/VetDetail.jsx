import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import vetService from '../../services/vetService';
import appointmentService from '../../services/appointmentService';
import petService from '../../services/petService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../hooks/useAuth';
import { apiObject, apiList } from '../../utils/helpers';
import { APPOINTMENT_TYPES } from '../../utils/constants';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Loader from '../../components/common/Loader/Loader';
import Modal from '../../components/common/Modal/Modal';
import FormInput from '../../components/common/FormInput/FormInput';
import styles from './VetDetail.module.css';

export default function VetDetail() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { loading, execute } = useApi(vetService.getOne);
  const [vet, setVet] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [pets, setPets] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookForm, setBookForm] = useState({ pet_id: '', appointment_date: '', time_slot: '', reason: '', appointment_type: 'clinic_visit', home_address: '' });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [payModal, setPayModal] = useState({ open: false, uuid: null, amount: 0 });
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await execute(uuid);
        setVet(apiObject(raw, 'vet'));
      } catch (err) {
        console.error('Failed to load vet details:', err?.message);
      }
    };
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await reviewService.getForVet(uuid, { per_page: 10 });
        const list = res?.data?.reviews?.data || res?.data?.reviews || res?.data?.data || [];
        setReviews(Array.isArray(list) ? list : []);
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    load();
    loadReviews();
  }, [execute, uuid]);

  const openBooking = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setShowBooking(true);
    setBookError('');
    setBookSuccess('');
    try {
      const petRes = await petService.getAll();
      setPets(apiList(petRes?.data, 'pets'));
    } catch (err) {
      console.error('Failed to load pets:', err?.message);
    }
  };

  const fetchSlots = async (date) => {
    if (!date) return;
    try {
      const res = await appointmentService.getSlots(uuid, { date });
      setSlots(apiList(res?.data, 'slots'));
    } catch (err) {
      setSlots([]);
      console.error('Failed to load slots:', err?.message);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setBookForm({ ...bookForm, appointment_date: date, time_slot: '' });
    fetchSlots(date);
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    setBookError('');
    try {
      const scheduled_at = bookForm.appointment_date && bookForm.time_slot
        ? `${bookForm.appointment_date}T${bookForm.time_slot}:00`
        : '';
      const payload = {
        vet_uuid: uuid,
        scheduled_at,
        reason: bookForm.reason,
        appointment_type: bookForm.appointment_type || 'clinic_visit',
      };
      if (bookForm.pet_id) payload.pet_id = Number(bookForm.pet_id);
      if (bookForm.appointment_type === 'home_visit' && bookForm.home_address) {
        payload.home_address = bookForm.home_address;
      }
      const res = await appointmentService.store(payload);
      const apptUuid = res?.data?.appointment?.uuid || res?.data?.uuid;
      const fee = getCurrentFee();
      setBookSuccess('Appointment booked successfully!');
      if (apptUuid && fee > 0) {
        setTimeout(() => {
          setShowBooking(false);
          setBookSuccess('');
          setPayModal({ open: true, uuid: apptUuid, amount: fee });
        }, 1200);
      } else {
        setTimeout(() => { setShowBooking(false); setBookSuccess(''); }, 2000);
      }
    } catch (err) {
      setBookError(err?.message || 'Booking failed');
    } finally {
      setBookLoading(false);
    }
  };

  const getCurrentFee = () => {
    if (bookForm.appointment_type === 'home_visit') return Number(vet?.home_visit_fee || vet?.consultation_fee || 0);
    if (bookForm.appointment_type === 'online') return Number(vet?.online_fee || vet?.consultation_fee || 0);
    return Number(vet?.consultation_fee || 0);
  };

  const consultationTypes = Array.isArray(vet?.consultation_types)
    ? vet.consultation_types.filter(Boolean)
    : [];
  const availableConsultationTypes = consultationTypes.length > 0 ? consultationTypes : ['clinic_visit'];

  if (loading) return <Loader center />;
  if (!vet) return <div className={styles.notFound}>Vet not found</div>;

  const services = Array.isArray(vet.services) ? vet.services : [];
  const species = Array.isArray(vet.accepted_species) ? vet.accepted_species : [];

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <Icon name="arrowLeft" size={16} />
        <span>Back</span>
      </button>

      <div className={styles.top}>
        <div className={styles.avatar}>
          <Icon name="vets" size={28} />
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{vet.vet_name || vet.clinic_name || 'Vet'}</h1>
          <p className={styles.spec}>{vet.clinic_name || ''}</p>
          <div className={styles.badges}>
            {vet.is_verified && <Badge variant="success">Verified</Badge>}
            {vet.is_emergency_available && <Badge variant="danger">Emergency Available</Badge>}
            {vet.is_24_hours && <Badge variant="info">24 Hours</Badge>}
            {vet.distance_km != null && (
              <Badge>📍 {Number(vet.distance_km).toFixed(1)} km</Badge>
            )}
          </div>
        </div>
        <Button onClick={openBooking}>Book appointment</Button>
      </div>

      <div className={styles.grid}>
        <Card>
          <h3 className={styles.cardTitle}>Details</h3>
          <div className={styles.detailList}>
            {vet.license_number && <div className={styles.detailItem}><span className={styles.detailLabel}>License</span><span>{vet.license_number}</span></div>}
            {vet.years_of_experience && <div className={styles.detailItem}><span className={styles.detailLabel}>Experience</span><span>{vet.years_of_experience} years</span></div>}
            {vet.phone && <div className={styles.detailItem}><span className={styles.detailLabel}>Phone</span><span>{vet.phone}</span></div>}
            {vet.email && <div className={styles.detailItem}><span className={styles.detailLabel}>Email</span><span>{vet.email}</span></div>}
            {services.length > 0 && <div className={styles.detailItem}><span className={styles.detailLabel}>Services</span><span>{services.join(', ')}</span></div>}
            {species.length > 0 && <div className={styles.detailItem}><span className={styles.detailLabel}>Accepted Species</span><span>{species.join(', ')}</span></div>}
            {availableConsultationTypes.length > 0 && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Consultation Types</span>
                <span>{availableConsultationTypes.map(t => APPOINTMENT_TYPES.find(at => at.value === t)?.label || t).join(', ')}</span>
              </div>
            )}
            {vet.consultation_fee != null && <div className={styles.detailItem}><span className={styles.detailLabel}>Clinic Fee</span><span>₹{Number(vet.consultation_fee).toLocaleString('en-IN')}</span></div>}
            {vet.home_visit_fee != null && Number(vet.home_visit_fee) > 0 && <div className={styles.detailItem}><span className={styles.detailLabel}>Home Visit Fee</span><span>₹{Number(vet.home_visit_fee).toLocaleString('en-IN')}</span></div>}
            {vet.online_fee != null && Number(vet.online_fee) > 0 && <div className={styles.detailItem}><span className={styles.detailLabel}>Online Fee</span><span>₹{Number(vet.online_fee).toLocaleString('en-IN')}</span></div>}
          </div>
        </Card>

        {vet.qualifications && (
          <Card>
            <h3 className={styles.cardTitle}>Qualifications</h3>
            <p className={styles.bio}>{vet.qualifications}</p>
          </Card>
        )}

        {vet.address && (
          <Card>
            <h3 className={styles.cardTitle}>Location</h3>
            <p className={styles.bio}>{vet.address}{vet.state ? `, ${vet.state}` : ''}{vet.postal_code ? ` - ${vet.postal_code}` : ''}</p>
          </Card>
        )}
      </div>

      <Card>
        <h3 className={styles.cardTitle}>Reviews</h3>
        {reviewsLoading ? (
          <p style={{ fontSize: 13, color: '#6b7280' }}>Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6b7280' }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.uuid || r.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name || 'User'}</span>
                  <span style={{ fontSize: 12, color: '#f59e0b' }}>{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
                </div>
                {r.review && <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>{r.review}</p>}
                {r.reply && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7280', paddingLeft: 10, borderLeft: '2px solid #e5e7eb' }}>
                    <strong>Vet:</strong> {r.reply}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showBooking} onClose={() => setShowBooking(false)} title="Book Appointment">
        {bookSuccess ? (
          <div className={styles.success}>{bookSuccess}</div>
        ) : (
          <form onSubmit={handleBook}>
            {bookError && <div className={styles.error}>{bookError}</div>}
            <FormInput label="Consultation Type" as="select" value={bookForm.appointment_type} onChange={(e) => setBookForm({ ...bookForm, appointment_type: e.target.value })} required>
              {availableConsultationTypes.map((t) => {
                const at = APPOINTMENT_TYPES.find(a => a.value === t);
                return <option key={t} value={t}>{at?.label || t}</option>;
              })}
            </FormInput>
            {bookForm.appointment_type === 'home_visit' && (
              <FormInput
                label="Home Address"
                value={bookForm.home_address}
                onChange={(e) => setBookForm({ ...bookForm, home_address: e.target.value })}
                placeholder="Enter your full address for home visit"
                required
              />
            )}
            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 14 }}>
              <strong>Fee:</strong> ₹{getCurrentFee().toLocaleString('en-IN')}
              {bookForm.appointment_type === 'home_visit' && <span style={{ color: '#6b7280', marginLeft: 8 }}>(Home visit rate)</span>}
              {bookForm.appointment_type === 'online' && <span style={{ color: '#6b7280', marginLeft: 8 }}>(Online rate)</span>}
            </div>
            <FormInput label="Pet (optional)" as="select" value={bookForm.pet_id} onChange={(e) => setBookForm({ ...bookForm, pet_id: e.target.value })}>
              <option value="">Select a pet</option>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </FormInput>
            <FormInput label="Date" type="date" value={bookForm.appointment_date} onChange={handleDateChange} required min={new Date().toISOString().split('T')[0]} />
            {slots.length > 0 && (
              <FormInput label="Time Slot" as="select" value={bookForm.time_slot} onChange={(e) => setBookForm({ ...bookForm, time_slot: e.target.value })} required>
                <option value="">Select a slot</option>
                {slots.map((s, i) => <option key={i} value={typeof s === 'string' ? s : s.slot}>{typeof s === 'string' ? s : s.slot}</option>)}
              </FormInput>
            )}
            <FormInput label="Reason" as="textarea" value={bookForm.reason} onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })} placeholder="Describe the reason for visit (min 5 chars)..." required />
            {slots.length > 0 && !bookForm.time_slot && (
              <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>Please select a time slot to continue.</p>
            )}
            <Button type="submit" fullWidth loading={bookLoading} disabled={slots.length > 0 && !bookForm.time_slot}>Confirm booking</Button>
           </form>
        )}
      </Modal>

      <PaymentModal
        open={payModal.open}
        onClose={() => setPayModal({ open: false, uuid: null, amount: 0 })}
        payableType="appointment"
        payableUuid={payModal.uuid}
        amount={payModal.amount}
        vetName={vet?.vet_name || vet?.clinic_name}
        onSuccess={() => setPayModal({ open: false, uuid: null, amount: 0 })}
      />
    </div>
  );
}
