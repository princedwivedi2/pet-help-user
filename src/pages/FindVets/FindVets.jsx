import { useEffect, useState, useCallback, useRef, useMemo, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useApi from '../../hooks/useApi';
import vetService from '../../services/vetService';
import authService from '../../services/authService';
import { apiList } from '../../utils/helpers';
import Badge from '../../components/common/Badge/Badge';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import Icon from '../../components/common/Icon/Icon';
import Button from '../../components/common/Button/Button';
import styles from './FindVets.module.css';

// Lazy load map component for better initial load
const VetMapComponent = lazy(() => import('./VetMapInline'));

// Specialization options
const SPECIALIZATIONS = [
  { id: 'all', label: 'All Specialties', icon: '🏥' },
  { id: 'general', label: 'General Practice', icon: '🩺' },
  { id: 'surgery', label: 'Surgery', icon: '⚕️' },
  { id: 'dermatology', label: 'Dermatology', icon: '🐾' },
  { id: 'dentistry', label: 'Dentistry', icon: '🦷' },
  { id: 'cardiology', label: 'Cardiology', icon: '❤️' },
  { id: 'orthopedics', label: 'Orthopedics', icon: '🦴' },
  { id: 'oncology', label: 'Oncology', icon: '🎗️' },
  { id: 'exotic', label: 'Exotic Pets', icon: '🦜' },
];

// Consultation types
const CONSULT_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'in_clinic', label: 'In-Clinic Visit' },
  { id: 'video', label: 'Video Consult' },
  { id: 'home_visit', label: 'Home Visit' },
];

export default function FindVets() {
  const navigate = useNavigate();
  const { loading, execute } = useApi(vetService.getAll);
  const [sections, setSections] = useState({ nearby_vets: [], city_vets: [], all_vets: [] });
  const [search, setSearch] = useState('');
  const [userCity, setUserCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [radiusFilter, setRadiusFilter] = useState(10);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [specialization, setSpecialization] = useState('all');
  const [consultType, setConsultType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedVet, setSelectedVet] = useState(null);
  const [locationName, setLocationName] = useState('');
  const coords = useRef({ lat: null, lng: null });
  const searchInputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeout = useRef(null);

  // Load user city
  useEffect(() => {
    const loadUserCity = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;
      try {
        const me = await authService.me();
        const city = me?.data?.user?.city || '';
        setUserCity(city);
      } catch (_) {}
    };
    loadUserCity();
  }, []);

  // Detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          coords.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocationStatus('ready');
          // Reverse geocode to get location name
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const state = data.address?.state || '';
            setLocationName([city, state].filter(Boolean).join(', ') || 'Your Location');
          } catch {
            setLocationName('Your Location');
          }
        },
        () => {
          coords.current = { lat: 28.6139, lng: 77.209 };
          setLocationStatus('fallback');
          setLocationName('Delhi, India');
        }
      );
    } else {
      coords.current = { lat: 28.6139, lng: 77.209 };
      setLocationStatus('fallback');
      setLocationName('Delhi, India');
    }
  }, []);

  // Location search with suggestions
  const handleSearchInput = (val) => {
    setSearch(val);
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    
    if (val.length >= 2) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`
          );
          const data = await res.json();
          setSuggestions(data.map(item => ({
            name: item.display_name.split(',').slice(0, 3).join(','),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            full: item.display_name
          })));
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearch(suggestion.name);
    coords.current = { lat: suggestion.lat, lng: suggestion.lng };
    setLocationName(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Use current location
  const useCurrentLocation = () => {
    setLocationStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          coords.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocationStatus('ready');
          setSearch('');
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const state = data.address?.state || '';
            setLocationName([city, state].filter(Boolean).join(', ') || 'Your Location');
          } catch {
            setLocationName('Current Location');
          }
        },
        () => {
          setLocationStatus('error');
        }
      );
    }
  };

  // Load vets
  const load = useCallback(async () => {
    try {
      const params = {
        radius_km: radiusFilter,
        limit: 30,
      };

      if (coords.current.lat && coords.current.lng) {
        params.lat = coords.current.lat;
        params.lng = coords.current.lng;
      }

      if (search && !suggestions.length) {
        params.city = search;
      } else if (userCity) {
        params.city = userCity;
      }

      if (emergencyOnly) {
        params.emergency_only = true;
      }

      if (specialization !== 'all') {
        params.specialization = specialization;
      }

      const raw = await execute(params);
      setSections({
        nearby_vets: apiList(raw, 'nearby_vets'),
        city_vets: apiList(raw, 'city_vets'),
        all_vets: apiList(raw, 'all_vets'),
      });
    } catch (err) {
      console.error('Failed to load vets:', err?.message);
    }
  }, [execute, search, userCity, locationStatus, radiusFilter, emergencyOnly, specialization, suggestions.length]);

  useEffect(() => {
    load();
  }, [load]);

  // Combined and filtered vet list
  const allVets = useMemo(() => {
    const combined = [
      ...sections.nearby_vets,
      ...sections.city_vets.filter(v => !sections.nearby_vets.find(n => n.uuid === v.uuid)),
      ...sections.all_vets.filter(v => 
        !sections.nearby_vets.find(n => n.uuid === v.uuid) &&
        !sections.city_vets.find(c => c.uuid === v.uuid)
      ),
    ];

    let filtered = combined;

    if (emergencyOnly) {
      filtered = filtered.filter(v => v.is_emergency_available);
    }

    if (consultType !== 'all') {
      filtered = filtered.filter(v => 
        Array.isArray(v.consultation_types) && v.consultation_types.includes(consultType)
      );
    }

    return filtered;
  }, [sections, emergencyOnly, consultType]);

  const getInitials = (name) => {
    if (!name) return 'V';
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const hasResults = allVets.length > 0;

  // Render single vet card (Practo style)
  const renderVetCard = (vet, index) => {
    const name = vet.vet_name || vet.clinic_name || 'Veterinary Doctor';
    const isSelected = selectedVet?.uuid === vet.uuid;

    return (
      <motion.div
        key={vet.uuid}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link 
          to={`/vets/${vet.uuid}`} 
          className={`${styles.vetCard} ${isSelected ? styles.vetCardSelected : ''}`}
          onMouseEnter={() => setSelectedVet(vet)}
          onMouseLeave={() => setSelectedVet(null)}
        >
          <div className={styles.vetCardInner}>
            {/* Avatar */}
            <div className={styles.vetAvatarSection}>
              <div className={`${styles.vetAvatar} ${vet.is_emergency_available ? styles.vetAvatarEmergency : ''}`}>
                {vet.profile_photo ? (
                  <img src={vet.profile_photo} alt={name} className={styles.vetAvatarImg} />
                ) : (
                  <span className={styles.vetInitials}>{getInitials(name)}</span>
                )}
              </div>
              {vet.is_verified && (
                <div className={styles.verifiedBadge} title="Verified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className={styles.vetInfo}>
              <div className={styles.vetNameRow}>
                <h3 className={styles.vetName}>{name}</h3>
                {vet.is_emergency_available && (
                  <span className={styles.emergencyTag}>🚨 24/7</span>
                )}
              </div>
              
              <p className={styles.vetSpec}>
                {vet.specialization || 'General Veterinarian'}
                {vet.experience_years && ` • ${vet.experience_years}+ yrs exp`}
              </p>

              {vet.clinic_name && vet.clinic_name !== name && (
                <p className={styles.vetClinic}>
                  <Icon name="building" size={12} />
                  {vet.clinic_name}
                </p>
              )}

              {(vet.city || vet.state) && (
                <p className={styles.vetLocation}>
                  <Icon name="location" size={12} />
                  {[vet.city, vet.state].filter(Boolean).join(', ')}
                  {vet.distance_km != null && (
                    <span className={styles.distanceInline}> • {Number(vet.distance_km).toFixed(1)} km</span>
                  )}
                </p>
              )}

              {/* Consultation types */}
              {Array.isArray(vet.consultation_types) && vet.consultation_types.length > 0 && (
                <div className={styles.consultTypes}>
                  {vet.consultation_types.includes('in_clinic') && (
                    <span className={styles.consultTag}>
                      <Icon name="building" size={11} /> Clinic
                    </span>
                  )}
                  {vet.consultation_types.includes('video') && (
                    <span className={`${styles.consultTag} ${styles.consultTagVideo}`}>
                      <Icon name="video" size={11} /> Video
                    </span>
                  )}
                  {vet.consultation_types.includes('home_visit') && (
                    <span className={styles.consultTag}>
                      <Icon name="home" size={11} /> Home
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right side - ratings, price, CTA */}
            <div className={styles.vetActions}>
              {vet.avg_rating != null && (
                <div className={styles.ratingBox}>
                  <span className={styles.ratingValue}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {Number(vet.avg_rating).toFixed(1)}
                  </span>
                  {vet.total_reviews > 0 && (
                    <span className={styles.ratingCount}>{vet.total_reviews} reviews</span>
                  )}
                </div>
              )}

              {vet.consultation_fee != null && (
                <div className={styles.feeBox}>
                  <span className={styles.feeLabel}>Consultation</span>
                  <span className={styles.feeValue}>₹{Number(vet.consultation_fee).toLocaleString('en-IN')}</span>
                </div>
              )}

              <button className={styles.bookBtn}>
                Book Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Find the Best <span className={styles.heroHighlight}>Veterinarians</span> Near You
            </h1>
            <p className={styles.heroSubtitle}>
              Book appointments with verified vets. In-clinic, video consults, or home visits available.
            </p>
          </div>

          {/* Search Box */}
          <div className={styles.searchBox}>
            <div className={styles.searchRow}>
              {/* Location Input */}
              <div className={styles.searchField}>
                <div className={styles.searchIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search city or area..."
                  value={search}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => suggestions.length && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {locationStatus === 'detecting' && (
                  <div className={styles.searchSpinner}></div>
                )}
                <button 
                  className={styles.locateBtn}
                  onClick={useCurrentLocation}
                  title="Use my location"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                  </svg>
                </button>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      className={styles.suggestions}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          className={styles.suggestionItem}
                          onClick={() => selectSuggestion(s)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {s.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Specialization Select */}
              <div className={styles.searchField}>
                <div className={styles.searchIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <select 
                  className={styles.searchSelect}
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  {SPECIALIZATIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={load}
                className={styles.searchBtn}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.btnSpinner}></span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Current location indicator */}
            {locationName && (
              <div className={styles.locationIndicator}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <span>Showing results near <strong>{locationName}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Hero illustration */}
        <div className={styles.heroIllustration}>
          <div className={styles.heroImagePlaceholder}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <span>PetSathi</span>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className={styles.quickFilters}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.quickFilter} ${emergencyOnly ? styles.quickFilterActive : ''} ${styles.quickFilterEmergency}`}
            onClick={() => setEmergencyOnly(v => !v)}
          >
            🚨 Emergency Only
          </button>

          <div className={styles.filterDivider}></div>

          {[
            { label: 'Within 5 km', value: 5 },
            { label: 'Within 10 km', value: 10 },
            { label: 'Within 25 km', value: 25 },
            { label: 'Any Distance', value: 100 },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`${styles.quickFilter} ${radiusFilter === opt.value ? styles.quickFilterActive : ''}`}
              onClick={() => setRadiusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}

          <div className={styles.filterDivider}></div>

          {CONSULT_TYPES.map((type) => (
            <button
              key={type.id}
              className={`${styles.quickFilter} ${consultType === type.id ? styles.quickFilterActive : ''}`}
              onClick={() => setConsultType(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            List
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'map' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('map')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            Map
          </button>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        {/* Results count */}
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>
            {loading ? 'Searching...' : `${allVets.length} Veterinarians Found`}
          </h2>
          {!loading && hasResults && (
            <p className={styles.resultsSubtitle}>
              {sections.nearby_vets.length > 0 && `${sections.nearby_vets.length} nearby`}
              {sections.nearby_vets.length > 0 && sections.city_vets.length > 0 && ' • '}
              {sections.city_vets.length > 0 && `${sections.city_vets.length} in your city`}
            </p>
          )}
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonAvatar}>
                    <Skeleton variant="circle" width="72px" height="72px" />
                  </div>
                  <div className={styles.skeletonContent}>
                    <Skeleton variant="line" width="60%" height="18px" />
                    <Skeleton variant="line" width="80%" height="14px" style={{ marginTop: 8 }} />
                    <Skeleton variant="line" width="40%" height="12px" style={{ marginTop: 6 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <Skeleton variant="rect" width="60px" height="24px" style={{ borderRadius: 6 }} />
                      <Skeleton variant="rect" width="80px" height="24px" style={{ borderRadius: 6 }} />
                    </div>
                  </div>
                  <div className={styles.skeletonActions}>
                    <Skeleton variant="rect" width="70px" height="32px" style={{ borderRadius: 8 }} />
                    <Skeleton variant="rect" width="90px" height="36px" style={{ borderRadius: 8, marginTop: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !hasResults ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
                <path d="M8 8l6 6M14 8l-6 6"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No Veterinarians Found</h3>
            <p className={styles.emptyMessage}>
              Try expanding your search radius or changing your filters.
            </p>
            <Button variant="outline" onClick={() => {
              setRadiusFilter(100);
              setEmergencyOnly(false);
              setSpecialization('all');
              setConsultType('all');
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : viewMode === 'map' ? (
          <div className={styles.mapViewContainer}>
            <div className={styles.mapSidebar}>
              <div className={styles.mapVetList}>
                {allVets.slice(0, 10).map((vet, i) => renderVetCard(vet, i))}
              </div>
            </div>
            <div className={styles.mapArea}>
              <Suspense fallback={
                <div className={styles.mapLoading}>
                  <div className={styles.mapSpinner}></div>
                  <p>Loading map...</p>
                </div>
              }>
                <VetMapComponent
                  vets={allVets}
                  userLocation={coords.current}
                  selectedVet={selectedVet}
                  onVetClick={setSelectedVet}
                  radiusKm={radiusFilter}
                />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className={styles.vetList}>
            {/* Nearby section */}
            {sections.nearby_vets.length > 0 && (
              <div className={styles.vetSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionLabel}>
                    <span className={styles.sectionIcon}>📍</span>
                    Nearby Veterinarians
                  </h3>
                  <span className={styles.sectionCount}>{sections.nearby_vets.length}</span>
                </div>
                {sections.nearby_vets
                  .filter(v => !emergencyOnly || v.is_emergency_available)
                  .filter(v => consultType === 'all' || (v.consultation_types || []).includes(consultType))
                  .map((vet, i) => renderVetCard(vet, i))}
              </div>
            )}

            {/* City section */}
            {sections.city_vets.length > 0 && (
              <div className={styles.vetSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionLabel}>
                    <span className={styles.sectionIcon}>🏙️</span>
                    In Your City
                  </h3>
                  <span className={styles.sectionCount}>{sections.city_vets.length}</span>
                </div>
                {sections.city_vets
                  .filter(v => !sections.nearby_vets.find(n => n.uuid === v.uuid))
                  .filter(v => !emergencyOnly || v.is_emergency_available)
                  .filter(v => consultType === 'all' || (v.consultation_types || []).includes(consultType))
                  .map((vet, i) => renderVetCard(vet, i))}
              </div>
            )}

            {/* All vets */}
            {sections.all_vets.length > 0 && (
              <div className={styles.vetSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionLabel}>
                    <span className={styles.sectionIcon}>🌐</span>
                    All Available Vets
                  </h3>
                  <span className={styles.sectionCount}>{sections.all_vets.length}</span>
                </div>
                {sections.all_vets
                  .filter(v => 
                    !sections.nearby_vets.find(n => n.uuid === v.uuid) &&
                    !sections.city_vets.find(c => c.uuid === v.uuid)
                  )
                  .filter(v => !emergencyOnly || v.is_emergency_available)
                  .filter(v => consultType === 'all' || (v.consultation_types || []).includes(consultType))
                  .map((vet, i) => renderVetCard(vet, i))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Bottom CTA for vets */}
      <section className={styles.vetCta}>
        <div className={styles.ctaContent}>
          <h3>Are you a Veterinarian?</h3>
          <p>Join PetSathi and connect with thousands of pet parents in your area.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/vet-apply')}>
          Register as Vet
        </Button>
      </section>
    </div>
  );
}
