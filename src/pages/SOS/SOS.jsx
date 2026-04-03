import { useState, useEffect } from 'react';
import sosService from '../../services/sosService';
import reviewService from '../../services/reviewService';
import petService from '../../services/petService';
import { apiList, apiObject } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import FormInput from '../../components/common/FormInput/FormInput';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Modal from '../../components/common/Modal/Modal';
import Icon from '../../components/common/Icon/Icon';
import styles from './SOS.module.css';
const EMERGENCY_TYPES = ['injury', 'illness', 'poisoning', 'accident', 'breathing', 'seizure', 'other'];

const FIRST_AID_TIPS = {
  injury: ['Apply gentle pressure with a clean cloth to stop bleeding.', 'Do not try to remove embedded objects.', 'Keep the pet calm and restrict movement.'],
  illness: ['Keep the pet comfortable and warm.', 'Note any symptoms (vomiting, diarrhea, lethargy).', 'Do not give human medications.'],
  poisoning: ['Do NOT induce vomiting unless advised by a vet.', 'Try to identify what was ingested and the quantity.', 'Keep the packaging or substance sample if possible.'],
  accident: ['Do not move the pet if you suspect spinal injury.', 'Stabilize any visible fractures with a makeshift splint.', 'Keep the pet warm to prevent shock.'],
  breathing: ['Keep the airway clear — gently remove visible obstructions.', 'Position the pet on their side with neck extended.', 'Do not restrict the chest area.'],
  seizure: ['Do not restrain the pet during a seizure.', 'Remove nearby objects that could cause injury.', 'Time the seizure — note duration for the vet.'],
  other: ['Keep the pet calm and in a safe space.', 'Note all symptoms and when they started.', 'Have your pet\'s medical records ready if available.'],
};

export default function SOS() {
  const [pets, setPets] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ pet_id: '', description: '', latitude: '', longitude: '', address: '', emergency_type: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationDenied, setLocationDenied] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSosUuid, setReviewSosUuid] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [petRes, sosRes] = await Promise.allSettled([petService.getAll(), sosService.getActive()]);
      if (petRes.status === 'fulfilled') {
        setPets(apiList(petRes.value?.data, 'pets'));
      }
      if (sosRes.status === 'fulfilled') {
        const sos = apiObject(sosRes.value?.data, 'sos');
        setActive(sos && sos.uuid ? sos : null);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load SOS data');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
          setLocationDenied(false);
        },
        () => setLocationDenied(true)
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        description: form.description,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (form.pet_id) payload.pet_id = Number(form.pet_id);
      if (form.address) payload.address = form.address;
      if (form.emergency_type) payload.emergency_type = form.emergency_type;
      await sosService.store(payload);
      setSuccess('SOS alert sent! Nearby vets have been notified.');
      setForm({ ...form, pet_id: '', description: '', address: '', emergency_type: '' });
      load();
    } catch (err) {
      setError(err?.message || 'Failed to send SOS');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (uuid) => {
    try {
      await sosService.updateStatus(uuid, { status: 'sos_cancelled', resolution_notes: 'Cancelled by user' });
      load();
    } catch (err) {
      setError(err?.message || 'Failed to cancel SOS request');
    }
  };

  const handleComplete = async (uuid) => {
    try {
      await sosService.updateStatus(uuid, { status: 'sos_completed', resolution_notes: 'Resolved' });
      setReviewSosUuid(uuid);
      setReviewForm({ rating: 5, comment: '' });
      setShowReview(true);
      load();
    } catch (err) {
      setError(err?.message || 'Failed to complete SOS request');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      setSubmittingReview(true);
      setError('');
      await reviewService.store({
        sos_uuid: reviewSosUuid,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setShowReview(false);
      setReviewSosUuid(null);
      setSuccess('Review submitted. Thank you!');
    } catch (err) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader center />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Emergency SOS</h1>
        <p className={styles.subtitle}>Send an emergency alert to nearby veterinarians.</p>
      </div>

      <div className={styles.grid}>
        <div>
          <Card>
            <h2 className={styles.cardTitle}>
              <Icon name="sos" size={18} />
              Send SOS Alert
            </h2>

            {success && <div className={styles.success}>{success}</div>}
            {error && <div className={styles.error}>{error}</div>}

            {active ? (
              <div style={{ padding: '12px 0', color: '#e53935', fontWeight: 500 }}>
                You already have an active SOS alert. Please resolve or cancel it before sending a new one.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormInput label="Pet (optional)" as="select" value={form.pet_id} onChange={(e) => setForm({ ...form, pet_id: e.target.value })}>
                  <option value="">Select your pet</option>
                  {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </FormInput>
                <FormInput label="Emergency Type" as="select" value={form.emergency_type} onChange={(e) => setForm({ ...form, emergency_type: e.target.value })}>
                  <option value="">Select type</option>
                  {EMERGENCY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </FormInput>
                <FormInput
                  label="Description"
                  as="textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the emergency (min 10 characters)..."
                  required
                />
                <FormInput
                  label="Address (optional)"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Your current address"
                />
                <div className={styles.locationNote}>
                  <Icon name="location" size={14} />
                  {form.latitude ? 'Location detected' : 'Location not available — please enable location'}
                </div>
                {locationDenied && !form.latitude && (
                  <p className={styles.locationError}>
                    Location required — please enable GPS or enter coordinates manually
                  </p>
                )}
                <Button type="submit" variant="danger" fullWidth loading={sending} disabled={!form.latitude || (locationDenied && !form.latitude)}>
                  Send SOS Alert
                </Button>
              </form>
            )}
          </Card>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>Active Alert</h2>
          {!active ? (
            <EmptyState title="No active alerts" message="You have no active emergency alerts." />
          ) : (
            <Card>
              <div className={styles.alertRow}>
                <div>
                  <div className={styles.alertPet}>{active.pet?.name || 'Pet'}</div>
                  <div className={styles.alertDesc}>{active.description}</div>
                  {active.emergency_type && <Badge variant="warning">{active.emergency_type}</Badge>}
                  <Badge variant="danger">{active.status || 'Active'}</Badge>
                  {active.vet?.vet_name && <div style={{ marginTop: 8, fontSize: 14, color: '#16a34a', fontWeight: 500 }}>Vet: {active.vet.vet_name}</div>}
                  {active.response_type && <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>Response: {active.response_type.replace(/_/g, ' ')}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  <Button size="sm" variant="ghost" onClick={() => handleComplete(active.uuid)}>
                    Mark Resolved
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleCancel(active.uuid)}>
                    Cancel
                  </Button>
                </div>
              </div>
              {active.emergency_type && FIRST_AID_TIPS[active.emergency_type] && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#c2410c' }}>First Aid Tips</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#9a3412', lineHeight: 1.7 }}>
                    {FIRST_AID_TIPS[active.emergency_type].map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal open={showReview} onClose={() => setShowReview(false)} title="Rate the Vet">
        <p style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>How was the emergency assistance? Leave a review for the vet.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 4 }}>Rating</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: star <= reviewForm.rating ? '#f59e0b' : '#d1d5db' }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <FormInput
            label="Comment (optional)"
            as="textarea"
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            placeholder="Share your experience..."
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowReview(false)}>Skip</Button>
            <Button onClick={handleReviewSubmit} loading={submittingReview}>Submit Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
