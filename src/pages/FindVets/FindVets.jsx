import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import vetService from '../../services/vetService';
import authService from '../../services/authService';
import { apiList } from '../../utils/helpers';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Icon from '../../components/common/Icon/Icon';
import styles from './FindVets.module.css';

export default function FindVets() {
  const { loading, execute } = useApi(vetService.getAll);
  const [sections, setSections] = useState({ nearby_vets: [], city_vets: [], all_vets: [] });
  const [search, setSearch] = useState('');
  const [userCity, setUserCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('detecting');
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
        radius_km: 10,
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
  }, [execute, search, userCity, locationStatus]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearch(val);
  };

  const renderVetGrid = (list) => (
    <div className={styles.grid}>
      {list.map((vet) => (
        <Link key={vet.uuid} to={`/vets/${vet.uuid}`} className={styles.cardLink}>
          <Card>
            <div className={styles.vetCard}>
              <div className={styles.vetAvatar}>
                <Icon name="vets" size={22} />
              </div>
              <div className={styles.vetInfo}>
                <h3 className={styles.vetName}>{vet.vet_name || vet.clinic_name || 'Vet'}</h3>
                <p className={styles.vetSpec}>{vet.specialization || vet.clinic_name || 'Veterinarian'}</p>
                {(vet.city || vet.state) && (
                  <p className={styles.vetCity}>
                    <Icon name="location" size={13} />
                    {[vet.city, vet.state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div className={styles.vetMeta}>
                {vet.is_emergency_available && <Badge variant="danger">Emergency</Badge>}
                {vet.is_verified && <Badge variant="success">Verified</Badge>}
                {Array.isArray(vet.consultation_types) && vet.consultation_types.length > 0 && (
                  <span className={styles.fee} style={{ fontSize: 11 }}>{vet.consultation_types.map(t => t.replace(/_/g, ' ')).join(' · ')}</span>
                )}
                {vet.avg_rating != null && <span className={styles.fee}>{Number(vet.avg_rating).toFixed(1)} rating</span>}
                {vet.distance_km != null && <span className={styles.fee}>{Number(vet.distance_km).toFixed(1)} km away</span>}
                {vet.consultation_fee != null && <span className={styles.fee}>Fee: Rs {Number(vet.consultation_fee).toLocaleString('en-IN')}</span>}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );

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

      {loading ? (
        <Loader center />
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
