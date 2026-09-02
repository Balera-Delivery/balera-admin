import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper to sanitize lat/lng numbers
const sanitizeCoord = (coord, fallback) => {
  if (Array.isArray(coord) && coord.length >= 2) {
    const lat = Number(coord[0]);
    const lng = Number(coord[1]);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [lat, lng];
    }
  }
  return fallback;
};

// Custom Map center updater
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet Div Icons
const createPinIcon = (color = '#1B59F8', label = '') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${color};
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          ${label || '📍'}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36]
  });
};

const riderIcon = L.divIcon({
  className: 'custom-rider-pin',
  html: `
    <div style="
      background: #1B59F8;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 0 0 6px rgba(27, 89, 248, 0.25), 0 4px 6px rgba(0,0,0,0.2);
      border: 2px solid white;
      animation: bounce 1s infinite alternate;
    ">
      🛵
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export const DeliveryRouteMap = ({ 
  pickup = [9.0054, 38.7885], 
  destination = [9.0345, 38.7512], 
  riderPosition = null,
  routeCoordinates = [],
  pickupLabel = 'Pickup',
  destinationLabel = 'Destination'
}) => {
  const safePickup = sanitizeCoord(pickup, [9.0054, 38.7885]);
  const safeDestination = sanitizeCoord(destination, [9.0345, 38.7512]);
  const safeRiderPosition = riderPosition ? sanitizeCoord(riderPosition, null) : null;

  const center = [
    (safePickup[0] + safeDestination[0]) / 2,
    (safePickup[1] + safeDestination[1]) / 2
  ];

  let polylineCoords = [safePickup, safeDestination];
  if (Array.isArray(routeCoordinates) && routeCoordinates.length >= 2) {
    const validCoords = routeCoordinates.map(c => sanitizeCoord(c, null)).filter(Boolean);
    if (validCoords.length >= 2) {
      polylineCoords = validCoords;
    }
  }

  return (
    <div className="w-full h-full min-h-[320px] rounded-xl overflow-hidden shadow-inner border border-slate-200 relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={center} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Pin */}
        <Marker position={safePickup} icon={createPinIcon('#16A34A', 'P')}>
          <Popup>
            <div className="text-xs font-sans">
              <strong className="text-emerald-700 block">Pickup Location</strong>
              <span>{pickupLabel || 'Pickup'}</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Pin */}
        <Marker position={safeDestination} icon={createPinIcon('#EF4444', 'D')}>
          <Popup>
            <div className="text-xs font-sans">
              <strong className="text-rose-700 block">Delivery Destination</strong>
              <span>{destinationLabel || 'Destination'}</span>
            </div>
          </Popup>
        </Marker>

        {/* Live Rider Position */}
        {safeRiderPosition && (
          <Marker position={safeRiderPosition} icon={riderIcon}>
            <Popup>
              <div className="text-xs font-sans">
                <strong className="text-brand-700 block">Assigned Rider</strong>
                <span>Currently in transit</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        <Polyline
          positions={polylineCoords}
          pathOptions={{
            color: '#1B59F8',
            weight: 5,
            opacity: 0.8,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      </MapContainer>
    </div>
  );
};
