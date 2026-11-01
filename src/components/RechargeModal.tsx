import { useState, useRef } from 'react';
import { Plus, ImagePlus, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { Modal } from './Modal';
import { formatCOP, useWallet } from '@/hooks/useWallet';
import { QUICK_RECHARGE_AMOUNTS } from '@/data/appData';

interface RechargeModalProps {
  open: boolean;
  onClose: () => void;
  wallet: ReturnType<typeof useWallet>;
}

export function RechargeModal({ open, onClose, wallet }: RechargeModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [comprobanteUploaded, setComprobanteUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalAmount = customAmount ? Math.max(0, parseInt(customAmount) || 0) : selectedAmount ?? 0;

  const reset = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setComprobanteUploaded(false);
    setProcessing(false);
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSimulateComprobante = () => {
    setComprobanteUploaded(true);
  };

  const handleConfirm = () => {
    if (finalAmount <= 0 || !comprobanteUploaded) return;
    setProcessing(true);
    setTimeout(() => {
      wallet.recharge(finalAmount);
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1600);
    }, 1200);
  };

  return (
    <Modal open={open} onClose={handleClose} title="Recargar saldo">
      {success ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 mb-4">
            <CheckCircle2 size={36} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-white">¡Saldo acreditado!</h3>
          <p className="text-sm text-white/50 mt-1">
            Se añadieron {formatCOP(finalAmount)} a tu billetera.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Quick amounts */}
          <div>
            <p className="text-sm font-semibold text-white/80 mb-3">Selecciona un monto rápido</p>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_RECHARGE_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`tap-highlight rounded-2xl py-3.5 text-center font-bold transition ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-surface-2 text-white/70'
                  }`}
                >
                  {formatCOP(amt).replace(' COP', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-sm font-semibold text-white/80 mb-2">O ingresa otro valor</p>
            <div className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3.5">
              <span className="text-white/40 text-sm">$</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="flex-1 bg-transparent text-white text-base font-semibold outline-none placeholder:text-white/30"
              />
              <span className="text-white/40 text-sm">COP</span>
            </div>
          </div>

          {/* Transfer info */}
          <div className="rounded-2xl bg-accent/10 border border-accent/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-accent" />
              <p className="text-sm font-semibold text-white">Transfiere por Nequi o Daviplata</p>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Realiza la transferencia al número de la plataforma y luego adjunta el comprobante.
              El saldo se acreditará automáticamente tras la verificación.
            </p>
          </div>

          {/* Comprobante upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSimulateComprobante}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={comprobanteUploaded}
              className={`tap-highlight w-full rounded-2xl border-2 border-dashed py-5 flex flex-col items-center gap-2 transition ${
                comprobanteUploaded
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-white/15 active:border-primary/50'
              }`}
            >
              {comprobanteUploaded ? (
                <>
                  <CheckCircle2 size={28} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">Comprobante adjuntado</span>
                </>
              ) : (
                <>
                  <ImagePlus size={28} className="text-white/40" />
                  <span className="text-sm font-semibold text-white/70">Adjuntar comprobante</span>
                  <span className="text-xs text-white/30">Toca para subir una foto del recibo</span>
                </>
              )}
            </button>
          </div>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={!comprobanteUploaded || finalAmount <= 0 || processing}
            className="tap-highlight w-full rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-primary/30 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Acreditando...
              </>
            ) : (
              <>
                <Plus size={20} />
                Acreditar {finalAmount > 0 ? formatCOP(finalAmount) : ''}
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}
