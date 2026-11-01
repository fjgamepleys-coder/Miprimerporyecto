import { ChevronDown, Wallet, MapPin, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MUNICIPIOS, type Municipio } from '@/data/appData';

interface TopBarProps {
  municipio: Municipio;
  onMunicipioChange: (m: Municipio) => void;
  formattedBalance: string;
  onRecharge: () => void;
  onLogout: () => void;
}

export function TopBar({ municipio, onMunicipioChange, formattedBalance, onRecharge, onLogout }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  return (
    <div className="sticky top-0 z-30 safe-top bg-bg/95 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Municipio selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="tap-highlight flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2.5"
          >
            <MapPin size={16} className="text-emerald" />
            <span className="text-sm font-semibold text-white">{municipio}</span>
            <ChevronDown
              size={16}
              className={`text-white/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-44 card-surface rounded-2xl shadow-2xl animate-scale-in overflow-hidden z-50">
              {MUNICIPIOS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onMunicipioChange(m);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-sm transition ${
                    m === municipio ? 'text-emerald font-semibold' : 'text-white/70 active:bg-white/5'
                  }`}
                >
                  <MapPin size={15} className={m === municipio ? 'text-emerald' : 'text-white/30'} />
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Wallet */}
          <button
            onClick={onRecharge}
            className="tap-highlight flex items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald to-emerald-dark">
              <Wallet size={15} className="text-white" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wide text-white/40 leading-none">Saldo</span>
              <span className="block text-sm font-bold text-white leading-tight">{formattedBalance}</span>
            </div>
          </button>

          {/* Logout / back to home */}
          <button
            onClick={onLogout}
            className="tap-highlight flex items-center justify-center rounded-xl bg-surface-2 px-2.5 py-2.5 text-white/50 hover:text-danger"
            aria-label="Cerrar sesión y volver al inicio"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
