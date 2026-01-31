
import React, { useState, useEffect, useRef } from 'react';
import { Booking, BusinessSettings } from '../types.ts';
import { 
  Smartphone, 
  Laptop, 
  Gamepad2, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Loader2, 
  Camera, 
  Search, 
  ChevronDown, 
  Check, 
  Zap
} from 'lucide-react';
import { getAIDiagnosis } from '../services/geminiService.ts';

const iconMap: Record<string, any> = {
  Smartphone,
  Laptop,
  Gamepad2
};

interface Props {
  onComplete: (booking: Booking) => void;
}

const BookingForm: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [modelSearch, setModelSearch] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [settings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('business_settings');
    return saved ? JSON.parse(saved) : { basePrices: {}, categories: [], priceCatalog: {}, servicesByCategory: {} } as BusinessSettings;
  });

  const [formData, setFormData] = useState<Partial<Booking>>({
    deviceType: settings.categories?.[0]?.id || 'Celular',
    serviceType: '', 
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    estimatedPrice: 0,
    model: '',
    deviceImage: ''
  });

  const availableServices = settings.servicesByCategory?.[formData.deviceType!] || [];

  useEffect(() => {
    if (availableServices.length > 0 && !availableServices.includes(formData.serviceType!)) {
      setFormData(prev => ({ ...prev, serviceType: availableServices[0], model: '' }));
      setModelSearch('');
    }
  }, [formData.deviceType, availableServices]);

  const catalogForService: Record<string, number> = settings.priceCatalog?.[formData.serviceType!] || {};
  const hasCatalog = Object.keys(catalogForService).length > 0;

  useEffect(() => {
    const realPrice = catalogForService[formData.model!] || settings.basePrices[formData.serviceType!] || 0;
    
    setFormData(prev => ({ 
      ...prev, 
      estimatedPrice: realPrice,
      warrantyMonths: formData.serviceType?.toLowerCase().includes('carga') ? 3 : 6,
      estimatedDuration: formData.serviceType?.toLowerCase().includes('pantalla') ? '2 horas' : '1 hora'
    }));
  }, [formData.serviceType, formData.model, settings, catalogForService]);

  const handleImageUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData(prev => ({ ...prev, deviceImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIDiagnosis = async () => {
    if (!formData.model || !formData.problemDescription) return;
    setLoadingAI(true);
    const result = await getAIDiagnosis(
      formData.deviceType!, 
      formData.model!, 
      formData.problemDescription!,
      formData.deviceImage
    );
    setAiDiagnosis(result);
    setLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBooking: Booking = {
      ...formData as Booking,
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      status: 'pending',
      createdAt: Date.now(),
      notificationsSent: { confirmation: true, reminder24h: false }
    };
    onComplete(finalBooking);
  };

  const filteredCatalogItems = Object.entries(catalogForService).filter(([item]) => 
    item.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL').format(amount);
  };

  return (
    <div className="max-w-xl mx-auto animate-slide-up pb-20">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Agenda tu Reparación</h2>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="h-1.5 bg-slate-100 w-full">
            <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${(step/3)*100}%` }} />
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Tipo de Equipo</label>
                <div className="grid grid-cols-3 gap-3">
                  {settings.categories.map((cat) => {
                    const IconComp = iconMap[cat.icon] || Smartphone;
                    const isSelected = formData.deviceType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, deviceType: cat.id })}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                          isSelected 
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <IconComp className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{cat.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Servicio Requerido</label>
                  <div className="relative">
                    <select 
                      required 
                      value={formData.serviceType} 
                      onChange={e => { setFormData({ ...formData, serviceType: e.target.value, model: '' }); setModelSearch(''); }} 
                      className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                    >
                      {availableServices.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                      {availableServices.length === 0 && <option value="">Selecciona equipo primero</option>}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600"><ChevronDown className="w-5 h-5" /></div>
                  </div>
                </div>

                {hasCatalog && (
                  <div className="space-y-3 animate-slide-up bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50">
                    <label className="text-[9px] font-black text-indigo-700 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> Selecciona el Repuesto Exacto
                    </label>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                       <input 
                        type="text" 
                        placeholder="Escribe el modelo (ej: iPhone 11)..." 
                        value={modelSearch} 
                        onChange={e => setModelSearch(e.target.value)} 
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-indigo-500 shadow-sm" 
                       />
                    </div>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                      {filteredCatalogItems.length > 0 ? filteredCatalogItems.map(([item, price]) => (
                        <button 
                          key={item} 
                          type="button" 
                          onClick={() => { setFormData({...formData, model: item}); }} 
                          className={`w-full flex justify-between items-center p-3.5 rounded-xl border-2 transition-all ${formData.model === item ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-white bg-white text-slate-600 hover:border-slate-200 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden text-left">
                             <span className="text-[10px] font-black uppercase tracking-tight truncate">{item}</span>
                          </div>
                          <span className={`text-[10px] font-black shrink-0 ml-2 ${formData.model === item ? 'text-white' : 'text-indigo-600'}`}>${formatCurrency(price as number)}</span>
                        </button>
                      )) : (
                        <p className="text-[10px] text-center text-slate-400 py-4 font-bold">No se encontraron coincidencias exactas.</p>
                      )}
                      <button type="button" onClick={() => { setFormData({...formData, model: ''}); }} className={`w-full p-3.5 rounded-xl border-2 border-dashed transition-all text-[9px] font-black uppercase tracking-widest ${formData.model && !catalogForService[formData.model!] ? 'border-indigo-600 bg-white text-indigo-600' : 'border-slate-200 text-slate-400'}`}>
                        + Ingresar modelo personalizado
                      </button>
                    </div>
                  </div>
                )}

                {(!hasCatalog || (formData.model && !catalogForService[formData.model!]) || !formData.model) && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo del Equipo</label>
                    <input type="text" required placeholder="Ej: Samsung S21 Plus, MacBook Air M2..." value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-inner" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción de la Falla</label>
                  <textarea required rows={2} placeholder="Explica brevemente qué sucede..." value={formData.problemDescription || ''} onChange={e => setFormData({ ...formData, problemDescription: e.target.value })} className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm resize-none shadow-inner" />
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Costo Estimado</p>
                    <h3 className="text-3xl font-black tracking-tighter">${formatCurrency(formData.estimatedPrice || 0)}</h3>
                    <p className="text-[8px] font-bold text-indigo-400 uppercase mt-1">Garantía Real de {formData.warrantyMonths} meses</p>
                  </div>
                  <button type="button" onClick={handleAIDiagnosis} className="flex flex-col items-center gap-1 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    {loadingAI ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
                    <span className="text-[7px] font-black uppercase opacity-60">IA Tech</span>
                  </button>
                </div>
                {aiDiagnosis && <div className="mt-4 bg-white/5 rounded-xl p-3 border border-white/10 animate-slide-up"><p className="text-[10px] text-slate-300 font-medium italic text-center">"{aiDiagnosis.possibleCause}"</p></div>}
              </div>
              
              <button type="button" onClick={() => setStep(2)} className="w-full py-4.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                Siguiente Paso <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de la Cita</label>
                  <input type="date" required value={formData.appointmentDate} min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({ ...formData, appointmentDate: e.target.value })} className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bloque Horario</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00'].map(h => (
                      <button key={h} type="button" onClick={() => setFormData({...formData, appointmentTime: h})} className={`py-3.5 rounded-xl border-2 font-black text-xs transition-all ${formData.appointmentTime === h ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Atrás</button>
                <button type="button" onClick={() => setStep(3)} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Confirmar Datos</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input type="text" required placeholder="Tu nombre" value={formData.customerName || ''} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-inner" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contacto</label>
                  <input type="tel" required placeholder="+56 9..." value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-inner" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección del Servicio</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input type="text" required placeholder="Calle, número, oficina..." value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-sm shadow-inner" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Atrás</button>
                <button type="submit" className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                  <CheckCircle2 className="w-4 h-4" /> Finalizar Agendamiento
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
