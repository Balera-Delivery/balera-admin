import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

function ChangeFleetView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const createPinIcon = (color = '#1B59F8', label = '📍') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: ${color};
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 10px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          ${label}
        </div>
        <div style="
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 7px solid ${color};
          margin-top: -2px;
        "></div>
      </div>
    `,
    iconSize: [28, 33],
    iconAnchor: [14, 33],
    popupAnchor: [0, -33]
  });
};

const riderLiveIcon = (name, vehicle) => L.divIcon({
  className: 'custom-rider-live',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
      <div style="
        background: #1B59F8;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
        margin-bottom: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.8);
      ">
        🛵 ${name}
      </div>
      <div style="
        width: 14px;
        height: 14px;
        background: #1B59F8;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(27, 89, 248, 0.35);
      "></div>
    </div>
  `,
  iconSize: [80, 40],
  iconAnchor: [40, 20]
});

export const LiveFleetMap = ({ activeDeliveries = [], selectedDeliveryId = null, onSelectDelivery = () => {} }) => {
  const defaultCenter = [9.0200, 38.7700]; // Addis Ababa central
  
  // Center on selected delivery if available
  const selectedDelivery = activeDeliveries.find(d => d.id === selectedDeliveryId);
  const activeCenter = selectedDelivery?.riderPosition || selectedDelivery?.routeCoordinates?.[0] || defaultCenter;

  return (
    <div className="w-full h-full min-h-[550px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
      <MapContainer
        center={activeCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <ChangeFleetView center={activeCenter} zoom={selectedDelivery ? 14 : 13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {activeDeliveries.map((delivery) => {
          const isSelected = delivery.id === selectedDeliveryId;
          const pickup = delivery.routeCoordinates?.[0] || [9.0054, 38.7885];
          const dest = delivery.routeCoordinates?.[delivery.routeCoordinates.length - 1] || [9.0345, 38.7512];
          const riderPos = delivery.riderPosition || pickup;

          return (
            <React.Fragment key={delivery.id}>
              {/* Pickup Pin */}
              <Marker position={pickup} icon={createPinIcon('#16A34A', 'P')}>
                <Popup>
                  <div className="text-xs p-1">
                    <span className="font-bold text-emerald-700 block">{delivery.id} - Pickup</span>
                    <p className="text-slate-600">{delivery.pickupLocation}</p>
                    <p className="text-[11px] text-slate-400">Customer: {delivery.customerName}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Destination Pin */}
              <Marker position={dest} icon={createPinIcon('#EF4444', 'D')}>
                <Popup>
                  <div className="text-xs p-1">
                    <span className="font-bold text-rose-700 block">{delivery.id} - Destination</span>
                    <p className="text-slate-600">{delivery.destination}</p>
                    <p className="text-[11px] text-slate-400">Receiver: {delivery.receiverName}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Rider Marker */}
              {riderPos && (
                <Marker 
                  position={riderPos} 
                  icon={riderLiveIcon(delivery.riderName || 'Rider', delivery.riderVehicle)}
                  eventHandlers={{
                    click: () => onSelectDelivery(delivery.id)
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong className="text-brand-700 block">{delivery.riderName}</strong>
                      <span className="text-slate-600 block">Status: {delivery.status}</span>
                      <span className="text-slate-500 text-[11px]">Phone: {delivery.riderPhone}</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Route line */}
              {delivery.routeCoordinates && (
                <Polyline
                  positions={delivery.routeCoordinates}
                  pathOptions={{
                    color: isSelected ? '#1B59F8' : '#64748B',
                    weight: isSelected ? 5 : 3,
                    opacity: isSelected ? 0.9 : 0.6,
                    dashArray: isSelected ? '6, 6' : undefined
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
