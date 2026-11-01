import type { LucideIcon } from 'lucide-react';
import { UtensilsCrossed, Cross, Package, FlaskConical, Pizza, Drumstick, Wine, ShoppingCart } from 'lucide-react';

export type Municipio = 'Sibundoy' | 'San Francisco' | 'Colón' | 'Santiago';

export const MUNICIPIOS: Municipio[] = ['Sibundoy', 'San Francisco', 'Colón', 'Santiago'];

export const SIBUNDOY_CENTER: [number, number] = [1.205, -76.921];

export interface QuickAction {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'restaurantes',
    label: 'Restaurantes y Comida',
    shortLabel: 'Comida',
    description: 'Pide comida a domicilio',
    icon: UtensilsCrossed,
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.12)',
  },
  {
    id: 'farmacia',
    label: 'Farmacia y Urgencias',
    shortLabel: 'Farmacia',
    description: 'Medicamentos y recetas',
    icon: Cross,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.12)',
  },
  {
    id: 'mandados',
    label: 'Mandados y Encomiendas',
    shortLabel: 'Mandados',
    description: 'Envío de paquetes, compras y encargos en el Valle',
    icon: Package,
    color: '#f97316',
    bgColor: 'rgba(249,115,22,0.12)',
  },
  {
    id: 'licores',
    label: 'Licores',
    shortLabel: 'Licores',
    description: 'Bebidas y licores a domicilio',
    icon: Wine,
    color: '#d4a017',
    bgColor: 'rgba(212,160,23,0.12)',
  },
  {
    id: 'mercado',
    label: 'Mercado',
    shortLabel: 'Mercado',
    description: 'Compra de mercado a domicilio',
    icon: ShoppingCart,
    color: '#34d399',
    bgColor: 'rgba(52,211,153,0.12)',
  },
];

export interface LocalDestacado {
  id: string;
  nombre: string;
  tipo: string;
  tiempoEntrega: string;
  calificacion: number;
  categoriaId: string;
  icon: LucideIcon;
  accentColor: string;
  coords: [number, number];
  menu: MenuItem[];
}

export interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  popular?: boolean;
}

export const LOCALES_DESTACADOS: LocalDestacado[] = [
  {
    id: 'asadero-valle',
    nombre: 'Asadero El Valle',
    tipo: 'Asadero',
    tiempoEntrega: '15-25 min',
    calificacion: 4.8,
    categoriaId: 'restaurantes',
    icon: Drumstick,
    accentColor: '#f59e0b',
    coords: [1.2058, -76.9185],
    menu: [
      { nombre: 'Pollo asado entero', descripcion: '1 pollo, arepas y papas', precio: 35000, popular: true },
      { nombre: '1/2 Pollo asado', descripcion: 'Media porción con papas', precio: 18000 },
      { nombre: 'Bandeja paisa', descripcion: 'Plato típico completo', precio: 22000, popular: true },
      { nombre: 'Arepa con queso', descripcion: 'Arepa asada con queso costeño', precio: 6000 },
    ],
  },
  {
    id: 'pizzeria-sibundoy',
    nombre: 'Pizzería Sibundoy',
    tipo: 'Pizzería',
    tiempoEntrega: '20-30 min',
    calificacion: 4.6,
    categoriaId: 'restaurantes',
    icon: Pizza,
    accentColor: '#ef4444',
    coords: [1.2032, -76.9241],
    menu: [
      { nombre: 'Pizza margarita (familiar)', descripcion: 'Queso, tomate y albahaca', precio: 32000, popular: true },
      { nombre: 'Pizza hawaiana (personal)', descripcion: 'Jamón y piña', precio: 14000 },
      { nombre: 'Pizza pollo BBQ (personal)', descripcion: 'Pollo, BBQ y extra queso', precio: 16000, popular: true },
      { nombre: 'Breadsticks x4', descripcion: 'Palitos de pan con queso', precio: 8000 },
    ],
  },
  {
    id: 'drogueria-buen-salud',
    nombre: 'Droguería Buen Salud',
    tipo: 'Farmacia',
    tiempoEntrega: '15-25 min',
    calificacion: 4.7,
    categoriaId: 'farmacia',
    icon: FlaskConical,
    accentColor: '#10b981',
    coords: [1.2071, -76.9198],
    menu: [
      { nombre: 'Acetaminofén 500mg x10', descripcion: 'Tabletas', precio: 2500, popular: true },
      { nombre: 'Ibuprofeno 400mg x10', descripcion: 'Tabletas', precio: 4500 },
      { nombre: 'Suero oral x1L', descripcion: 'Rehidratación', precio: 3500 },
      { nombre: 'Alcohol antiséptico 250ml', descripcion: '70%', precio: 4000 },
    ],
  },
  {
    id: 'licores-el-trago',
    nombre: 'Licores El Trago',
    tipo: 'Licorera',
    tiempoEntrega: '15-20 min',
    calificacion: 4.5,
    categoriaId: 'licores',
    icon: Wine,
    accentColor: '#d4a017',
    coords: [1.2044, -76.9167],
    menu: [
      { nombre: 'Aguardiente Nariño 750ml', descripcion: 'Botella', precio: 45000, popular: true },
      { nombre: 'Cerveza Poker lata x6', descripcion: 'Pack 6 latas', precio: 18000 },
      { nombre: 'Ron Medellín 750ml', descripcion: 'Añejo', precio: 52000, popular: true },
      { nombre: 'Vino tinto 750ml', descripcion: 'Para compartir', precio: 28000 },
    ],
  },
  {
    id: 'mercado-la-plaza',
    nombre: 'Mercado La Plaza',
    tipo: 'Mercado',
    tiempoEntrega: '30-45 min',
    calificacion: 4.4,
    categoriaId: 'mercado',
    icon: ShoppingCart,
    accentColor: '#34d399',
    coords: [1.2062, -76.9253],
    menu: [
      { nombre: 'Arroz 1kg', descripcion: 'Diana', precio: 4200, popular: true },
      { nombre: 'Aceite vegetal 1L', descripcion: 'Premax', precio: 9500 },
      { nombre: 'Huevos x12', descripcion: 'Cartón', precio: 12000 },
      { nombre: 'Papa pastusa 1kg', descripcion: 'Para el almuerzo', precio: 3500 },
    ],
  },
];

export const QUICK_RECHARGE_AMOUNTS = [5000, 10000, 20000];

/* --- Demo data for panels --- */

export type OrderStatus = 'nuevo' | 'cocina' | 'listo' | 'despachado';

export interface DemoOrder {
  num: string;
  cliente: string;
  ubicacion: string;
  items: { qty: number; nombre: string }[];
  total: number;
  estado: OrderStatus;
}

export const DEMO_ORDERS: DemoOrder[] = [
  {
    num: '#001',
    cliente: 'María Jacanamijoy',
    ubicacion: 'Calle 4 # 6-32, Sibundoy',
    items: [
      { qty: 1, nombre: 'Pollo asado entero' },
      { qty: 2, nombre: 'Arepa con queso' },
    ],
    total: 47000,
    estado: 'nuevo',
  },
  {
    num: '#002',
    cliente: 'Carlos Chindoy',
    ubicacion: 'Vereda San Antonio, Sibundoy',
    items: [{ qty: 1, nombre: 'Pizza margarita (familiar)' }],
    total: 32000,
    estado: 'cocina',
  },
  {
    num: '#003',
    cliente: 'Rosa Mestizo',
    ubicacion: 'Carrera 3 # 8-15, Sibundoy',
    items: [{ qty: 2, nombre: '1/2 Pollo asado' }],
    total: 36000,
    estado: 'listo',
  },
];

export interface DemoCarrera {
  id: string;
  local: string;
  entrega: string;
  cliente: string;
  domicilio: number;
  coords: [number, number];
}

export const DEMO_CARRERAS: DemoCarrera[] = [
  {
    id: 'c1',
    local: 'Asadero El Valle',
    entrega: 'Calle 4 # 6-32, Sibundoy',
    cliente: 'María Jacanamijoy',
    domicilio: 3500,
    coords: [1.2058, -76.9185],
  },
  {
    id: 'c2',
    local: 'Droguería Buen Salud',
    entrega: 'Vereda San Antonio, Sibundoy',
    cliente: 'Carlos Chindoy',
    domicilio: 4000,
    coords: [1.2071, -76.9198],
  },
  {
    id: 'c3',
    local: 'Pizzería Sibundoy',
    entrega: 'Carrera 3 # 8-15, Sibundoy',
    cliente: 'Rosa Mestizo',
    domicilio: 3000,
    coords: [1.2032, -76.9241],
  },
];
