import { useState, useMemo } from 'react';
import { Star, Clock, Plus, Minus } from 'lucide-react';
import { LOCALES_DESTACADOS, type LocalDestacado, type MenuItem } from '@/data/appData';
import { formatCOP } from '@/hooks/useWallet';
import { BottomSheet } from './BottomSheet';
import { DeliveryMap, type DeliveryLocation } from './DeliveryMap';
import { MessageCircle, Banknote, CheckCircle2, MapPin, X, ShoppingBag } from 'lucide-react';

interface CartItem extends MenuItem {
  qty: number;
}

type OrderFlow = 'menu' | 'map' | 'summary' | 'done';

export function FeaturedLocals() {
  const [selectedLocal, setSelectedLocal] = useState<LocalDestacado | null>(null);

  return (
    <>
      <div className="px-4">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span className="weave-divider w-6 h-3 rounded-sm" />
          Locales destacados
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x-carousel pb-1 -mx-4 px-4">
          {LOCALES_DESTACADOS.map((local) => {
            const Icon = local.icon;
            return (
              <button
                key={local.id}
                onClick={() => setSelectedLocal(local)}
                className="snap-item shrink-0 w-44 card-surface rounded-2xl overflow-hidden flex flex-col tap-highlight"
              >
                <div
                  className="flex h-24 w-full items-center justify-center"
                  style={{ backgroundColor: `${local.accentColor}18` }}
                >
                  <Icon size={40} style={{ color: local.accentColor }} />
                </div>
                <div className="p-3 text-left flex-1">
                  <p className="text-sm font-bold text-white truncate">{local.nombre}</p>
                  <p className="text-[11px] text-white/45 mt-0.5">{local.tipo}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[11px] text-white/50">
                      <Clock size={12} className="text-emerald" />
                      {local.tiempoEntrega}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-warning fill-warning" fill="currentColor" />
                      <span className="text-[11px] font-semibold text-white/70">{local.calificacion}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedLocal && (
        <MenuSheet local={selectedLocal} open onClose={() => setSelectedLocal(null)} />
      )}
    </>
  );
}

function MenuSheet({
  local,
  open,
  onClose,
}: {
  local: LocalDestacado;
  open: boolean;
  onClose: () => void;
}) {
  const Icon = local.icon;
  const [cart, setCart] = useState<Record<string, number>>({});
  const [flow, setFlow] = useState<OrderFlow>('menu');
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const cartItems: CartItem[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([name, qty]) => {
          const item = local.menu.find((m) => m.nombre === name);
          return item ? { ...item, qty } : null;
        })
        .filter((x): x is CartItem => x !== null),
    [cart, local.menu],
  );

  const total = cartItems.reduce((sum, item) => sum + item.precio * item.qty, 0);
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const domicilio = total > 0 ? 3000 : 0;
  const grandTotal = total + domicilio;

  const addToCart = (name: string) => setCart((p) => ({ ...p, [name]: (p[name] ?? 0) + 1 }));
  const decFromCart = (name: string) =>
    setCart((p) => {
      const next = (p[name] ?? 0) - 1;
      const copy = { ...p };
      if (next <= 0) delete copy[name];
      else copy[name] = next;
      return copy;
    });

  const resetFlow = () => {
    setFlow('menu');
    setDeliveryLocation(null);
    setCheckoutOpen(false);
  };

  const handleCloseSheet = () => {
    resetFlow();
    onClose();
  };

  const handleHacerPedido = () => {
    setCheckoutOpen(false);
    setFlow('map');
  };

  const handleConfirmLocation = (loc: DeliveryLocation) => {
    setDeliveryLocation(loc);
    setFlow('summary');
  };

  const buildWhatsAppMessage = () => {
    const items = cartItems.map((i) => `• ${i.qty}x ${i.nombre} — ${formatCOP(i.precio * i.qty)}`).join('\n');
    return (
      `*Nuevo pedido - Moss*\n\n` +
      `${local.nombre}\n\n` +
      `${items}\n\n` +
      `Subtotal: ${formatCOP(total)}\n` +
      `Domicilio: ${formatCOP(domicilio)}\n` +
      `*Total: ${formatCOP(grandTotal)}*\n\n` +
      `*Entregar en:*\n${deliveryLocation?.label ?? 'Sin confirmar'}\n` +
      `https://maps.google.com/?q=${deliveryLocation?.lat},${deliveryLocation?.lng}\n\n` +
      `Pago: contra entrega (efectivo)`
    );
  };

  const sendWhatsApp = () => {
    const msg = encodeURIComponent(buildWhatsAppMessage());
    setFlow('done');
    setTimeout(() => {
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }, 1200);
  };

  // Map full-screen view
  if (flow === 'map') {
    return (
      <DeliveryMap
        open
        onClose={() => setFlow('menu')}
        onConfirm={handleConfirmLocation}
      />
    );
  }

  return (
    <>
      <BottomSheet open={open} onClose={handleCloseSheet} title={flow === 'done' ? undefined : local.nombre}>
        {flow === 'menu' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${local.accentColor}18` }}
              >
                <Icon size={28} style={{ color: local.accentColor }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{local.tipo}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <Star size={12} className="text-warning fill-warning" fill="currentColor" />
                    {local.calificacion}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <Clock size={12} className="text-emerald" /> {local.tiempoEntrega}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div>
              <p className="text-sm font-semibold text-white/80 mb-2">Menú disponible</p>
              <div className="space-y-2.5">
                {local.menu.map((item) => (
                  <div
                    key={item.nombre}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{item.nombre}</p>
                        {item.popular && (
                          <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/45 mt-0.5 truncate">{item.descripcion}</p>
                      <p className="text-sm font-bold text-emerald mt-1.5">{formatCOP(item.precio)}</p>
                    </div>
                    {cart[item.nombre] ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => decFromCart(item.nombre)}
                          className="tap-highlight flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-white"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-sm font-bold text-white w-5 text-center">
                          {cart[item.nombre]}
                        </span>
                        <button
                          onClick={() => addToCart(item.nombre)}
                          className="tap-highlight flex h-9 w-9 items-center justify-center rounded-xl bg-emerald text-white shadow-lg shadow-emerald/20"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item.nombre)}
                        className="tap-highlight flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald text-white shadow-lg shadow-emerald/20"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cart bar */}
            {totalItems > 0 && (
              <div className="sticky bottom-0 -mx-5 -mb-6 px-5 py-4 bg-surface border-t border-white/10 animate-fade-in">
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="tap-highlight w-full rounded-2xl bg-emerald py-4 text-base font-bold text-white shadow-lg shadow-emerald/30 flex items-center justify-between px-5"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald text-xs font-bold">
                      {totalItems}
                    </span>
                    Hacer Pedido
                  </span>
                  <span>{formatCOP(grandTotal)}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {flow === 'summary' && deliveryLocation && (
          <OrderSummary
            local={local}
            cartItems={cartItems}
            total={total}
            domicilio={domicilio}
            grandTotal={grandTotal}
            deliveryLocation={deliveryLocation}
            onEditLocation={() => setFlow('map')}
            onWhatsApp={sendWhatsApp}
            onCash={() => setFlow('done')}
          />
        )}

        {flow === 'done' && (
          <OrderDone onClose={handleCloseSheet} />
        )}
      </BottomSheet>

      {/* Checkout confirmation step */}
      {checkoutOpen && (
        <BottomSheet open onClose={() => setCheckoutOpen(false)} title="Revisar tu pedido">
          <CheckoutReview
            cartItems={cartItems}
            total={total}
            domicilio={domicilio}
            grandTotal={grandTotal}
            onHacerPedido={handleHacerPedido}
          />
        </BottomSheet>
      )}
    </>
  );
}

function CheckoutReview({
  cartItems,
  total,
  domicilio,
  grandTotal,
  onHacerPedido,
}: {
  cartItems: CartItem[];
  total: number;
  domicilio: number;
  grandTotal: number;
  onHacerPedido: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {cartItems.map((item) => (
          <div key={item.nombre} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-white/80">
              <span className="text-white font-semibold">{item.qty}x</span> {item.nombre}
            </span>
            <span className="text-white/60 font-semibold">{formatCOP(item.precio * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm text-white/50">
          <span>Subtotal</span>
          <span>{formatCOP(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/50">
          <span>Domicilio</span>
          <span>{formatCOP(domicilio)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-white pt-1">
          <span>Total</span>
          <span>{formatCOP(grandTotal)}</span>
        </div>
      </div>

      <button
        onClick={onHacerPedido}
        className="tap-highlight w-full rounded-2xl bg-emerald py-4 text-base font-bold text-white shadow-lg shadow-emerald/30 flex items-center justify-center gap-2"
      >
        <MapPin size={20} /> Confirmar ubicación de entrega
      </button>
    </div>
  );
}

function OrderSummary({
  local,
  cartItems,
  total,
  domicilio,
  grandTotal,
  deliveryLocation,
  onEditLocation,
  onWhatsApp,
  onCash,
}: {
  local: LocalDestacado;
  cartItems: CartItem[];
  total: number;
  domicilio: number;
  grandTotal: number;
  deliveryLocation: DeliveryLocation;
  onEditLocation: () => void;
  onWhatsApp: () => void;
  onCash: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <h3 className="text-lg font-bold text-white">Resumen del pedido</h3>
        <p className="text-xs text-white/50 mt-1">{local.nombre}</p>
      </div>

      {/* Delivery location card */}
      <div className="rounded-2xl bg-accent/10 border border-accent/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
            <MapPin size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/40 uppercase tracking-wide mb-0.5">Entregar en</p>
            <p className="text-sm font-semibold text-white leading-snug">{deliveryLocation.label}</p>
          </div>
          <button
            onClick={onEditLocation}
            className="tap-highlight shrink-0 text-xs font-semibold text-accent"
          >
            Cambiar
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2.5">
        {cartItems.map((item) => (
          <div key={item.nombre} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-white/80">
              <span className="text-white font-semibold">{item.qty}x</span> {item.nombre}
            </span>
            <span className="text-white/60 font-semibold">{formatCOP(item.precio * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm text-white/50">
          <span>Subtotal</span>
          <span>{formatCOP(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/50">
          <span>Domicilio</span>
          <span>{formatCOP(domicilio)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-white pt-1">
          <span>Total a pagar</span>
          <span>{formatCOP(grandTotal)}</span>
        </div>
      </div>

      {/* Payment options */}
      <div>
        <p className="text-sm font-semibold text-white/80 mb-2.5">Elige cómo pagar</p>
        <div className="space-y-2.5">
          <button
            onClick={onWhatsApp}
            className="tap-highlight w-full rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2.5"
          >
            <MessageCircle size={22} /> Enviar por WhatsApp
          </button>
          <button
            onClick={onCash}
            className="tap-highlight w-full rounded-2xl bg-surface-2 border border-white/10 py-4 text-base font-bold text-white flex items-center justify-center gap-2.5"
          >
            <Banknote size={22} className="text-emerald" /> Pago contra entrega (efectivo)
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDone({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald/15 mb-4">
        <CheckCircle2 size={36} className="text-emerald" />
      </div>
      <h3 className="text-lg font-bold text-white">¡Pedido enviado!</h3>
      <p className="text-sm text-white/50 mt-2 max-w-xs">
        Tu pedido fue registrado. El local confirmará la entrega a la dirección indicada. Ten el
        monto en efectivo listo para el pago contra entrega.
      </p>
      <button
        onClick={onClose}
        className="tap-highlight mt-6 w-full rounded-2xl bg-emerald py-3.5 text-base font-bold text-white shadow-lg shadow-emerald/30 flex items-center justify-center gap-2"
      >
        <ShoppingBag size={20} /> Volver al inicio
      </button>
    </div>
  );
}
