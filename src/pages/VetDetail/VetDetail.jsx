import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import vetService from '../../services/vetService';
import appointmentService from '../../services/appointmentService';
import petService from '../../services/petService';
import { useAuth } from '../../hooks/useAuth';
import { apiObject, apiList } from '../../utils/helpers';
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
  const [bookForm, setBookForm] = useState({ pet_id: '', appointment_date: '', time_slot: '', reason: '' });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await execute(uuid);
        setVet(apiObject(raw, 'vet'));
      } catch (err) {
        console.error('Failed to load vet details:', err?.message);
      }
    };
    load();
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
      };
      if (bookForm.pet_id) payload.pet_id = Number(bookForm.pet_id);
      await appointmentService.store(payload);
      setBookSuccess('Appointment booked successfully!');
      setTimeout(() => { setShowBooking(false); setBookSuccess(''); }, 2000);
    } catch (err) {
      setBookError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookLoading(false);
    }
  };

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

      <Modal open={showBooking} onClose={() => setShowBooking(false)} title="Book Appointment">
        {bookSuccess ? (
          <div className={styles.success}>{bookSuccess}</div>
        ) : (
          <form onSubmit={handleBook}>
            {bookError && <div className={styles.error}>{bookError}</div>}
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
            <Button type="submit" fullWidth loading={bookLoading}>Confirm booking</Button>
           </form>
        )}
      </Modal>
    </div>
  );
}
