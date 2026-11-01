import { useState } from 'react';
import { ArrowLeft, Bike, MapPin, Navigation, Wallet, Check } from 'lucide-react';
import { DEMO_CARRERAS, type DemoCarrera } from '@/data/appData';
import { formatCOP } from '@/hooks/useWallet';

interface DeliveryDriverPanelProps {
  onBack: () => void;
  walletBalance: number;
}

export function DeliveryDriverPanel({ onBack, walletBalance }: DeliveryDriverPanelProps) {
  const [available, setAvailable] = useState(false);
  const [carreras, setCarreras] = useState<DemoCarrera[]>(DEMO_CARRERAS);
  const [accepted, setAccepted] = useState<string | null>(null);

  const handleAccept = (id: string) => {
    setAccepted(id);
    setCarreras((prev) => prev.filter((c) => c.id !== id));
  };

  const openRoute = (coords: [number, number]) => {
    window.open(`https://www.openstreetmap.org/?mlat=${coords[0]}&mlon=${coords[1]}#map=17/${coords[0]}/${coords[1]}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="weave-border-bottom px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="tap-highlight flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:scale-90 transition"
          aria-label="Volver"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15">
            <Bike size={18} className="text-emerald" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Panel del Repartidor</h1>
            <p className="text-[11px] text-white/40">Conductor de mototaxi</p>
          </div>
        </div>
      </div>

      {/* Status + wallet */}
      <div className="px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setAvailable((v) => !v)}
          className={`tap-highlight flex items-center gap-2.5 rounded-2xl px-4 py-3 transition ${
            available ? 'bg-emerald/15 border border-emerald/30' : 'bg-surface-2 border border-white/10'
          }`}
        >
          <span
            className={`relative flex h-6 w-6 items-center justify-center rounded-full transition ${
              available ? 'bg-emerald' : 'bg-white/15'
            }`}
          >
            {available && (
              <span className="absolute inset-0 rounded-full bg-emerald/40 animate-pulse-ring" />
            )}
            <span className={`relative text-xs font-bold ${available ? 'text-white' : 'text-white/40'}`}>
              {available ? 'ON' : 'OFF'}
            </span>
          </span>
          <span className="text-sm font-bold text-white">
            {available ? 'Disponible' : 'Desconectado'}
          </span>
        </button>

        <div className="flex-1 flex items-center gap-2.5 rounded-2xl bg-surface-2 border border-white/10 px-4 py-3">
          <Wallet size={16} className="text-gold-light shrink-0" />
          <div>
            <span className="block text-[10px] uppercase tracking-wide text-white/40 leading-none">Tiquetera</span>
            <span className="block text-sm font-bold text-white leading-tight">{formatCOP(walletBalance)}</span>
          </div>
        </div>
      </div>

      {/* Available orders */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        <div className="flex items-center justify-between mb-3 pt-1">
          <h2 className="text-sm font-bold text-white">Bolsa de carreras</h2>
          <span className="text-xs text-white/40">{carreras.length} disponibles</span>
        </div>

        {!available && (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-white/5 mb-4">
              <Bike size={32} className="text-white/30" />
            </div>
            <p className="text-sm text-white/50">Estás desconectado</p>
            <p className="text-xs text-white/30 mt-1">Activa el interruptor para ver carreras disponibles</p>
          </div>
        )}

        {available && carreras.length === 0 && (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald/10 mb-4">
              <Check size={32} className="text-emerald" />
            </div>
            <p className="text-sm text-white/50">No hay carreras disponibles ahora</p>
            <p className="text-xs text-white/30 mt-1">Te avisaremos cuando llegue un nuevo pedido</p>
          </div>
        )}

        {available &&
          carreras.map((carrera) => (
            <div key={carrera.id} className="card-surface rounded-2xl p-4 mb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-accent" />
                  <span className="text-sm font-bold text-white">{carrera.local}</span>
                </div>
                <span className="text-sm font-bold text-emerald">{formatCOP(carrera.domicilio)}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-16 shrink-0">Recoger</span>
                  <span className="text-white/80">{carrera.local}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-16 shrink-0">Entregar</span>
                  <span className="text-white/80">{carrera.entrega}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 w-16 shrink-0">Cliente</span>
                  <span className="text-white/80">{carrera.cliente}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openRoute(carrera.coords)}
                  className="tap-highlight flex-1 rounded-xl bg-surface-2 border border-white/10 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  <Navigation size={15} className="text-accent" /> Ruta
                </button>
                <button
                  onClick={() => handleAccept(carrera.id)}
                  className="tap-highlight flex-[1.5] rounded-xl bg-emerald py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald/20"
                >
                  Aceptar carrera
                </button>
              </div>
            </div>
          ))}

        {accepted && (
          <div className="card-emerald rounded-2xl p-4 mt-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-emerald" />
              <p className="text-sm font-semibold text-white">¡Carrera aceptada!</p>
            </div>
            <p className="text-xs text-white/50 mt-1">Dirígete al punto de recogida. Revisa la ruta en el mapa.</p>
          </div>
        )}
      </div>
    </div>
  );
}
