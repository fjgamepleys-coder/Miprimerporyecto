import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2, Navigation, Check } from 'lucide-react';

const SIBUNDOY_CENTER: [number, number] = [1.205, -76.921];
const SIBUNDOY_LABEL = 'Valle de Sibundoy, Putumayo';

interface DeliveryMapProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (location: DeliveryLocation) => void;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  label: string;
}

interface ReverseResult {
  display_name: string;
}

// Fix default marker icon paths for bundlers
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [map, center]);
  return null;
}

export function DeliveryMap({ open, onClose, onConfirm }: DeliveryMapProps) {
  const [position, setPosition] = useState<[number, number]>(SIBUNDOY_CENTER);
  const [address, setAddress] = useState<string>(SIBUNDOY_LABEL);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoadingAddr(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } },
      );
      if (res.ok) {
        const data: ReverseResult = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
          return;
        }
      }
    } catch {
      // network or rate-limit; fall back to coordinates
    }
    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)} — Valle de Sibundoy`);
    setLoadingAddr(false);
  }, []);

  const updatePosition = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);
      setConfirmed(false);
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      geocodeTimer.current = setTimeout(() => {
        reverseGeocode(lat, lng);
      }, 400);
    },
    [reverseGeocode],
  );

  useEffect(() => {
    if (open) {
      setPosition(SIBUNDOY_CENTER);
      setAddress(SIBUNDOY_LABEL);
      setConfirmed(false);
      setRecenterKey((k) => k + 1);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, []);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm({ lat: position[0], lng: position[1], label: address });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg animate-fade-in safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="tap-highlight flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:scale-90 transition"
            aria-label="Volver"
          >
            <span className="text-white text-lg">‹</span>
          </button>
          <h2 className="text-base font-bold text-white">Confirma tu ubicación</h2>
        </div>
        <button
          onClick={() => {
            setPosition(SIBUNDOY_CENTER);
            setRecenterKey((k) => k + 1);
            updatePosition(SIBUNDOY_CENTER[0], SIBUNDOY_CENTER[1]);
          }}
          className="tap-highlight flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-xs font-semibold text-white/70"
        >
          <Navigation size={14} className="text-primary" />
          Centro
        </button>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[240px]">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', background: '#0b1120' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const ll = m.getLatLng();
                updatePosition(ll.lat, ll.lng);
              },
            }}
          />
          <ClickHandler onClick={updatePosition} />
          <Recenter key={recenterKey} center={position} />
        </MapContainer>

        {/* Crosshair hint overlay */}
        <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-bg/90 px-3 py-1.5 text-xs text-white/70 shadow-lg backdrop-blur">
          Arrastra el marcador o toca el mapa
        </div>
      </div>

      {/* Bottom panel */}
      <div className="shrink-0 card-surface rounded-t-3xl px-5 pt-4 pb-6 border-t border-white/5">
        {/* Address */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <MapPin size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-0.5">Dirección de entrega</p>
            {loadingAddr ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-white/50" />
                <span className="text-sm text-white/50">Buscando dirección...</span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-white leading-snug">{address}</p>
            )}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={loadingAddr}
          className="tap-highlight w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {confirmed ? (
            <>
              <Check size={20} /> Ubicación confirmada
            </>
          ) : (
            <>
              <MapPin size={20} /> Confirmar ubicación de entrega
            </>
          )}
        </button>
      </div>
    </div>
  );
}
