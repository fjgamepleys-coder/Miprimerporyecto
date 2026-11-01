import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-app card-surface rounded-t-3xl animate-slide-up safe-bottom shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          {title && <h2 className="text-lg font-bold text-white pt-2">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:scale-90 transition"
            aria-label="Cerrar"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>
        <div className="px-5 pb-6 pt-3 max-h-[80vh] overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
