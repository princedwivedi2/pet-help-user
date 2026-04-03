import { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import petService from '../../services/petService';
import { apiList, formatDate } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Modal from '../../components/common/Modal/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import FormInput from '../../components/common/FormInput/FormInput';
import Badge from '../../components/common/Badge/Badge';
import styles from './Pets.module.css';

const SPECIES_OPTIONS = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'];
const emptyForm = { name: '', species: 'dog', breed: '', birth_date: '', weight_kg: '', photo_url: '', medical_notes: '' };

export default function Pets() {
  const { loading, execute } = useApi(petService.getAll);
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const raw = await execute();
      setPets(apiList(raw, 'pets'));
    } catch (err) {
      setError(err?.message || 'Failed to load pets');
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setPhotoFile(null); setError(''); setShowForm(true); };
  const openEdit = (pet) => {
    setEditing(pet);
    setForm({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      birth_date: pet.birth_date || '',
      weight_kg: pet.weight_kg || '',
      photo_url: pet.photo_url || '',
      medical_notes: pet.medical_notes || '',
    });
    setPhotoFile(null);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('species', form.species);
      if (form.breed) payload.append('breed', form.breed);
      if (form.birth_date) payload.append('birth_date', form.birth_date);
      if (form.weight_kg) payload.append('weight_kg', String(Number(form.weight_kg)));
      if (form.medical_notes) payload.append('medical_notes', form.medical_notes);
      if (photoFile) payload.append('photo', photoFile);

      if (editing) await petService.update(editing.id, payload);
      else await petService.create(payload);
      setShowForm(false);
      setPhotoFile(null);
      load();
    } catch (err) {
      setError(err?.message || 'Failed to save pet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await petService.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err?.message || 'Failed to delete pet');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && pets.length === 0) return <Loader center />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Pets</h1>
          <p className={styles.subtitle}>Manage your pet profiles</p>
        </div>
        <Button onClick={openAdd}>
          <Icon name="plus" size={16} />
          Add Pet
        </Button>
      </div>

      {pets.length === 0 ? (
        <EmptyState title="No pets yet" message="Add your first pet to get started." />
      ) : (
        <div className={styles.grid}>
          {pets.map((pet) => (
            <Card key={pet.id}>
              <div className={styles.petCard}>
                <div className={styles.petTop}>
                  <div className={styles.petAvatar}>
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <Icon name="pets" size={22} />
                    )}
                  </div>
                  <div className={styles.petInfo}>
                    <h3 className={styles.petName}>{pet.name}</h3>
                    <p className={styles.petMeta}>{pet.species}{pet.breed ? ` - ${pet.breed}` : ''}</p>
                  </div>
                  <Badge>{pet.species}</Badge>
                </div>
                <div className={styles.petDetails}>
                  {pet.birth_date && <span className={styles.petDetail}>Born: {formatDate(pet.birth_date)}</span>}
                  {pet.weight_kg && <span className={styles.petDetail}>Weight: {pet.weight_kg} kg</span>}
                </div>
                {pet.medical_notes && (
                  <p className={styles.petNotes}>{pet.medical_notes}</p>
                )}
                <div className={styles.petActions}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(pet)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(pet)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Pet' : 'Add Pet'}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <FormInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <FormInput label="Species" as="select" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
            {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </FormInput>
          <FormInput label="Breed" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Labrador" />
          <FormInput label="Birth Date" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          <FormInput label="Weight (kg)" type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
          <FormInput
            label="Photo"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
          {editing?.photo_url && !photoFile && (
            <p className={styles.petDetail} style={{ marginBottom: 12 }}>Current photo will be kept unless you upload a new one.</p>
          )}
          <FormInput label="Medical Notes" as="textarea" value={form.medical_notes} onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} placeholder="Any medical conditions or notes..." />
          <Button type="submit" fullWidth loading={saving}>{editing ? 'Update Pet' : 'Add Pet'}</Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Pet"
        message={`Are you sure you want to remove ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
