import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import vetService from '../../services/vetService';
import authService from '../../services/authService';
import { apiList } from '../../utils/helpers';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Icon from '../../components/common/Icon/Icon';
import styles from './FindVets.module.css';

export default function FindVets() {
  const { loading, execute } = useApi(vetService.getAll);
  const [sections, setSections] = useState({ nearby_vets: [], city_vets: [], all_vets: [] });
  const [search, setSearch] = useState('');
  const [userCity, setUserCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [radiusFilter, setRadiusFilter] = useState(10);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const coords = useRef({ lat: null, lng: null });

  useEffect(() => {
    const loadUserCity = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      try {
        const me = await authService.me();
        const city = me?.data?.user?.city || '';
        setUserCity(city);
      } catch (_) {
        // no-op for guests
      }
    };
    loadUserCity();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          coords.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocationStatus('ready');
        },
        () => {
          coords.current = { lat: 28.6139, lng: 77.209 };
          setLocationStatus('fallback');
        }
      );
    } else {
      coords.current = { lat: 28.6139, lng: 77.209 };
      setLocationStatus('fallback');
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const params = {
        radius_km: radiusFilter,
        limit: 18,
      };

      if (coords.current.lat && coords.current.lng) {
        params.lat = coords.current.lat;
        params.lng = coords.current.lng;
      }

      if (search) {
        params.city = search;
      } else if (userCity) {
        params.city = userCity;
      }

      const raw = await execute(params);
      setSections({
        nearby_vets: apiList(raw, 'nearby_vets'),
        city_vets: apiList(raw, 'city_vets'),
        all_vets: apiList(raw, 'all_vets'),
      });
    } catch (err) { console.error('Failed to load vets:', err?.message); }
  }, [execute, search, userCity, locationStatus, radiusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearch(val);
  };

  const getInitials = (name) => {
    if (!name) return 'V';
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const renderVetGrid = (list) => {
    const filtered = emergencyOnly ? list.filter(v => v.is_emergency_available) : list;
    if (!filtered.length) return <p className={styles.sectionHint}>No vets match the current filters.</p>;
    return (
      <div className={styles.grid}>
        {filtered.map((vet) => {
          const name = vet.vet_name || vet.clinic_name || 'Vet';
          return (
            <Link key={vet.uuid} to={`/vets/${vet.uuid}`} className={styles.cardLink}>
              <Card>
                <div className={styles.vetCard}>
                  <div className={styles.vetAvatar}>
                    <span className={styles.vetInitials}>{getInitials(name)}</span>
                  </div>
                  <div className={styles.vetInfo}>
                    <h3 className={styles.vetName}>{name}</h3>
                    <p className={styles.vetSpec}>{vet.specialization || 'Veterinarian'}</p>
                    {(vet.city || vet.state) && (
                      <p className={styles.vetCity}>
                        <Icon name="location" size={13} />
                        {[vet.city, vet.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {Array.isArray(vet.consultation_types) && vet.consultation_types.length > 0 && (
                      <div className={styles.consultChips}>
                        {vet.consultation_types.slice(0, 2).map(t => (
                          <span key={t} className={styles.consultChip}>{t.replace(/_/g, ' ')}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.vetMeta}>
                    {vet.is_emergency_available && <Badge variant="danger">🚨 SOS</Badge>}
                    {vet.is_verified && <Badge variant="success">✓ Verified</Badge>}
                    {vet.avg_rating != null && (
                      <span className={styles.rating}>★ {Number(vet.avg_rating).toFixed(1)}</span>
                    )}
                    {vet.distance_km != null && (
                      <span className={styles.distancePill}>{Number(vet.distance_km).toFixed(1)} km</span>
                    )}
                    {vet.consultation_fee != null && (
                      <span className={styles.fee}>₹{Number(vet.consultation_fee).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  };

  const hasAny = sections.nearby_vets.length || sections.city_vets.length || sections.all_vets.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Find Veterinarians</h1>
          <p className={styles.subtitle}>
            {locationStatus === 'detecting'
              ? 'Detecting your location...'
              : locationStatus === 'fallback'
              ? 'Using default location. Search by city below.'
              : 'Showing vets near you'}
          </p>
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={handleSearch}
        placeholder="Search by city..."
      />

      <div className={styles.filterRow}>
        <button
          className={`${styles.filterChip} ${emergencyOnly ? styles.filterChipActive : ''}`}
          onClick={() => setEmergencyOnly(v => !v)}
        >
          🚨 Emergency
        </button>
        {[
          { label: '5 km', value: 5 },
          { label: '10 km', value: 10 },
          { label: '25 km', value: 25 },
          { label: 'All', value: 100 },
        ].map((opt) => (
          <button
            key={opt.label}
            className={`${styles.filterChip} ${radiusFilter === opt.value ? styles.filterChipActive : ''}`}
            onClick={() => setRadiusFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.sectionStack}>
          <section>
            <Skeleton variant="line" width="140px" height="18px" style={{ marginBottom: 12 }} />
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 18, border: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Skeleton variant="circle" width="48px" height="48px" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <Skeleton variant="line" width="70%" height="14px" />
                      <Skeleton variant="line" width="50%" height="12px" />
                      <Skeleton variant="line" width="40%" height="11px" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <Skeleton variant="rect" width="56px" height="22px" style={{ borderRadius: 99 }} />
                    <Skeleton variant="rect" width="72px" height="22px" style={{ borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : !hasAny ? (
        <EmptyState title="No vets found" message="Try adjusting your search criteria." />
      ) : (
        <div className={styles.sectionStack}>
          <section>
            <h2 className={styles.sectionTitle}>Nearby Vets</h2>
            {sections.nearby_vets.length ? renderVetGrid(sections.nearby_vets) : <p className={styles.sectionHint}>No nearby vets found within the selected radius.</p>}
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Other Vets in Your City</h2>
            {sections.city_vets.length ? renderVetGrid(sections.city_vets) : <p className={styles.sectionHint}>No city-level matches found right now.</p>}
          </section>

          <section>
            <h2 className={styles.sectionTitle}>All Available Vets</h2>
            {sections.all_vets.length ? renderVetGrid(sections.all_vets) : <p className={styles.sectionHint}>No approved vets are currently available.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
