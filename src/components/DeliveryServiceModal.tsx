import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Package, MapPin, Navigation, LocateFixed, Loader2, ChevronRight, MessageCircle, X, Check, User, Clock, Bike } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { SIBUNDOY_CENTER, MUNICIPIOS, type Municipio } from '@/data/appData';
import { formatCOP } from '@/hooks/useWallet';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makePickupIcon(): L.DivIcon {
  return L.divIcon({
    className: 'moss-pickup-pin',
    html: `<div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:#f97316;transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:3px solid rgba(255,255,255,0.85);
      box-shadow:0 4px 8px rgba(0,0,0,0.5);
    "><div style="width:8px;height:8px;border-radius:50%;background:#fff;transform:rotate(45deg);"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

function makeDeliveryIcon(): L.DivIcon {
  return L.divIcon({
    className: 'moss-delivery-pin',
    html: `<div style="
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      background:#10b981;transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:3px solid rgba(255,255,255,0.85);
      box-shadow:0 4px 8px rgba(0,0,0,0.5);
    "><div style="width:8px;height:8px;border-radius:50%;background:#fff;transform:rotate(45deg);"></div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  if (points.length === 2) {
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  return null;
}

type Step = 'detalle' | 'seguimiento';

interface DeliveryServiceModalProps {
  open: boolean;
  onClose: () => void;
  userDireccion?: string;
  userMunicipio?: Municipio;
}

export function DeliveryServiceModal({
  open,
  onClose,
  userDireccion,
  userMunicipio = 'Sibundoy',
}: DeliveryServiceModalProps) {
  const [step, setStep] = useState<Step>('detalle');
  const [recogida, setRecogida] = useState('');
  const [entrega, setEntrega] = useState('');
  const [destinoMunicipio, setDestinoMunicipio] = useState<Municipio>('Sibundoy');
  const [descripcion, setDescripcion] = useState('');
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Fake coordinates for tracking view (near center of Sibundoy)
  const recogidaCoords: [number, number] = userCoords ?? [1.2058, -76.9185];
  const entregaCoords: [number, number] = [1.2062, -76.9241];

  // Estimate fare based on municipality distance
  const sameMunicipio = destinoMunicipio === userMunicipio;
  const tarifaBase = 3000;
  const tarifaExtra = sameMunicipio ? 0 : 2000;
  const tarifa = tarifaBase + tarifaExtra;

  const canSolicitar = recogida.trim().length > 2 && entrega.trim().length > 2 && descripcion.trim().length > 2;

  const handleLocate = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(p);
        setRecogida('Mi ubicación actual (GPS)');
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const handleSolicitar = () => {
    if (!canSolicitar) return;
    setStep('seguimiento');
  };

  const handleClose = () => {
    setStep('detalle');
    setRecogida('');
    setEntrega('');
    setDescripcion('');
    setUserCoords(null);
    onClose();
  };

  const handleCancelar = () => {
    handleClose();
  };

  const whatsappMensajero = () => {
    const msg = encodeURIComponent(
      `*Moss - Mandados y Encomiendas*\n\n` +
      `Hola, soy el cliente de Moss y quiero contactar al mensajero asignado.\n\n` +
      `*Recoger en:* ${recogida}\n` +
      `*Entregar en:* ${entrega}, ${destinoMunicipio}\n` +
      `*Encargo:* ${descripcion}\n` +
      `*Tarifa:* ${formatCOP(tarifa)}`,
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={step === 'detalle' ? 'Mandados y Encomiendas' : undefined}>
      {step === 'detalle' ? (
        <DetalleEncargo
          recogida={recogida}
          setRecogida={setRecogida}
          entrega={entrega}
          setEntrega={setEntrega}
          destinoMunicipio={destinoMunicipio}
          setDestinoMunicipio={setDestinoMunicipio}
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          locating={locating}
          onLocate={handleLocate}
          tarifa={tarifa}
          canSolicitar={canSolicitar}
          onSolicitar={handleSolicitar}
          userDireccion={userDireccion}
        />
      ) : (
        <SeguimientoEncargo
          recogida={recogida}
          entrega={entrega}
          destinoMunicipio={destinoMunicipio}
          descripcion={descripcion}
          tarifa={tarifa}
          recogidaCoords={recogidaCoords}
          entregaCoords={entregaCoords}
          onWhatsApp={whatsappMensajero}
          onCancelar={handleCancelar}
        />
      )}
    </BottomSheet>
  );
}

function DetalleEncargo({
  recogida,
  setRecogida,
  entrega,
  setEntrega,
  destinoMunicipio,
  setDestinoMunicipio,
  descripcion,
  setDescripcion,
  locating,
  onLocate,
  tarifa,
  canSolicitar,
  onSolicitar,
  userDireccion,
}: {
  recogida: string;
  setRecogida: (v: string) => void;
  entrega: string;
  setEntrega: (v: string) => void;
  destinoMunicipio: Municipio;
  setDestinoMunicipio: (v: Municipio) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  locating: boolean;
  onLocate: () => void;
  tarifa: number;
  canSolicitar: boolean;
  onSolicitar: () => void;
  userDireccion?: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15">
          <Package size={26} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Envío de paquetes, compras y encargos</p>
          <p className="text-xs text-white/45 mt-0.5">Mensajero a domicilio en el Valle de Sibundoy</p>
        </div>
      </div>

      {/* Punto de recogida */}
      <div>
        <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
          Punto de recogida
        </label>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-emerald/50">
            <MapPin size={18} className="text-accent shrink-0" />
            <input
              type="text"
              placeholder="Ej: Calle 4 # 6-32, Sibundoy"
              value={recogida}
              onChange={(e) => setRecogida(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/30"
            />
          </div>
          <button
            onClick={onLocate}
            disabled={locating}
            className="tap-highlight shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/15 border border-emerald/30 active:scale-90 transition"
            aria-label="Mi ubicación actual"
          >
            {locating ? (
              <Loader2 size={18} className="text-emerald animate-spin" />
            ) : (
              <LocateFixed size={18} className="text-emerald" />
            )}
          </button>
        </div>
        {userDireccion && (
          <button
            onClick={() => setRecogida(userDireccion)}
            className="tap-highlight mt-1.5 text-[11px] text-emerald font-semibold"
          >
            Usar mi dirección guardada: {userDireccion}
          </button>
        )}
      </div>

      {/* Punto de entrega */}
      <div>
        <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
          Punto de entrega (destino)
        </label>
        <div className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-emerald/50">
          <Navigation size={18} className="text-emerald shrink-0" />
          <input
            type="text"
            placeholder="Ej: Carrera 3 # 8-15"
            value={entrega}
            onChange={(e) => setEntrega(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/30"
          />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
          {MUNICIPIOS.map((m) => (
            <button
              key={m}
              onClick={() => setDestinoMunicipio(m)}
              className={`tap-highlight shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                destinoMunicipio === m
                  ? 'bg-emerald text-white'
                  : 'bg-surface-2 text-white/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Descripción del encargo */}
      <div>
        <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
          ¿Qué paquete o encargo vamos a llevar?
        </label>
        <textarea
          placeholder="Ej: Un documento, recoger un encargo en la tienda, un paquete cerrado..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-emerald/50 text-white text-sm font-semibold outline-none placeholder:text-white/30 resize-none"
        />
      </div>

      {/* Tarifa estimada */}
      <div className="rounded-2xl bg-surface-2 px-4 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40">Tarifa estimada</p>
          <p className="text-2xl font-black text-emerald">{formatCOP(tarifa)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">Tiempo de recogida</p>
          <p className="text-sm font-bold text-white">5-10 min</p>
        </div>
      </div>

      {/* Botón solicitar */}
      <button
        onClick={onSolicitar}
        disabled={!canSolicitar}
        className="tap-highlight w-full rounded-2xl bg-emerald py-4 text-base font-bold text-white shadow-lg shadow-emerald/30 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        Solicitar mensajero <ChevronRight size={20} />
      </button>
    </div>
  );
}

function SeguimientoEncargo({
  recogida,
  entrega,
  destinoMunicipio,
  descripcion,
  tarifa,
  recogidaCoords,
  entregaCoords,
  onWhatsApp,
  onCancelar,
}: {
  recogida: string;
  entrega: string;
  destinoMunicipio: Municipio;
  descripcion: string;
  tarifa: number;
  recogidaCoords: [number, number];
  entregaCoords: [number, number];
  onWhatsApp: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Header de confirmación */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald/15">
          <Check size={24} className="text-emerald" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Mensajero en camino</p>
          <p className="text-xs text-white/45">Recogida estimada: 5 minutos</p>
        </div>
      </div>

      {/* Mapa de seguimiento */}
      <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-emerald/15">
        <MapContainer
          center={SIBUNDOY_CENTER}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#0a0f0c' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={recogidaCoords} icon={makePickupIcon()}>
            <Popup>Punto de recogida</Popup>
          </Marker>
          <Marker position={entregaCoords} icon={makeDeliveryIcon()}>
            <Popup>Punto de entrega</Popup>
          </Marker>
          <FitBounds points={[recogidaCoords, entregaCoords]} />
        </MapContainer>
      </div>

      {/* Tarjeta del mensajero */}
      <div className="card-emerald rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/20">
            <User size={24} className="text-emerald" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/40 uppercase tracking-wide">Repartidor asignado</p>
            <p className="text-sm font-bold text-white">Jorge Tandioy</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Bike size={13} className="text-emerald" />
              <span className="text-[11px] text-white/50">Mototaxi · Placa ABC12D</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Clock size={13} className="text-emerald" />
              <span className="text-sm font-bold text-emerald">5 min</span>
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">recogida</p>
          </div>
        </div>

        {/* Detalles del encargo */}
        <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-accent font-bold w-16 shrink-0">Recoger</span>
            <span className="text-white/70">{recogida}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald font-bold w-16 shrink-0">Entregar</span>
            <span className="text-white/70">{entrega}, {destinoMunicipio}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold-light font-bold w-16 shrink-0">Encargo</span>
            <span className="text-white/70">{descripcion}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-white/40">Tarifa</span>
            <span className="font-bold text-white">{formatCOP(tarifa)}</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2.5">
        <button
          onClick={onWhatsApp}
          className="tap-highlight w-full rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2.5"
        >
          <MessageCircle size={22} /> Contactar por WhatsApp
        </button>
        <button
          onClick={onCancelar}
          className="tap-highlight w-full rounded-2xl bg-surface-2 border border-red-500/30 py-4 text-base font-bold text-red-400 flex items-center justify-center gap-2.5"
        >
          <X size={20} /> Cancelar encargo
        </button>
      </div>
    </div>
  );
}
