import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-app card-surface rounded-3xl animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:scale-90 transition"
            aria-label="Cerrar"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>
        <div className="px-5 pb-5 pt-2 max-h-[80vh] overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
