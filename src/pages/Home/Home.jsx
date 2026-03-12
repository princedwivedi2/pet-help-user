import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import petService from '../../services/petService';
import appointmentService from '../../services/appointmentService';
import sosService from '../../services/sosService';
import { apiList, apiObject, formatDateTime } from '../../utils/helpers';
import Icon from '../../components/common/Icon/Icon';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import styles from './Home.module.css';

const QUICK_ACTIONS = [
  { to: '/find-vets', icon: 'vets', label: 'Find Vets', color: '#f97316' },
  { to: '/sos', icon: 'sos', label: 'SOS', color: '#ef4444' },
  { to: '/pets', icon: 'pets', label: 'My Pets', color: '#8b5cf6' },
  { to: '/appointments', icon: 'appointments', label: 'Bookings', color: '#0d9488' },
  { to: '/guides', icon: 'guides', label: 'Guides', color: '#2563eb' },
  { to: '/blog', icon: 'blog', label: 'Blog', color: '#d946ef' },
  { to: '/community', icon: 'community', label: 'Community', color: '#ea580c' },
  { to: '/notifications', icon: 'notification', label: 'Alerts', color: '#ca8a04' },
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className={styles.page}>
      {/* ── Hero Greeting Banner ── */}
      <motion.div
        className={styles.heroBanner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className={styles.heroContent}>
          <p className={styles.heroGreeting}>{greeting},</p>
          <h1 className={styles.heroName}>{firstName} 👋</h1>
          <p className={styles.heroSub}>How's your furry friend today?</p>
        </div>
        <div className={styles.heroIllustration}>
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" fill="#fff7ed" />
            <circle cx="42" cy="48" r="10" fill="#fed7aa" />
            <circle cx="78" cy="48" r="10" fill="#fed7aa" />
            <circle cx="30" cy="70" r="8" fill="#fdba74" />
            <circle cx="90" cy="70" r="8" fill="#fdba74" />
            <ellipse cx="60" cy="82" rx="22" ry="18" fill="#fb923c" />
            <circle cx="53" cy="78" r="3" fill="#fff7ed" />
            <circle cx="67" cy="78" r="3" fill="#fff7ed" />
            <ellipse cx="60" cy="84" rx="4" ry="2.5" fill="#c2410c" />
          </svg>
        </div>
      </motion.div>

      {/* ── Active SOS Alert ── */}
      {activeSos && (
        <motion.div
          className={styles.sosBanner}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.sosPulse} />
          <Icon name="sos" size={18} />
          <span>Active SOS alert</span>
          <Link to="/sos" className={styles.sosLink}>View →</Link>
        </motion.div>
      )}

      {/* ── Pet Story Circles (horizontal scroll) ── */}
      {pets.length > 0 && (
        <section className={styles.petStories}>
          <div className={styles.storiesRow}>
            <Link to="/pets" className={styles.storyItem}>
              <div className={styles.storyAdd}>
                <Icon name="plus" size={20} />
              </div>
              <span className={styles.storyName}>Add Pet</span>
            </Link>
            {pets.map((pet, i) => (
              <motion.div
                key={pet.id}
                className={styles.storyItem}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className={styles.storyCircle}>
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className={styles.storyImg} />
                  ) : (
                    <Icon name="pets" size={22} />
                  )}
                </div>
                <span className={styles.storyName}>{pet.name}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick Actions (icon-first round grid) ── */}
      <section className={styles.actionsSection}>
        <div className={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div
              key={a.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <Link to={a.to} className={styles.actionItem}>
                <div
                  className={styles.actionCircle}
                  style={{ background: `${a.color}14`, color: a.color }}
                >
                  <Icon name={a.icon} size={22} />
                </div>
                <span className={styles.actionLabel}>{a.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Upcoming Appointments (horizontal scroll cards) ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Upcoming</h2>
          <Link to="/appointments" className={styles.viewAll}>See all →</Link>
        </div>
        {appointments.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIllustration}>
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="16" width="56" height="52" rx="8" fill="#fff7ed" />
                <rect x="24" y="8" width="4" height="16" rx="2" fill="#fdba74" />
                <rect x="52" y="8" width="4" height="16" rx="2" fill="#fdba74" />
                <line x1="12" y1="32" x2="68" y2="32" stroke="#fed7aa" strokeWidth="2" />
                <circle cx="34" cy="48" r="4" fill="#fb923c" opacity="0.4" />
                <circle cx="48" cy="48" r="4" fill="#fb923c" opacity="0.4" />
                <circle cx="34" cy="58" r="4" fill="#fb923c" opacity="0.2" />
              </svg>
            </div>
            <p className={styles.emptyText}>No upcoming appointments</p>
            <Link to="/find-vets" className={styles.emptyLink}>Book a visit →</Link>
          </div>
        ) : (
          <div className={styles.carouselRow}>
            {appointments.slice(0, 5).map((appt) => (
              <Link
                key={appt.uuid || appt.id}
                to="/appointments"
                className={styles.apptCard}
              >
                <div className={styles.apptTop}>
                  <div className={styles.apptIcon}>
                    <Icon name="appointments" size={18} />
                  </div>
                  <Badge variant={appt.status === 'confirmed' ? 'success' : 'default'}>
                    {appt.status}
                  </Badge>
                </div>
                <h3 className={styles.apptVet}>
                  {appt.vet_profile?.clinic_name || appt.vet_profile?.vet_name || 'Vet'}
                </h3>
                <p className={styles.apptTime}>{formatDateTime(appt.scheduled_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── My Pets Section ── */}
      {pets.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>My Pets</h2>
            <Link to="/pets" className={styles.viewAll}>See all →</Link>
          </div>
          <div className={styles.petList}>
            {pets.slice(0, 3).map((pet) => (
              <div key={pet.id} className={styles.petCard}>
                <div className={styles.petAvatar}>
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className={styles.petImg} />
                  ) : (
                    <Icon name="pets" size={20} />
                  )}
                </div>
                <div className={styles.petInfo}>
                  <h4 className={styles.petName}>{pet.name}</h4>
                  <p className={styles.petBreed}>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                </div>
                <Icon name="chevronRight" size={16} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
