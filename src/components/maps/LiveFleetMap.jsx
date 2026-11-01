import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Crosshair, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Phone, 
  Bike, 
  MapPin, 
  Navigation as NavIcon,
  Clock, 
  ArrowRight,
  ExternalLink,
  Radio,
  CheckCircle2,
  X
} from 'lucide-react';

// Smooth Camera Controller
function CameraController({ targetPosition, targetBounds, zoomTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (targetBounds && targetBounds.isValid && targetBounds.isValid()) {
      map.fitBounds(targetBounds, { padding: [55, 55], maxZoom: 16, duration: 1.2 });
    } else if (targetPosition && !isNaN(targetPosition[0]) && !isNaN(targetPosition[1])) {
      map.flyTo(targetPosition, map.getZoom() > 14 ? map.getZoom() : 14, { duration: 1.2 });
    }
  }, [targetPosition, targetBounds, zoomTrigger, map]);

  return null;
}

// Custom Styled Marker Creators
const createPickupIcon = () => L.divIcon({
  className: 'custom-pickup-pin',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
      <div style="
        background: #059669;
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 10px rgba(5,150,105,0.4);
        border: 1.5px solid white;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      ">
        <span>📦</span>
        <span>PICKUP</span>
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #059669; margin-top: -1px;"></div>
    </div>
  `,
  iconSize: [64, 30],
  iconAnchor: [32, 30],
  popupAnchor: [0, -30]
});

const createDestIcon = () => L.divIcon({
  className: 'custom-dest-pin',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
      <div style="
        background: #DC2626;
        color: white;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 10px rgba(220,38,38,0.4);
        border: 1.5px solid white;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      ">
        <span>🏁</span>
        <span>DESTINATION</span>
      </div>
      <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #DC2626; margin-top: -1px;"></div>
    </div>
  `,
  iconSize: [84, 30],
  iconAnchor: [42, 30],
  popupAnchor: [0, -30]
});

const createRiderPulseIcon = (name, isSelected) => L.divIcon({
  className: 'custom-rider-pulse-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
      <!-- Pulsing Radar Animation -->
      <div style="
        position: absolute;
        width: ${isSelected ? '52px' : '40px'};
        height: ${isSelected ? '52px' : '40px'};
        border-radius: 50%;
        background: ${isSelected ? 'rgba(27, 89, 248, 0.35)' : 'rgba(27, 89, 248, 0.2)'};
        animation: radarPing 2s infinite cubic-bezier(0, 0, 0.2, 1);
        pointer-events: none;
      "></div>

      <!-- Courier Label Badge -->
      <div style="
        background: ${isSelected ? '#0F172A' : '#1E293B'};
        color: #FFFFFF;
        padding: 2.5px 8px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 800;
        white-space: nowrap;
        margin-bottom: 2px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 1.5px solid ${isSelected ? '#38BDF8' : '#94A3B8'};
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 10;
      ">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #22C55E;"></span>
        <span>🛵 ${name}</span>
      </div>

      <!-- Center GPS Node -->
      <div style="
        width: ${isSelected ? '18px' : '14px'};
        height: ${isSelected ? '18px' : '14px'};
        background: #1B59F8;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        z-index: 10;
      "></div>
    </div>
  `,
  iconSize: [90, 44],
  iconAnchor: [45, 22],
  popupAnchor: [0, -22]
});

export const LiveFleetMap = ({ 
  activeDeliveries = [], 
  selectedDeliveryId = null, 
  onSelectDelivery = () => {},
  onViewDetails = null,
  isFullscreen = false,
  onToggleFullscreen = null
}) => {
  const [targetBounds, setTargetBounds] = useState(null);
  const [targetPosition, setTargetPosition] = useState(null);
  const [zoomTrigger, setZoomTrigger] = useState(0);
  const [isHudMinimized, setIsHudMinimized] = useState(false);

  const defaultCenter = [9.0200, 38.7700]; // Addis Ababa Central

  const selectedDelivery = useMemo(() => {
    return activeDeliveries.find(d => d.id === selectedDeliveryId) || activeDeliveries[0] || null;
  }, [activeDeliveries, selectedDeliveryId]);

  // Trigger camera refocus when selected delivery changes
  useEffect(() => {
    if (!selectedDelivery) return;

    if (selectedDelivery.routeCoordinates && selectedDelivery.routeCoordinates.length >= 2) {
      const bounds = L.latLngBounds(selectedDelivery.routeCoordinates);
      if (selectedDelivery.riderPosition) {
        bounds.extend(selectedDelivery.riderPosition);
      }
      setTargetBounds(bounds);
      setTargetPosition(null);
    } else if (selectedDelivery.riderPosition) {
      setTargetPosition(selectedDelivery.riderPosition);
      setTargetBounds(null);
    }
    setZoomTrigger(prev => prev + 1);
  }, [selectedDeliveryId]);

  // Fit view to all couriers
  const handleFitAll = () => {
    const allCoords = [];
    activeDeliveries.forEach(d => {
      if (d.riderPosition) allCoords.push(d.riderPosition);
      if (d.routeCoordinates?.[0]) allCoords.push(d.routeCoordinates[0]);
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      setTargetBounds(bounds);
      setTargetPosition(null);
      setZoomTrigger(prev => prev + 1);
    }
  };

  // Focus specifically on selected rider
  const handleFocusRider = () => {
    if (selectedDelivery?.riderPosition) {
      setTargetPosition(selectedDelivery.riderPosition);
      setTargetBounds(null);
      setZoomTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full min-h-[520px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative flex flex-col">
      {/* CSS Pulse Keyframes */}
      <style>{`
        @keyframes radarPing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Top Map Interactive Controls Bar */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex items-center justify-between pointer-events-none">
        {/* OpenStreetMap Indicator */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-md px-3 py-1.5 gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold text-slate-700">OpenStreetMap Live Tracking</span>
        </div>

        {/* Quick Action Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-md p-1">
          <button
            onClick={handleFocusRider}
            disabled={!selectedDelivery?.riderPosition}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
            title="Focus on Selected Rider"
          >
            <Crosshair className="w-4 h-4 text-brand-600" />
          </button>

          <button
            onClick={handleFitAll}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="Fit All Active Couriers on Screen"
          >
            <NavIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Fit All</span>
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-700" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Map Body Container */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <CameraController 
            targetPosition={targetPosition} 
            targetBounds={targetBounds} 
            zoomTrigger={zoomTrigger} 
          />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Active Deliveries & Couriers */}
          {activeDeliveries.map((delivery) => {
            const isSelected = delivery.id === selectedDeliveryId;
            const pickup = delivery.routeCoordinates?.[0] || [9.0054, 38.7885];
            const dest = delivery.routeCoordinates?.[delivery.routeCoordinates.length - 1] || [9.0345, 38.7512];
            const riderPos = delivery.riderPosition || pickup;

            return (
              <React.Fragment key={delivery.id}>
                {/* Pickup Marker */}
                <Marker position={pickup} icon={createPickupIcon()}>
                  <Popup>
                    <div className="text-xs p-1">
                      <span className="font-bold text-emerald-700 block">{delivery.id} • Pickup</span>
                      <p className="text-slate-800 font-medium">{delivery.pickupLocation}</p>
                      {delivery.pickupAddressDetail && (
                        <p className="text-slate-500 text-[11px]">{delivery.pickupAddressDetail}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">Sender: {delivery.customerName || 'Customer'}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Marker */}
                <Marker position={dest} icon={createDestIcon()}>
                  <Popup>
                    <div className="text-xs p-1">
                      <span className="font-bold text-rose-700 block">{delivery.id} • Destination</span>
                      <p className="text-slate-800 font-medium">{delivery.destination}</p>
                      {delivery.destinationAddressDetail && (
                        <p className="text-slate-500 text-[11px]">{delivery.destinationAddressDetail}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">Recipient: {delivery.receiverName || 'Recipient'}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Courier Live Marker */}
                {riderPos && (
                  <Marker 
                    position={riderPos} 
                    icon={createRiderPulseIcon(delivery.riderName || 'Courier', isSelected)}
                    eventHandlers={{
                      click: () => onSelectDelivery(delivery.id)
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-brand-700 text-sm">{delivery.riderName || 'Courier'}</strong>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700">
                            {delivery.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">Vehicle: {delivery.riderVehicle || 'Motorcycle'}</p>
                        {delivery.riderPhone && (
                          <p className="text-slate-600 text-[11px] font-mono">Phone: {delivery.riderPhone}</p>
                        )}
                        <p className="text-slate-400 text-[10px]">Order: {delivery.id}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Delivery Path Polyline */}
                {delivery.routeCoordinates && (
                  <>
                    {/* Outer glow for selected delivery */}
                    {isSelected && (
                      <Polyline
                        positions={delivery.routeCoordinates}
                        pathOptions={{
                          color: '#38BDF8',
                          weight: 8,
                          opacity: 0.45,
                          lineCap: 'round',
                          lineJoin: 'round'
                        }}
                      />
                    )}
                    <Polyline
                      positions={delivery.routeCoordinates}
                      pathOptions={{
                        color: isSelected ? '#1B59F8' : '#94A3B8',
                        weight: isSelected ? 4.5 : 2.5,
                        opacity: isSelected ? 0.95 : 0.45,
                        dashArray: isSelected ? '8, 8' : undefined
                      }}
                      eventHandlers={{
                        click: () => onSelectDelivery(delivery.id)
                      }}
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Floating Interactive Live Tracking HUD Overlay */}
      {selectedDelivery && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none transition-all duration-200">
          <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden p-3.5 sm:p-4">
            {/* Top row: Order identity, status, minimize */}
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE TRACKING</span>
                </div>
                <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide">
                  {selectedDelivery.id}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">• {selectedDelivery.itemType || 'Standard Package'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {selectedDelivery.status}
                </span>

                <button
                  onClick={() => setIsHudMinimized(prev => !prev)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isHudMinimized ? 'Expand HUD' : 'Minimize HUD'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable telemetry body */}
            {!isHudMinimized && (
              <div className="pt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Courier info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/30 border border-brand-500/40 text-brand-300 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {selectedDelivery.riderName || 'Assigning Courier...'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {selectedDelivery.riderVehicle || 'Motorcycle'} {selectedDelivery.riderPhone ? `• ${selectedDelivery.riderPhone}` : ''}
                    </p>
                  </div>
                </div>

                {/* Route points preview */}
                <div className="flex-1 max-w-md px-2 hidden lg:block">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="truncate max-w-[130px] font-medium text-emerald-400">
                      📍 {selectedDelivery.pickupLocation}
                    </span>
                    <span className="font-bold text-slate-300 text-[10px]">
                      {selectedDelivery.distance || '6.4 km'} • {selectedDelivery.estimatedTime || '15 mins'}
                    </span>
                    <span className="truncate max-w-[130px] font-medium text-rose-400">
                      🏁 {selectedDelivery.destination}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-brand-500 to-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: selectedDelivery.status === 'On the Way' ? '65%' : selectedDelivery.status === 'Picked Up' ? '35%' : '15%' }}
                    />
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 justify-end">
                  {selectedDelivery.riderPhone && (
                    <a
                      href={`tel:${selectedDelivery.riderPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700"
                      title="Call Courier"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  )}

                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(selectedDelivery.id.replace('#', ''))}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-brand-600/30 cursor-pointer"
                    >
                      <span>Full Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
