import { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, Clock, ChevronRight, LocateFixed, Loader2 } from 'lucide-react';
import { SIBUNDOY_CENTER, LOCALES_DESTACADOS, type LocalDestacado } from '@/data/appData';

interface MainMapProps {
  onSelectLocal?: (local: LocalDestacado) => void;
}

function makePinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'moss-pin',
    html: `<div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:${color};
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:3px solid rgba(255,255,255,0.85);
      box-shadow:0 4px 10px rgba(0,0,0,0.5);
    "><div style="
      width:10px;height:10px;border-radius:50%;
      background:#fff;transform:rotate(45deg);
    "></div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function makeUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'moss-user-pin',
    html: `<div style="
      width:20px;height:20px;border-radius:50%;
      background:#3b82f6;border:3px solid #fff;
      box-shadow:0 0 0 4px rgba(59,130,246,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function Recenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [map, center, zoom]);
  return null;
}

export function MainMap({ onSelectLocal }: MainMapProps) {
  const [selected, setSelected] = useState<LocalDestacado | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [recenterTarget, setRecenterTarget] = useState<[number, number]>(SIBUNDOY_CENTER);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleLocate = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        setRecenterTarget(p);
        setRecenterKey((k) => k + 1);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const handleSelectLocal = (local: LocalDestacado) => {
    setSelected(local);
    setRecenterTarget(local.coords);
    setRecenterKey((k) => k + 1);
  };

  return (
    <div className="relative h-[260px] w-full rounded-2xl overflow-hidden border border-emerald/15 mx-4">
      <MapContainer
        center={SIBUNDOY_CENTER}
        zoom={15}
        scrollWheelZoom={false}
        whenReady={() => setMapReady(true)}
        style={{ height: '100%', width: '100%', background: '#0a0f0c' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {LOCALES_DESTACADOS.map((local) => (
          <Marker
            key={local.id}
            position={local.coords}
            icon={makePinIcon(local.accentColor)}
            eventHandlers={{ click: () => handleSelectLocal(local) }}
          />
        ))}
        {userPos && <Marker position={userPos} icon={makeUserIcon()} />}
        {mapReady && <Recenter key={recenterKey} center={recenterTarget} zoom={16} />}
      </MapContainer>

      {/* Locate button */}
      <button
        onClick={handleLocate}
        className="absolute top-3 right-3 z-[500] flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-emerald/30 shadow-lg tap-highlight"
        aria-label="Mi ubicación actual"
      >
        {locating ? (
          <Loader2 size={18} className="text-emerald animate-spin" />
        ) : (
          <LocateFixed size={18} className="text-emerald" />
        )}
      </button>

      {/* Hint overlay */}
      <div className="pointer-events-none absolute top-3 left-3 z-[500] rounded-full bg-bg/90 px-3 py-1.5 text-[11px] text-cream/80 shadow-lg backdrop-blur">
        Toca un pin del local
      </div>

      {/* Floating local card */}
      {selected && (
        <div
          ref={cardRef}
          className="absolute bottom-3 left-3 right-3 z-[500] card-emerald rounded-2xl p-3 flex items-center gap-3 animate-slide-up shadow-2xl"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${selected.accentColor}25` }}
          >
            {(() => {
              const Icon = selected.icon;
              return <Icon size={26} style={{ color: selected.accentColor }} />;
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{selected.nombre}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] text-white/50">
                <Star size={11} className="text-warning fill-warning" fill="currentColor" />
                {selected.calificacion}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white/50">
                <Clock size={11} className="text-emerald" /> {selected.tiempoEntrega}
              </span>
            </div>
          </div>
          <button
            onClick={() => onSelectLocal?.(selected)}
            className="tap-highlight shrink-0 flex items-center gap-1 rounded-xl bg-emerald px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald/30"
          >
            Ver menú y pedir
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
