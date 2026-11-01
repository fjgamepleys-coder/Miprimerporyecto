import { Download, Smartphone } from 'lucide-react';

interface InstallBannerProps {
  canInstall: boolean;
  isInstalled: boolean;
  onInstall: () => void;
}

export function InstallBanner({ canInstall, isInstalled, onInstall }: InstallBannerProps) {
  if (isInstalled || !canInstall) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-primary to-accent p-[1px] animate-fade-in">
      <div className="rounded-2xl bg-surface px-4 py-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Smartphone size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">Instalar aplicación en el celular</p>
          <p className="text-xs text-white/50 mt-0.5">Acceso rápido desde tu pantalla de inicio</p>
        </div>
        <button
          onClick={onInstall}
          className="tap-highlight flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30"
        >
          <Download size={16} />
          Instalar
        </button>
      </div>
    </div>
  );
}

interface InstallFabProps {
  canInstall: boolean;
  isInstalled: boolean;
  onInstall: () => void;
}

export function InstallFab({ canInstall, isInstalled, onInstall }: InstallFabProps) {
  if (isInstalled || !canInstall) return null;

  return (
    <button
      onClick={onInstall}
      className="tap-highlight fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl shadow-primary/40 active:scale-95"
    >
      <Download size={18} />
      Instalar app
    </button>
  );
}
