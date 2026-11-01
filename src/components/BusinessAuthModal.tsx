import { useState, useEffect } from 'react';
import { Lock, Phone, ShieldCheck, Loader2, AlertCircle, Store, MessageCircle, UserPlus, LogIn } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'businessAuthToken';
const SUPER_ADMIN_PHONE = '+573214263490';
const SUPER_ADMIN_PASSWORD = '1124313350felipemeneses';
const WHATSAPP_LINK = 'https://wa.me/573214263490?text=Hola,%20quiero%20afiliar%20mi%20local%20o%20recargar%20saldo%20en%20Moss';

export type BusinessRole = 'super_admin' | 'merchant';

export interface BusinessAuthSession {
  role: BusinessRole;
  phone?: string;
  merchantId?: string;
  ts: number;
}

interface BusinessAuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthorized: (session: BusinessAuthSession) => void;
}

async function checkMerchantCredentials(phone: string, pin: string) {
  const { data, error } = await supabase
    .rpc('check_merchant_credentials', { p_phone: phone, p_pin: pin });
  if (error) return null;
  return data;
}

function loginUser(user: BusinessAuthSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function getStoredSession(): BusinessAuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BusinessAuthSession;
  } catch {
    // ignore
  }
  return null;
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function BusinessAuthModal({ open, onClose, onAuthorized }: BusinessAuthModalProps) {
  const [tab, setTab] = useState<'login' | 'afiliar'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTab('login');
      setPhone('');
      setPassword('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleBusinessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.replace(/\D/g, '').length !== 10) {
      setError('El número de celular debe tener 10 dígitos');
      return;
    }
    if (password.length < 4) {
      setError('Ingresa tu contraseña de seguridad');
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith('+57') ? phone : `+57${phone}`;

    try {
      // 1. ROL SUPER ADMIN (Tus datos)
      if (formattedPhone === SUPER_ADMIN_PHONE && password === SUPER_ADMIN_PASSWORD) {
        const session: BusinessAuthSession = { role: 'super_admin', phone: formattedPhone, ts: Date.now() };
        loginUser(session);
        setLoading(false);
        onClose();
        onAuthorized(session);
        return;
      }

      // 2. ROL COMERCIO ALIADO
      const merchant = await checkMerchantCredentials(formattedPhone, password);
      if (merchant) {
        const session: BusinessAuthSession = { role: 'merchant', merchantId: merchant.id, ts: Date.now() };
        loginUser(session);
        setLoading(false);
        onClose();
        onAuthorized(session);
      } else {
        setLoading(false);
        setError('Datos incorrectos. Verifica tu PIN o afilia tu local.');
      }
    } catch {
      setLoading(false);
      setError('Error de conexión. Intenta nuevamente.');
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Portal de Comercios Aliados">
      <div className="space-y-5">
        {/* Security header */}
        <div className="flex flex-col items-center text-center py-2">
          <div className="relative mb-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gold/15">
              <ShieldCheck size={32} className="text-gold-light" />
            </div>
          </div>
          <p className="text-sm font-bold text-white">Acceso Restringido</p>
          <p className="text-xs text-white/45 mt-1 max-w-xs">
            Este portal es exclusivo para comercios aliados registrados. Ingresa tus credenciales de seguridad.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl bg-surface-2 p-1">
          <button
            onClick={() => setTab('login')}
            className={`tap-highlight flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              tab === 'login' ? 'bg-gold text-bg' : 'text-white/50'
            }`}
          >
            <LogIn size={16} /> Ingresar
          </button>
          <button
            onClick={() => setTab('afiliar')}
            className={`tap-highlight flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              tab === 'afiliar' ? 'bg-gold text-bg' : 'text-white/50'
            }`}
          >
            <UserPlus size={16} /> Afiliar / Recargar
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleBusinessLogin} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
                Número de celular registrado
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-gold/50">
                <Phone size={18} className="text-gold-light shrink-0" />
                <span className="text-white/50 text-sm font-semibold shrink-0">+57</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="3xx xxx xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Password (alphanumeric) */}
            <div>
              <label className="text-xs text-gold-light font-semibold uppercase tracking-wide mb-1.5 block">
                Contraseña de seguridad
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3.5 border border-white/10 focus-within:border-gold/50">
                <Lock size={18} className="text-gold-light shrink-0" />
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="Tu contraseña maestra"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-950/80 border border-red-500/40 px-3 py-2.5 animate-fade-in">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-100 font-semibold">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="tap-highlight w-full rounded-2xl bg-gold py-4 text-base font-bold text-bg shadow-lg shadow-gold/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  <Store size={20} /> Ingresar al panel
                </>
              )}
            </button>
          </form>
        ) : (
          /* ---- Afiliar / Recargar tab ---- */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Afíliate y Recarga tu Saldo Moss</h3>
            </div>

            <p className="text-sm text-white/60 leading-relaxed">
              Sin mensualidades fijas. Recarga saldo a tu cuenta para recibir pedidos; cada pedido descuenta su comisión de tu saldo.
            </p>

            <div className="rounded-2xl bg-surface-2 border border-emerald/20 px-4 py-3.5">
              <p className="text-xs text-white/50 leading-relaxed">
                Recarga mínima de prueba: <span className="text-gold-light font-bold">$5.000 COP</span> a Neovi. Presiona el botón de abajo para enviar tu comprobante y recibir tu acceso.
              </p>
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-highlight w-full rounded-2xl bg-emerald py-4 text-base font-bold text-white shadow-lg shadow-emerald/30 flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
            >
              <MessageCircle size={22} />
              Enviar comprobante por WhatsApp
            </a>

            <p className="text-center text-[11px] text-white/25">
              Al afiliarte aceptas los términos del programa de Comercios Aliados de Moss.
            </p>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
