import { useState } from 'react';
import { Store, ChefHat, BarChart3, Check, Bike, Clock, Package, LogOut, ShieldCheck, Users, Settings, Crown, UserPlus, ChevronRight } from 'lucide-react';
import { DEMO_ORDERS, type DemoOrder, type OrderStatus } from '@/data/appData';
import { formatCOP } from '@/hooks/useWallet';
import { type BusinessAuthSession, clearStoredSession } from './BusinessAuthModal';

interface BusinessOwnerPanelProps {
  session: BusinessAuthSession;
  onLogout: () => void;
}

type Tab = 'cocina' | 'estadisticas' | 'admin';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  nuevo: { label: 'Nuevo', color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)' },
  cocina: { label: 'En cocina', color: '#f97316', bgColor: 'rgba(249,115,22,0.12)' },
  listo: { label: 'Listo', color: '#10b981', bgColor: 'rgba(16,185,129,0.12)' },
  despachado: { label: 'Despachado', color: '#64748b', bgColor: 'rgba(100,116,139,0.12)' },
};

const isSuperAdmin = (session: BusinessAuthSession) => session.role === 'super_admin';

export function BusinessOwnerPanel({ session, onLogout }: BusinessOwnerPanelProps) {
  const admin = isSuperAdmin(session);
  const [tab, setTab] = useState<Tab>(admin ? 'admin' : 'cocina');
  const [orders, setOrders] = useState<DemoOrder[]>(DEMO_ORDERS);

  const advanceStatus = (num: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.num !== num) return o;
        const next: OrderStatus =
          o.estado === 'nuevo' ? 'cocina' : o.estado === 'cocina' ? 'listo' : 'despachado';
        return { ...o, estado: next };
      }),
    );
  };

  const handleLogout = () => {
    clearStoredSession();
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col safe-top safe-bottom">
      {/* Header */}
      <div className="weave-border-bottom px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${admin ? 'bg-gold/15' : 'bg-emerald/15'}`}>
            {admin ? <Crown size={18} className="text-gold-light" /> : <Store size={18} className="text-gold-light" />}
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              {admin ? 'Administración General' : 'Panel de Negocio'}
            </h1>
            <p className="text-[11px] text-white/40">
              {admin ? 'Super Admin - Control total' : (session.merchantName ?? 'Comercio Aliado')}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="tap-highlight flex items-center gap-1.5 rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2 text-xs font-bold text-red-400 active:scale-95 transition"
        >
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 shrink-0">
        {admin && (
          <button
            onClick={() => setTab('admin')}
            className={`tap-highlight flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              tab === 'admin' ? 'bg-gold text-bg shadow-lg shadow-gold/20' : 'bg-surface-2 text-white/50'
            }`}
          >
            <Settings size={16} /> Admin
          </button>
        )}
        <button
          onClick={() => setTab('cocina')}
          className={`tap-highlight flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            tab === 'cocina' ? 'bg-emerald text-white shadow-lg shadow-emerald/20' : 'bg-surface-2 text-white/50'
          }`}
        >
          <ChefHat size={16} /> Cocina
        </button>
        <button
          onClick={() => setTab('estadisticas')}
          className={`tap-highlight flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
            tab === 'estadisticas' ? 'bg-emerald text-white shadow-lg shadow-emerald/20' : 'bg-surface-2 text-white/50'
          }`}
        >
          <BarChart3 size={16} /> Cuentas
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {tab === 'admin' && admin ? (
          <AdminTab />
        ) : tab === 'cocina' ? (
          <div className="space-y-3 pt-1">
            <p className="text-sm text-white/50 mb-2">
              {orders.filter((o) => o.estado !== 'despachado').length} pedidos activos
            </p>
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.estado];
              return (
                <div key={order.num} className="card-surface rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-gold-light">{order.num}</span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ color: cfg.color, backgroundColor: cfg.bgColor }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">{formatCOP(order.total)}</span>
                  </div>

                  <div>
                    <p className="text-xs text-white/40">Cliente</p>
                    <p className="text-sm font-semibold text-white">{order.cliente}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Entregar en</p>
                    <p className="text-sm text-white/70">{order.ubicacion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Pedido</p>
                    <div className="space-y-1">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex gap-2 text-sm text-white/80">
                          <span className="font-bold text-emerald">{it.qty}x</span>
                          <span>{it.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.estado !== 'despachado' && (
                    <button
                      onClick={() => advanceStatus(order.num)}
                      className="tap-highlight w-full rounded-xl bg-emerald py-3 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald/20"
                    >
                      {order.estado === 'nuevo' && (
                        <>
                          <ChefHat size={16} /> Aceptar y preparar
                        </>
                      )}
                      {order.estado === 'cocina' && (
                        <>
                          <Check size={16} /> Marcar listo
                        </>
                      )}
                      {order.estado === 'listo' && (
                        <>
                          <Bike size={16} /> Despachar
                        </>
                      )}
                    </button>
                  )}
                  {order.estado === 'despachado' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-white/40 py-1">
                      <Package size={16} /> Pedido despachado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <StatsTab />
        )}
      </div>
    </div>
  );
}

function AdminTab() {
  return (
    <div className="space-y-4 pt-1">
      {/* Super admin banner */}
      <div className="card-surface rounded-2xl p-4 border border-gold/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
            <Crown size={20} className="text-gold-light" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Panel de Super Administrador</p>
            <p className="text-xs text-white/40">Control total de la plataforma Moss</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface rounded-2xl p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 mb-2">
            <Store size={18} className="text-emerald" />
          </div>
          <p className="text-2xl font-black text-white">1</p>
          <p className="text-xs text-white/40">Comercios activos</p>
        </div>
        <div className="card-surface rounded-2xl p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 mb-2">
            <Users size={18} className="text-gold-light" />
          </div>
          <p className="text-2xl font-black text-white">30</p>
          <p className="text-xs text-white/40">Pedidos hoy</p>
        </div>
      </div>

      {/* Management sections */}
      <div className="card-surface rounded-2xl overflow-hidden">
        <p className="text-sm font-bold text-white px-4 pt-4 pb-2">Gestión de comercios</p>
        {[
          { icon: Store, label: 'Ver comercios aliados', sub: '1 local registrado' },
          { icon: UserPlus, label: 'Afiliar nuevo local', sub: 'Registrar comercio' },
          { icon: ShieldCheck, label: 'Aprobar / suspender', sub: 'Control de acceso' },
        ].map((item) => (
          <button
            key={item.label}
            className="tap-highlight w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition border-t border-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2">
              <item.icon size={18} className="text-gold-light" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-white/40">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </button>
        ))}
      </div>

      {/* Platform settings */}
      <div className="card-surface rounded-2xl overflow-hidden">
        <p className="text-sm font-bold text-white px-4 pt-4 pb-2">Configuración</p>
        {[
          { icon: BarChart3, label: 'Reportes globales', sub: 'Ingresos y comisiones' },
          { icon: Settings, label: 'Parámetros del sistema', sub: 'Comisiones y reglas' },
        ].map((item) => (
          <button
            key={item.label}
            className="tap-highlight w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition border-t border-white/5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2">
              <item.icon size={18} className="text-emerald" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-white/40">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </button>
        ))}
      </div>

      <p className="text-center text-[11px] text-white/25 pt-2">
        Sesión de Super Admin - Control total de la plataforma
      </p>
    </div>
  );
}

function StatsTab() {
  const ingresosDelDia = 115000;
  const saldoTiquetes = 45000;
  const completados = 24;
  const pendientes = 6;
  const totalPedidos = completados + pendientes;

  const topProducts = [
    { nombre: 'Pollo asado', pct: 35, color: '#10b981' },
    { nombre: 'Pizza', pct: 28, color: '#ef4444' },
    { nombre: 'Bandeja paisa', pct: 22, color: '#f59e0b' },
    { nombre: 'Otros', pct: 15, color: '#64748b' },
  ];

  return (
    <div className="space-y-4 pt-1">
      <div className="card-emerald rounded-2xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-wide">Ingresos del día</p>
        <p className="text-3xl font-black text-emerald mt-1">{formatCOP(ingresosDelDia)}</p>
        <div className="flex items-center gap-2 mt-2">
          <Clock size={14} className="text-white/30" />
          <span className="text-xs text-white/40">Actualizado hace 2 min</span>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-wide">Saldo de tiquetes prepago</p>
        <p className="text-2xl font-bold text-gold-light mt-1">{formatCOP(saldoTiquetes)}</p>
      </div>

      <div className="card-surface rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Productos más vendidos</p>
        <div className="flex items-center gap-4">
          <PieChart data={topProducts} />
          <div className="flex-1 space-y-2">
            {topProducts.map((p) => (
              <div key={p.nombre} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-white/70 flex-1">{p.nombre}</span>
                <span className="text-xs font-bold text-white">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-surface rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Estado de pedidos</p>
        <div className="flex items-center gap-4">
          <PieChart
            data={[
              { nombre: 'Completados', pct: Math.round((completados / totalPedidos) * 100), color: '#10b981' },
              { nombre: 'Pendientes', pct: Math.round((pendientes / totalPedidos) * 100), color: '#f97316' },
            ]}
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald" />
              <span className="text-xs text-white/70 flex-1">Completados</span>
              <span className="text-xs font-bold text-white">{completados} ({Math.round((completados / totalPedidos) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-accent" />
              <span className="text-xs text-white/70 flex-1">Pendientes</span>
              <span className="text-xs font-bold text-white">{pendientes} ({Math.round((pendientes / totalPedidos) * 100)}%)</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2">
              <span className="text-xs text-white/40">Total: {totalPedidos} pedidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PieChart({
  data,
  size = 110,
}: {
  data: { nombre: string; pct: number; color: string }[];
  size?: number;
}) {
  const radius = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1c2740" strokeWidth={10} />
      {data.map((slice, i) => {
        const dash = (slice.pct / 100) * circumference;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={10}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        className="fill-white font-bold"
        style={{ fontSize: 18, fontFamily: 'system-ui' }}
      >
        {data.reduce((s, d) => s + (d.nombre === 'Otros' || d.nombre === 'Pendientes' ? 0 : d.pct), 0) > 0
          ? `${data.reduce((s, d) => s + d.pct, 0)}%`
          : ''}
      </text>
    </svg>
  );
}
