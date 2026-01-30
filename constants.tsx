
import { ServiceCategory } from './types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'Celular',
    title: 'Celulares',
    icon: 'Smartphone',
    description: 'iPhone, Android, cambio de pantalla, batería y más.'
  },
  {
    id: 'PC / Notebook',
    title: 'Notebook / PC',
    icon: 'Laptop',
    description: 'Reparación de hardware, software y mantenimiento general.'
  },
  {
    id: 'MacBook',
    title: 'MacBook',
    icon: 'Monitor',
    description: 'Especialistas en Apple, reparación de placa y componentes.'
  },
  {
    id: 'Consola',
    title: 'Consolas',
    icon: 'Gamepad2',
    description: 'PS5, Xbox, Nintendo Switch, mantenimiento y controles.'
  }
];

export const QUALITY_MULTIPLIERS = {
  'Económica': 0.7,
  'Premium': 1.0,
  'Original': 1.6
};

export const DEFAULT_PRICES: Record<string, number> = {
  'Mantenimiento Preventivo': 25000,
  'Reparación de Pantalla': 45000,
  'Cambio de Batería': 20000,
  'Reparación de Placa Madre': 60000,
  'Limpieza Interna': 15000,
  'Instalación de Software': 15000,
  'Recuperación de Datos': 35000,
  'Otro': 10000
};

export const SERVICE_TYPES = Object.keys(DEFAULT_PRICES);
