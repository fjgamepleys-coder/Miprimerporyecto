import { useState } from 'react';
import { MapPin, User, ChevronRight, Store, ShieldCheck } from 'lucide-react';
import { MUNICIPIOS, type Municipio } from '@/data/appData';
import { BusinessAuthModal } from './BusinessAuthModal';

interface OnboardingProps {
  onLogin: (method: 'google' | 'phone', phone?: string) => void;
  onCompleteProfile: (nombre: string, municipio: string, direccion: string) => void;
  loginMethod: 'google' | 'phone' | null;
  onBusinessAuthorized: () => void;
}

export function Onboarding({ onLogin, onCompleteProfile, loginMethod, onBusinessAuthorized }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'profile'>('welcome');
  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState<Municipio>('Sibundoy');
  const [direccion, setDireccion] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  /* ---- Welcome screen: two buttons only ---- */
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-bg flex flex-col justify-center px-6 py-10 safe-top safe-bottom">
        <div className="weave-divider mx-8 mb-8" />

        {/* Logo / identity */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-emerald/20 animate-pulse-ring" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald to-gold-dark">
              <span className="text-3xl font-black text-white font-display">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white font-display tracking-tight">Moss</h1>
          <p className="text-sm text-gold-light mt-2 font-medium">Domicilios del Valle de Sibundoy</p>
          <p className="text-xs text-white/40 mt-1 max-w-xs">
            Cultura Kamëntsá e Inga, directo a tu puerta
          </p>
        </div>

        {/* Two entry buttons */}
        <div className="space-y-3 max-w-sm w-full mx-auto">
          <button
            onClick={() => {
              onLogin('google');
              setStep('profile');
            }}
            className="tap-highlight w-full rounded-2xl bg-emerald py-4 text-base font-bold text-white shadow-xl shadow-emerald/30 flex items-center justify-center gap-2.5"
          >
            <ChevronRight size={20} />
            Continuar como Cliente
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="tap-highlight w-full rounded-2xl bg-surface-2 border border-gold/25 py-4 text-base font-bold text-gold-light flex items-center justify-center gap-2.5"
          >
            <Store size={20} />
            ¿Tienes un negocio? Soy Comercio Aliado
          </button>
        </div>

        <p className="text-center text-xs text-white/30 mt-6 max-w-xs mx-auto">
          Al continuar aceptas los términos de servicio y la política de privacidad de Moss.
        </p>

        <div className="weave-divider mx-8 mt-8" />

        <BusinessAuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthorized={() => {
            setAuthModalOpen(false);
            onBusinessAuthorized();
          }}
        />
      </div>
    );
  }

  /* ---- Profile completion (required) ---- */
  return (
    <div className="min-h-screen bg-bg flex flex-col px-6 py-8 safe-top safe-bottom overflow-y-auto no-scrollbar">
      <div className="weave-divider mx-4 mb-6" />

      <h2 className="text-2xl font-bold text-white font-display mb-1 mt-2">Completa tu perfil</h2>
      <p className="text-sm text-white/50 mb-6">
        Necesitamos estos datos para entregarte tus pedidos. Son obligatorios.
      </p>

      <div className="space-y-4 max-w-sm w-full mx-auto pb-8">
        {/* Nombre */}
        <div>
          <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
            Nombre completo
          </label>
          <div className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-emerald/50">
            <User size={18} className="text-emerald shrink-0" />
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Municipio */}
        <div>
          <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
            Municipio
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MUNICIPIOS.map((m) => (
              <button
                key={m}
                onClick={() => setMunicipio(m)}
                className={`tap-highlight rounded-xl py-3 text-sm font-semibold transition ${
                  municipio === m
                    ? 'bg-emerald text-white shadow-lg shadow-emerald/20'
                    : 'bg-surface-2 text-white/60'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
            Dirección / Referencia
          </label>
          <div className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-emerald/50">
            <MapPin size={18} className="text-emerald shrink-0" />
            <input
              type="text"
              placeholder="Ej: Calle 4 # 6-32, vereda San Antonio"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (nombre.trim() && municipio && direccion.trim()) {
              onCompleteProfile(nombre.trim(), municipio, direccion.trim());
            }
          }}
          disabled={!nombre.trim() || !direccion.trim()}
          className="tap-highlight w-full rounded-2xl bg-emerald py-4 text-base font-bold text-white shadow-lg shadow-emerald/30 disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
        >
          Comenzar a pedir <ChevronRight size={18} />
        </button>
      </div>

      <div className="weave-divider mx-4 mt-2" />
    </div>
  );
}
