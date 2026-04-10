import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './VetMapInline.module.css';

// Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
}

export default function VetMapInline({ 
  vets = [], 
  userLocation, 
  onVetClick, 
  selectedVet,
  radiusKm = 10,
  showRadius = true
}) {
  const mapRef = useRef(null);
  
  const center = userLocation?.lat && userLocation?.lng
    ? [userLocation.lat, userLocation.lng] 
    : [28.6139, 77.209];

  const createVetIcon = (vet, isSelected) => {
    const isEmergency = vet.is_emergency_available;
    const bgColor = isSelected ? '#8b5cf6' : isEmergency ? '#dc2626' : '#f97316';
    
    return L.divIcon({
      className: 'vet-marker',
      html: `
        <div style="
          width: 44px;
          height: 44px;
          background: ${bgColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 3px solid white;
          ${isSelected ? 'transform: rotate(-45deg) scale(1.15);' : ''}
        ">
          <svg style="transform: rotate(45deg); color: white; width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44]
    });
  };

  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: rgba(37, 99, 235, 0.2);
          border-radius: 50%;
          animation: userPulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background: #2563eb;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        "></div>
      </div>
      <style>
        @keyframes userPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className={styles.map}
        ref={mapRef}
      >
        <MapController center={center} zoom={12} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showRadius && userLocation?.lat && userLocation?.lng && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#f97316',
              fillColor: '#f97316',
              fillOpacity: 0.06,
              weight: 2,
              dashArray: '6, 6'
            }}
          />
        )}

        {userLocation?.lat && userLocation?.lng && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userIcon}
          >
            <Popup>
              <div className={styles.popupContent}>
                <strong>📍 Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {vets.map((vet) => {
          if (!vet.latitude || !vet.longitude) return null;
          const isSelected = selectedVet?.uuid === vet.uuid;
          
          return (
            <Marker
              key={vet.uuid}
              position={[Number(vet.latitude), Number(vet.longitude)]}
              icon={createVetIcon(vet, isSelected)}
              eventHandlers={{
                click: () => onVetClick?.(vet)
              }}
            >
              <Popup>
                <div className={styles.popupContent}>
                  <h4 className={styles.popupName}>
                    {vet.vet_name || vet.clinic_name || 'Vet Clinic'}
                  </h4>
                  {vet.specialization && (
                    <p className={styles.popupSpec}>{vet.specialization}</p>
                  )}
                  <div className={styles.popupMeta}>
                    {vet.avg_rating && (
                      <span className={styles.popupRating}>
                        ★ {Number(vet.avg_rating).toFixed(1)}
                      </span>
                    )}
                    {vet.distance_km != null && (
                      <span className={styles.popupDistance}>
                        {Number(vet.distance_km).toFixed(1)} km
                      </span>
                    )}
                  </div>
                  {vet.consultation_fee && (
                    <p className={styles.popupFee}>
                      ₹{Number(vet.consultation_fee).toLocaleString('en-IN')}
                    </p>
                  )}
                  {vet.is_emergency_available && (
                    <span className={styles.popupEmergency}>🚨 24/7 Emergency</span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#f97316' }}></span>
          Veterinarian
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#dc2626' }}></span>
          Emergency Available
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#2563eb' }}></span>
          Your Location
        </div>
      </div>
    </div>
  );
}
