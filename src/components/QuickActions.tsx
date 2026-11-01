import { useState } from 'react';
import { ChevronRight, MapPin, Clock, X, Camera } from 'lucide-react';
import { QUICK_ACTIONS } from '@/data/appData';
import { BottomSheet } from './BottomSheet';
import { DeliveryServiceModal } from './DeliveryServiceModal';
import type { Municipio } from '@/data/appData';

interface QuickActionsProps {
  municipio: Municipio;
}

export function QuickActions({ municipio }: QuickActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const action = QUICK_ACTIONS.find((a) => a.id === activeAction);

  return (
    <>
      <div className="px-4">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span className="weave-divider w-6 h-3 rounded-sm" />
          Servicios
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x-carousel pb-1 -mx-4 px-4">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setActiveAction(a.id)}
                className="snap-item shrink-0 w-32 card-surface rounded-2xl p-3.5 flex flex-col items-center gap-2.5 text-center tap-highlight"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: a.bgColor }}
                >
                  <Icon size={28} style={{ color: a.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{a.shortLabel}</p>
                  <p className="text-[11px] text-white/45 mt-0.5">{a.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {action?.id === 'restaurantes' && (
        <RestaurantesSheet open onClose={() => setActiveAction(null)} municipio={municipio} />
      )}
      {action?.id === 'farmacia' && (
        <FarmaciaSheet open onClose={() => setActiveAction(null)} municipio={municipio} />
      )}
      {action?.id === 'mandados' && (
        <DeliveryServiceModal
          open
          onClose={() => setActiveAction(null)}
          userMunicipio={municipio}
        />
      )}
      {action?.id === 'licores' && (
        <SimpleServiceSheet
          open
          onClose={() => setActiveAction(null)}
          title="Licores a domicilio"
          municipio={municipio}
          descripcion="Pide cerveza, aguardiente, ron y más. Entrega con verificación de edad (mayores de 18)."
          accentColor="#d4a017"
        />
      )}
      {action?.id === 'mercado' && (
        <SimpleServiceSheet
          open
          onClose={() => setActiveAction(null)}
          title="Mercado a domicilio"
          municipio={municipio}
          descripcion="Compra tu mercado y te lo llevamos. Arroz, aceite, huevos, papa y todo lo que necesites."
          accentColor="#34d399"
        />
      )}
    </>
  );
}

function RestaurantesSheet({
  open,
  onClose,
  municipio,
}: {
  open: boolean;
  onClose: () => void;
  municipio: Municipio;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Restaurantes y Comida">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <MapPin size={14} className="text-emerald" />
          Entregando en: <span className="font-semibold text-white/70">{municipio}</span>
        </div>
        <p className="text-sm text-white/60">
          Explora los restaurantes disponibles cerca de ti. Selecciona uno para ver su menú completo
          y hacer tu pedido a domicilio.
        </p>
        <div className="rounded-2xl bg-emerald/10 border border-emerald/20 p-4 mt-2">
          <p className="text-sm font-semibold text-emerald">Asadero El Valle</p>
          <p className="text-xs text-white/50 mt-0.5">Pollo asado, bandeja paisa y más</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/50">
            <Clock size={13} /> 15-25 min
          </div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="text-sm font-semibold text-white">Pizzería Sibundoy</p>
          <p className="text-xs text-white/50 mt-0.5">Pizzas familiares y personales</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/50">
            <Clock size={13} /> 20-30 min
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function FarmaciaSheet({
  open,
  onClose,
  municipio,
}: {
  open: boolean;
  onClose: () => void;
  municipio: Municipio;
}) {
  const [recetaUploaded, setRecetaUploaded] = useState(false);

  return (
    <BottomSheet open={open} onClose={onClose} title="Farmacia y Urgencias">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <MapPin size={14} className="text-danger" />
          Entregando en: <span className="font-semibold text-white/70">{municipio}</span>
        </div>
        <div className="rounded-2xl bg-danger/10 border border-danger/20 p-4">
          <div className="flex items-start gap-3">
            <X size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Servicio de Urgencias</p>
              <p className="text-xs text-white/50 mt-1">
                Medicamentos de entrega prioritaria. Disponible 24/7 en caso de emergencia.
              </p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/80 mb-2">Foto de receta médica</p>
          <button
            onClick={() => setRecetaUploaded(true)}
            disabled={recetaUploaded}
            className={`tap-highlight w-full rounded-2xl border-2 border-dashed py-6 flex flex-col items-center gap-2 transition ${
              recetaUploaded ? 'border-emerald/40 bg-emerald/5' : 'border-white/15 active:border-danger/50'
            }`}
          >
            {recetaUploaded ? (
              <>
                <Camera size={26} className="text-emerald" />
                <span className="text-sm font-semibold text-emerald">Receta adjuntada</span>
                <span className="text-xs text-white/40">Procesando tu orden...</span>
              </>
            ) : (
              <>
                <Camera size={26} className="text-white/40" />
                <span className="text-sm font-semibold text-white/70">Subir foto de la receta</span>
                <span className="text-xs text-white/30">Toma una foto legible de tu receta</span>
              </>
            )}
          </button>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="text-sm font-semibold text-white">Droguería Buen Salud</p>
          <p className="text-xs text-white/50 mt-0.5">Medicamentos y productos de farmacia</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/50">
            <Clock size={13} /> 15-25 min
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

function SimpleServiceSheet({
  open,
  onClose,
  title,
  municipio,
  descripcion,
  accentColor,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  municipio: Municipio;
  descripcion: string;
  accentColor: string;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <MapPin size={14} style={{ color: accentColor }} />
          Entregando en: <span className="font-semibold text-white/70">{municipio}</span>
        </div>
        <p className="text-sm text-white/60">{descripcion}</p>
        <div className="rounded-2xl bg-surface-2 p-4 flex items-center gap-2">
          <Clock size={16} style={{ color: accentColor }} />
          <span className="text-sm text-white/70">Tiempo estimado: 20-40 min</span>
        </div>
        <button
          onClick={onClose}
          className="tap-highlight w-full rounded-2xl py-4 text-base font-bold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          Entendido <ChevronRight size={18} />
        </button>
      </div>
    </BottomSheet>
  );
}
