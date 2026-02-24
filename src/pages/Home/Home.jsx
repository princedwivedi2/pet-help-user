import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import petService from '../../services/petService';
import appointmentService from '../../services/appointmentService';
import sosService from '../../services/sosService';
import { apiList, apiObject, formatDateTime } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Icon from '../../components/common/Icon/Icon';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './Home.module.css';

const QUICK_ACTIONS = [
  { to: '/find-vets', icon: 'vets', label: 'Find Vets', desc: 'Search nearby clinics' },
  { to: '/sos', icon: 'sos', label: 'Emergency SOS', desc: 'Get urgent help' },
  { to: '/pets', icon: 'pets', label: 'My Pets', desc: 'Manage profiles' },
  { to: '/guides', icon: 'guides', label: 'Guides', desc: 'First-aid info' },
  { to: '/blog', icon: 'blog', label: 'Blog', desc: 'Read articles' },
  { to: '/community', icon: 'community', label: 'Community', desc: 'Ask questions' },
];

export default function Home() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSos, setActiveSos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [petRes, apptRes, sosRes] = await Promise.allSettled([
          petService.getAll(),
          appointmentService.getAll({ status: 'confirmed', per_page: 5 }),
          sosService.getActive(),
        ]);

        if (petRes.status === 'fulfilled') {
          setPets(apiList(petRes.value?.data, 'pets'));
        }
        if (apptRes.status === 'fulfilled') {
          setAppointments(apiList(apptRes.value?.data, 'appointments'));
        }
        if (sosRes.status === 'fulfilled') {
          const sos = apiObject(sosRes.value?.data, 'sos');
          setActiveSos(sos && sos.uuid ? sos : null);
        }
      } catch (_) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader center />;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1 className={styles.greetTitle}>Hello, {firstName}</h1>
        <p className={styles.greetSub}>Here's a quick overview of your pet care.</p>
      </div>

      {activeSos && (
        <div className={styles.sosBanner}>
          <Icon name="sos" size={18} />
          <span>You have an active SOS alert</span>
          <Link to="/sos" className={styles.sosLink}>View</Link>
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick actions</h2>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className={styles.quickCard}>
              <div className={styles.quickIcon}>
                <Icon name={a.icon} size={20} />
              </div>
              <div>
                <div className={styles.quickLabel}>{a.label}</div>
                <div className={styles.quickDesc}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Upcoming appointments</h2>
            <Link to="/appointments" className={styles.viewAll}>View all</Link>
          </div>
          {appointments.length === 0 ? (
            <EmptyState title="No upcoming appointments" message="Book a vet visit to get started." />
          ) : (
            <div className={styles.list}>
              {appointments.slice(0, 3).map((appt) => (
                <Card key={appt.uuid || appt.id}>
                  <div className={styles.apptRow}>
                    <div>
                      <div className={styles.apptVet}>{appt.vet_profile?.clinic_name || appt.vet_profile?.vet_name || 'Vet'}</div>
                      <div className={styles.apptMeta}>{formatDateTime(appt.scheduled_at)}</div>
                    </div>
                    <Badge variant={appt.status === 'confirmed' ? 'success' : 'default'}>{appt.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>My pets</h2>
            <Link to="/pets" className={styles.viewAll}>View all</Link>
          </div>
          {pets.length === 0 ? (
            <EmptyState title="No pets added" message="Add your first pet to get started." />
          ) : (
            <div className={styles.list}>
              {pets.slice(0, 4).map((pet) => (
                <Card key={pet.id}>
                  <div className={styles.petRow}>
                    <div className={styles.petAvatar}>
                      <Icon name="pets" size={18} />
                    </div>
                    <div>
                      <div className={styles.petName}>{pet.name}</div>
                      <div className={styles.petMeta}>{pet.species} {pet.breed ? `- ${pet.breed}` : ''}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
