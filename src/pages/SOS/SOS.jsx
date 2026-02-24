import { useState, useEffect } from 'react';
import sosService from '../../services/sosService';
import petService from '../../services/petService';
import { apiList, apiObject } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import FormInput from '../../components/common/FormInput/FormInput';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Icon from '../../components/common/Icon/Icon';
import styles from './SOS.module.css';

const EMERGENCY_TYPES = ['injury', 'illness', 'poisoning', 'accident', 'breathing', 'seizure', 'other'];

export default function SOS() {
  const [pets, setPets] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ pet_id: '', description: '', latitude: '', longitude: '', address: '', emergency_type: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm((f) => ({ ...f, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() })),
        () => {}
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
      setError(err.response?.data?.message || 'Failed to send SOS');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (uuid) => {
    try {
      await sosService.updateStatus(uuid, { status: 'cancelled', resolution_notes: 'Cancelled by user' });
      load();
    } catch (_) {}
  };

  const handleComplete = async (uuid) => {
    try {
      await sosService.updateStatus(uuid, { status: 'completed', resolution_notes: 'Resolved' });
      load();
    } catch (_) {}
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
                <Button type="submit" variant="danger" fullWidth loading={sending} disabled={!form.latitude}>
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
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
