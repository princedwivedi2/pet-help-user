import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LocationPicker.module.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create clinic marker icon
const clinicIcon = L.divIcon({
  className: 'clinic-marker',
  html: `
    <div style="
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
      border: 3px solid white;
      cursor: grab;
    ">
      <svg style="transform: rotate(45deg); color: white; width: 22px; height: 22px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
        <path d="M9 22v-4h6v4"/>
        <line x1="12" y1="6" x2="12" y2="14"/>
        <line x1="8" y1="10" x2="16" y2="10"/>
      </svg>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
}

function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onPositionChange(lat, lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={clinicIcon}
    />
  );
}

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  onAddressFound,
  disabled = false
}) {
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const searchTimeout = useRef(null);
  const mapRef = useRef(null);

  // Initialize position from props
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  // Search for location
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length >= 3) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
          );
          const data = await res.json();
          setSuggestions(data.map(item => ({
            display: item.display_name.split(',').slice(0, 4).join(','),
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

  // Select suggestion
  const selectSuggestion = (suggestion) => {
    setPosition([suggestion.lat, suggestion.lng]);
    onLocationChange(suggestion.lat.toFixed(6), suggestion.lng.toFixed(6));
    setSearchQuery(suggestion.display);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Parse address components
    if (onAddressFound) {
      const parts = suggestion.full.split(',').map(p => p.trim());
      onAddressFound({
        address: parts.slice(0, 2).join(', '),
        city: parts.find(p => /\b(city|town|village)\b/i.test(p)) || parts[parts.length - 4] || '',
        state: parts[parts.length - 2] || '',
        postal_code: parts.find(p => /^\d{6}$/.test(p)) || ''
      });
    }
  };

  // Use current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        onLocationChange(lat.toFixed(6), lng.toFixed(6));
        
        // Reverse geocode
        setReverseGeocoding(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            setSearchQuery(data.display_name.split(',').slice(0, 3).join(','));
            if (onAddressFound) {
              onAddressFound({
                address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', '),
                city: addr.city || addr.town || addr.village || '',
                state: addr.state || '',
                postal_code: addr.postcode || ''
              });
            }
          }
        } catch {} finally {
          setReverseGeocoding(false);
        }
        setDetecting(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setDetecting(false);
        alert('Could not detect your location. Please search or click on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle map click
  const handleMapClick = useCallback(async (lat, lng) => {
    if (disabled) return;
    
    setPosition([lat, lng]);
    onLocationChange(lat.toFixed(6), lng.toFixed(6));
    
    // Reverse geocode
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data.address) {
        const addr = data.address;
        setSearchQuery(data.display_name.split(',').slice(0, 3).join(','));
        if (onAddressFound) {
          onAddressFound({
            address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', '),
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || '',
            postal_code: addr.postcode || ''
          });
        }
      }
    } catch {} finally {
      setReverseGeocoding(false);
    }
  }, [disabled, onLocationChange, onAddressFound]);

  // Handle marker drag
  const handleMarkerDrag = useCallback((lat, lng) => {
    handleMapClick(lat, lng);
  }, [handleMapClick]);

  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const center = position || defaultCenter;
  const zoom = position ? 16 : 5;

  return (
    <div className={styles.picker}>
      {/* Search bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <div className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for your clinic location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={disabled}
          />
          {reverseGeocoding && <div className={styles.spinner}></div>}
          
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.suggestionItem}
                  onClick={() => selectSuggestion(s)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {s.display}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.locateBtn}
          onClick={useCurrentLocation}
          disabled={disabled || detecting}
          title="Use my current location"
        >
          {detecting ? (
            <div className={styles.btnSpinner}></div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>
          )}
          <span>Detect Location</span>
        </button>
      </div>

      {/* Map */}
      <div className={styles.mapContainer}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          className={styles.map}
          ref={mapRef}
        >
          <MapController center={center} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {!disabled && <ClickHandler onClick={handleMapClick} />}
          
          {position && (
            <DraggableMarker
              position={position}
              onPositionChange={handleMarkerDrag}
            />
          )}
        </MapContainer>

        {/* Instructions overlay */}
        {!position && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <p>Search for your clinic location or click on the map to set coordinates</p>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {position && (
        <div className={styles.coordsRow}>
          <div className={styles.coordItem}>
            <span className={styles.coordLabel}>Latitude</span>
            <span className={styles.coordValue}>{position[0].toFixed(6)}</span>
          </div>
          <div className={styles.coordItem}>
            <span className={styles.coordLabel}>Longitude</span>
            <span className={styles.coordValue}>{position[1].toFixed(6)}</span>
          </div>
          <div className={styles.coordHint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Drag the marker to adjust location
          </div>
        </div>
      )}
    </div>
  );
}
