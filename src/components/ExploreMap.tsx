import { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Loader2, AlertTriangle } from 'lucide-react';
import { SIBUNDOY_CENTER, LOCALES_DESTACADOS, type LocalDestacado } from '@/data/appData';

interface ExploreMapProps {
  onSelectLocal?: (local: LocalDestacado) => void;
}

// Fix default Leaflet icon paths (broken in bundlers like Vite)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored pin for local allies
function makePinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'moss-explore-pin',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:3px solid rgba(255,255,255,0.85);
      box-shadow:0 4px 10px rgba(0,0,0,0.5);
    "><div style="
      width:8px;height:8px;border-radius:50%;
      background:#fff;transform:rotate(45deg);
    "></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Custom highlighted user marker
function makeUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'moss-user-pin',
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:#3b82f6;border:3px solid #fff;
      box-shadow:0 0 0 5px rgba(59,130,246,0.35),0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

// Component to imperatively fly the map
function FlyTo({ center, zoom, trigger }: { center: [number, number]; zoom: number; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [map, center, zoom, trigger]);
  return null;
}

export function ExploreMap({ onSelectLocal }: ExploreMapProps) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flyTrigger, setFlyTrigger] = useState(0);
  const [flyTarget, setFlyTarget] = useState<[number, number]>(SIBUNDOY_CENTER);
  const [mapReady, setMapReady] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLocate = useCallback(() => {
    setError(null);
    setLocating(true);

    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta GPS');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        setFlyTarget(p);
        setFlyTrigger((t) => t + 1);
        setLocating(false);
      },
      (err) => {
        let msg = 'No se pudo obtener tu ubicación';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permiso denegado. Activa el GPS en los ajustes de tu navegador.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'El GPS está apagado o no disponible. Actívalo e inténtalo de nuevo.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'El GPS tardó demasiado. Inténtalo de nuevo.';
        }
        setError(msg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  // Auto-clear error after 4s
  useEffect(() => {
    if (error) {
      errorTimerRef.current = setTimeout(() => setError(null), 4000);
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [error]);

  const handlePinClick = (local: LocalDestacado) => {
    setFlyTarget(local.coords);
    setFlyTrigger((t) => t + 1);
  };

  return (
    <div className="px-4">
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <span className="weave-divider w-6 h-3 rounded-sm" />
        Explora el Valle de Sibundoy
      </h2>

      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-emerald/15 shadow-lg">
        <MapContainer
          center={SIBUNDOY_CENTER}
          zoom={14}
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
              eventHandlers={{ click: () => handlePinClick(local) }}
            >
              <Popup className="moss-popup">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{local.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{local.tipo} · {local.tiempoEntrega}</p>
                  <button
                    onClick={() => onSelectLocal?.(local)}
                    className="mt-2 w-full rounded-lg bg-emerald px-3 py-2 text-xs font-bold text-white shadow"
                  >
                    Ver menú
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {userPos && (
            <Marker position={userPos} icon={makeUserIcon()}>
              <Popup className="moss-popup">
                <p className="text-sm font-bold text-blue-600 text-center">Estás aquí</p>
              </Popup>
            </Marker>
          )}

          {mapReady && <FlyTo center={flyTarget} zoom={16} trigger={flyTrigger} />}
        </MapContainer>

        {/* Floating GPS button */}
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

        {/* Error toast */}
        {error && (
          <div className="absolute bottom-3 left-3 right-3 z-[500] flex items-start gap-2 rounded-xl bg-red-950/95 border border-red-500/40 px-3 py-2.5 animate-fade-in shadow-xl">
            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-100 flex-1">{error}</p>
          </div>
        )}
      </div>

      {/* Helper hint */}
      <p className="text-[11px] text-white/30 mt-2 text-center">
        Toca un pin para ver el local o usa el botón de GPS para ubicarte
      </p>
    </div>
  );
}
