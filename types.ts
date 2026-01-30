
export type DeviceType = string; 
export type PartQuality = string;

export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  description?: string;
}

export interface BusinessSettings {
  name: string;
  logoUrl: string;
  whatsapp: string;
  email: string;
  address: string;
  terms: string;
  welcomeMessage: string;
  // Precios base globales
  basePrices: Record<string, number>;
  // Mapeo: ¿Qué servicios ofrece cada categoría? (Ej: 'Notebook' -> ['Formateo', 'Pantalla'])
  servicesByCategory: Record<string, string[]>;
  categories: ServiceCategory[];
  // Catálogo de precios específicos por modelo/tipo [Servicio][Modelo/Detalle] = Precio Real
  priceCatalog: Record<string, Record<string, number>>;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deviceType: DeviceType;
  model: string;
  problemDescription: string;
  deviceImage?: string;
  serviceType: string;
  estimatedPrice: number;
  estimatedDuration: string;
  warrantyMonths: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'on_the_way' | 'completed' | 'archived';
  createdAt: number;
  notificationsSent: {
    confirmation: boolean;
    reminder24h: boolean;
  };
}
