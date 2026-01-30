
import React, { useState, useEffect } from 'react';
import BookingForm from './components/BookingForm';
import Confirmation from './components/Confirmation';
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminSettings from './components/AdminSettings';
import OrderTracking from './components/OrderTracking';
import { Booking, BusinessSettings } from './types';
import { Smartphone, Zap, Settings, BellRing, Plus, Search, Lock } from 'lucide-react';

const DEFAULT_SETTINGS: BusinessSettings = {
  name: "TechFlow Pro",
  logoUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
  whatsapp: "+56900000000",
  email: "contacto@techflow.com",
  address: "Servicio Técnico Especializado",
  welcomeMessage: "Especialistas en Micro-soldadura y Cambio de Flex de Carga. Precios transparentes.",
  terms: "Garantía de 3 meses en componentes de carga y 6 meses en pantallas.",
  categories: [
    { id: 'Celular', title: 'Celulares', icon: 'Smartphone' },
    { id: 'Notebook', title: 'Notebooks', icon: 'Laptop' },
    { id: 'Consola', title: 'Consolas', icon: 'Gamepad2' }
  ],
  servicesByCategory: {
    'Celular': [
      'Puerto de Carga / Flex',
      'Cambio de Pantalla Celular',
      'Cambio de Batería',
      'Reparación de Cámaras',
      'Limpieza y Mantenimiento'
    ],
    'Notebook': [
      'Puerto de Carga (DC Jack / Type-C)',
      'Cambio de Pantalla Notebook',
      'Aumento RAM / SSD',
      'Formateo + Sistema Operativo',
      'Limpieza Térmica y Mantenimiento'
    ],
    'Consola': [
      'Reparación de HDMI',
      'Mantenimiento Pro (Pasta Térmica)',
      'Reparación de Joystick (Drift)',
      'Cambio de Disco / Software'
    ]
  },
  basePrices: {
    'Puerto de Carga / Flex': 25000,
    'Puerto de Carga (DC Jack / Type-C)': 35000,
    'Cambio de Pantalla Celular': 45000,
    'Aumento RAM / SSD': 35000,
    'Limpieza y Mantenimiento': 20000,
    'Formateo + Sistema Operativo': 25000
  },
  priceCatalog: {
    'Puerto de Carga / Flex': {
      'iPhone 7 / 8 / SE (Flex Carga)': 25000,
      'iPhone X / XS / XR (Flex Carga)': 35000,
      'iPhone 11 (Flex Carga Original)': 45000,
      'iPhone 12 / 12 Pro (Flex Carga)': 55000,
      'iPhone 13 / 13 Pro (Flex Carga)': 75000,
      'iPhone 14 / 15 (Flex Type-C)': 95000,
      'Samsung A10 / A12 / A13 (Pin)': 25000,
      'Samsung A21s / A32 / A51 (Pin)': 30000,
      'Samsung A52 / A53 / A54 (Flex)': 38000,
      'Samsung S20 / S21 / S22 (Flex)': 48000,
      'Motorola G8 / G9 / G20 / G30': 25000,
      'Motorola G60 / G100 (Flex)': 35000,
      'Xiaomi Redmi Note 10 / 11 / 12': 30000,
      'Pin de Carga Universal (Soldado)': 20000
    },
    'Puerto de Carga (DC Jack / Type-C)': {
      'Notebook DC Jack Standard': 35000,
      'Notebook DC Jack con Cable': 45000,
      'Notebook Puerto Type-C (Soldado)': 60000,
      'MacBook Pro/Air (Módulo Magsafe)': 85000
    }
  }
};

const App: React.FC = () => {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [showSettings, setShowSettings] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [searchResult, setSearchResult] = useState<Booking | null>(null);

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('business_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Fusionar para asegurar que el nuevo catálogo de carga siempre esté
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed, 
        priceCatalog: { ...DEFAULT_SETTINGS.priceCatalog, ...(parsed.priceCatalog || {}) } 
      };
    }
    return DEFAULT_SETTINGS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('tech_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('business_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('tech_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleNewBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
    setCurrentBooking(booking);
    setNotifications(prev => [`⚡ Nueva Cita: ${booking.customerName}`, ...prev].slice(0, 3));
    setTimeout(() => setNotifications(prev => prev.slice(0, -1)), 5000);
  };

  const handleTrackOrder = () => {
    const cleanId = trackId.replace('#', '').trim().toUpperCase();
    const found = bookings.find(b => b.id === cleanId);
    if (found) setSearchResult(found);
    else alert("Orden no encontrada.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed top-24 right-8 z-[200] flex flex-col gap-3">
        {notifications.map((n, i) => (
          <div key={i} className="dark-glass text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
            <BellRing className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{n}</span>
          </div>
        ))}
      </div>

      <header className="fixed top-0 left-0 right-0 h-20 glass z-50 border-b border-slate-200/50 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('client'); setShowForm(false); setCurrentBooking(null); setSearchResult(null); }}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter text-slate-900">{settings.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {view === 'client' ? (
              <button onClick={() => setView('admin')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">
                <Lock className="w-4 h-4" /> PANEL ADMIN
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setView('client')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Vista Cliente</button>
                <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Settings className="w-5 h-5" /></button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6">
        {view === 'admin' ? (
          <TechnicianDashboard bookings={bookings} settings={settings} onUpdateStatus={(id, s) => setBookings(prev => prev.map(b => b.id === id ? {...b, status: s} : b))} />
        ) : (
          <div className="max-w-4xl mx-auto">
            {searchResult ? (
              <OrderTracking order={searchResult} onBack={() => setSearchResult(null)} />
            ) : !showForm && !currentBooking ? (
              <div className="py-12 md:py-20 text-center space-y-12">
                <div className="space-y-6 max-w-2xl mx-auto">
                   <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1]">
                     Repara tu equipo con <span className="text-indigo-600">Expertos.</span>
                   </h1>
                   <p className="text-lg text-slate-500 font-medium">{settings.welcomeMessage}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => setShowForm(true)} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                    Agendar Ahora <Plus className="w-5 h-5" />
                  </button>
                  <div className="relative max-w-xs mx-auto sm:mx-0 w-full">
                      <input type="text" placeholder="ID de orden..." value={trackId} onChange={e => setTrackId(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleTrackOrder()} className="w-full h-full pl-6 pr-14 py-5 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-600 shadow-sm" />
                      <button onClick={() => handleTrackOrder()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"><Search className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ) : currentBooking ? (
              <Confirmation booking={currentBooking} onReset={() => { setCurrentBooking(null); setShowForm(false); }} />
            ) : (
              <BookingForm onComplete={handleNewBooking} />
            )}
          </div>
        )}
      </main>

      {showSettings && (
        <AdminSettings settings={settings} onClose={() => setShowSettings(false)} onSave={s => { setSettings(s); setShowSettings(false); }} />
      )}
    </div>
  );
};

export default App;
