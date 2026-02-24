import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import vetService from '../../services/vetService';
import { apiList, apiPagination } from '../../utils/helpers';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Pagination from '../../components/common/Pagination/Pagination';
import Icon from '../../components/common/Icon/Icon';
import styles from './FindVets.module.css';

export default function FindVets() {
  const { loading, execute } = useApi(vetService.getAll);
  const [vets, setVets] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1 });
  const [locationStatus, setLocationStatus] = useState('detecting');
  const coords = useRef({ lat: null, lng: null });

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
    if (!coords.current.lat) return;
    try {
      const params = {
        lat: coords.current.lat,
        lng: coords.current.lng,
        page,
        per_page: 12,
      };
      if (search) params.city = search;
      const raw = await execute(params);
      setVets(apiList(raw, 'vets'));
      setMeta(apiPagination(raw));
    } catch (_) {}
  }, [execute, search, page, locationStatus]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

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
      ) : vets.length === 0 ? (
        <EmptyState title="No vets found" message="Try adjusting your search criteria." />
      ) : (
        <>
          <div className={styles.grid}>
            {vets.map((vet) => (
              <Link key={vet.uuid} to={`/vets/${vet.uuid}`} className={styles.cardLink}>
                <Card>
                  <div className={styles.vetCard}>
                    <div className={styles.vetAvatar}>
                      <Icon name="vets" size={22} />
                    </div>
                    <div className={styles.vetInfo}>
                      <h3 className={styles.vetName}>{vet.vet_name || vet.clinic_name || 'Vet'}</h3>
                      <p className={styles.vetSpec}>{vet.clinic_name || ''}</p>
                      {vet.city && (
                        <p className={styles.vetCity}>
                          <Icon name="location" size={13} />
                          {vet.city}
                        </p>
                      )}
                    </div>
                    <div className={styles.vetMeta}>
                      {vet.is_emergency_available && (
                        <Badge variant="danger">Emergency</Badge>
                      )}
                      {vet.is_verified && (
                        <Badge variant="success">Verified</Badge>
                      )}
                      {vet.rating > 0 && (
                        <span className={styles.fee}>⭐ {vet.rating}</span>
                      )}
                      {vet.distance_km != null && (
                        <span className={styles.fee}>{Number(vet.distance_km).toFixed(1)} km</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination page={page} totalPages={meta.last_page} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
