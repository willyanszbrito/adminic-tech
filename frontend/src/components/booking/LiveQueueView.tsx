import React, { useState, useEffect, useCallback } from 'react';
import { Tenant, DailyQueueResponse, QueueCustomerItem, Staff, Service } from '../../types';
import { api } from '../../services/api';
import { 
  Users, Clock, Scissors, Search, CheckCircle, 
  Sparkles, RefreshCw, AlertCircle, MessageCircle, Calendar,
  Instagram, X, ChevronRight, ArrowRight, UserCheck
} from 'lucide-react';

export interface LiveQueueViewProps {
  tenant: Tenant;
  staffList?: Staff[];
  services?: Service[];
  onNavigateToBooking?: () => void;
  onSelectService?: (service: Service) => void;
  onSelectStaff?: (staff: Staff) => void;
}

export const LiveQueueView: React.FC<LiveQueueViewProps> = ({ 
  tenant, 
  staffList = [], 
  services = [],
  onNavigateToBooking,
  onSelectService,
  onSelectStaff
}) => {
  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalDateString(0);
  const tomorrowStr = getLocalDateString(1);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [queueData, setQueueData] = useState<DailyQueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [myQueueItem, setMyQueueItem] = useState<QueueCustomerItem | null>(null);
  const [otherDateNotice, setOtherDateNotice] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Dynamic Staff and Services State
  const [loadedStaff, setLoadedStaff] = useState<Staff[]>(staffList);
  const [loadedServices, setLoadedServices] = useState<Service[]>(services);
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('all');
  const [profileModalStaff, setProfileModalStaff] = useState<Staff | null>(null);

  // Sync / fetch staff if missing
  useEffect(() => {
    if (staffList && staffList.length > 0) {
      setLoadedStaff(staffList);
    } else {
      api.getStaff(tenant.slug).then((list) => {
        if (list && list.length > 0) setLoadedStaff(list);
      }).catch(() => {});
    }
  }, [tenant.slug, staffList]);

  // Sync / fetch services if missing
  useEffect(() => {
    if (services && services.length > 0) {
      setLoadedServices(services);
    } else {
      api.getCatalog(tenant.slug).then((cat) => {
        if (cat && cat.services && cat.services.length > 0) {
          setLoadedServices(cat.services);
        }
      }).catch(() => {});
    }
  }, [tenant.slug, services]);

  const loadQueue = useCallback(async (targetDate = selectedDate) => {
    setIsLoading(true);
    try {
      const data = await api.getDailyQueue(tenant.slug, targetDate);
      setQueueData(data);
      setLastRefreshed(new Date());
    } catch {
      // fallback handled in api.ts
    } finally {
      setIsLoading(false);
    }
  }, [tenant.slug, selectedDate]);

  useEffect(() => {
    loadQueue(selectedDate);
    const interval = setInterval(() => {
      loadQueue(selectedDate);
    }, 30000);
    return () => clearInterval(interval);
  }, [tenant.slug, selectedDate, loadQueue]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setOtherDateNotice(null);
    setHasSearched(false);
    setMyQueueItem(null);
    loadQueue(date);
  };

  const handleBookWithStaff = (staff: Staff) => {
    setProfileModalStaff(null);
    if (onSelectStaff) {
      onSelectStaff(staff);
    } else if (onNavigateToBooking) {
      onNavigateToBooking();
    }
  };

  const handleBookService = (service: Service) => {
    if (onSelectService) {
      onSelectService(service);
    } else if (onNavigateToBooking) {
      onNavigateToBooking();
    }
  };

  // Staff to display with fallback
  const displayStaff: Staff[] = loadedStaff.length > 0 ? loadedStaff : [
    {
      id: 'stf-julio-sousa',
      tenant_id: tenant.id,
      name: 'Julio Sousa',
      role: 'Barbeiro e Fundador',
      bio: 'Profissional experiente e dedicado, especialista em visagismo, degradês e acabamentos na navalha na Barbearia Campelo.',
      avatar_url: '',
      rating: 0,
      total_reviews: 0,
      specialty_service_ids: [],
      is_active: true,
      blocked_slots: []
    }
  ];

  // Services to display with fallback
  const displayServices: Service[] = loadedServices.filter(s => s.is_active !== false);

  // Filtered Queue according to Barber selection
  const rawQueue = queueData?.queue || [];
  const filteredQueue = selectedBarberFilter === 'all'
    ? rawQueue
    : rawQueue.filter(item => item.staff_name.toLowerCase().includes(selectedBarberFilter.toLowerCase()));

  const isCurrentServingFiltered = selectedBarberFilter === 'all' || 
    (queueData?.current_serving && queueData.current_serving.staff_name.toLowerCase().includes(selectedBarberFilter.toLowerCase()));

  const handleSearchMyTurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setOtherDateNotice(null);
    const query = searchQuery.trim().toUpperCase();
    const found = queueData?.queue.find(
      item => item.voucher_code.toUpperCase().includes(query) || 
              item.customer_display_name.toUpperCase().includes(query)
    ) || (queueData?.current_serving?.voucher_code.toUpperCase().includes(query) ? queueData.current_serving : null);

    if (found) {
      setMyQueueItem(found);
      setHasSearched(true);
      return;
    }

    // Busca detalhada caso o voucher pertença a outro dia (ex: amanhã)
    try {
      const appt = await api.getAppointment(tenant.slug, query);
      if (appt) {
        if (appt.appointment_date !== selectedDate) {
          const isTmrw = appt.appointment_date === tomorrowStr;
          const isTdy = appt.appointment_date === todayStr;
          const dayLabel = isTmrw ? 'amanhã' : isTdy ? 'hoje' : `no dia ${appt.appointment_date}`;
          setOtherDateNotice(
            `Voucher ${appt.voucher_code} localizado! Seu horário é para ${dayLabel} às ${appt.start_time} com ${appt.staff.name}.`
          );
        }
      }
    } catch {
      // voucher não encontrado na API
    }

    setMyQueueItem(null);
    setHasSearched(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16 sm:pb-0">
      {/* Top Banner Status Bar */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-brand-primary border border-amber-500/40 flex items-center justify-center shrink-0 shadow-md">
              <Scissors className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Fila em Tempo Real</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">• {tenant.name}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
                Fila de Atendimento ({selectedDate === todayStr ? 'Hoje' : selectedDate === tomorrowStr ? 'Amanhã' : selectedDate})
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Acompanhe quem está na cadeira e a sua previsão exata de ser chamado.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Date Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => handleSelectDate(todayStr)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-brand-primary text-black shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => handleSelectDate(tomorrowStr)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedDate === tomorrowStr
                    ? 'bg-brand-primary text-black shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                Amanhã
              </button>
            </div>

            <button
              onClick={() => loadQueue(selectedDate)}
              disabled={isLoading}
              className="p-2.5 rounded-xl glass-pill text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 flex items-center space-x-1.5 transition-all cursor-pointer touch-target"
              title="Atualizar fila agora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[11px] hidden min-[380px]:inline">Atualizar</span>
            </button>

            {onNavigateToBooking && (
              <button
                onClick={onNavigateToBooking}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-all shadow-md shadow-brand-primary/20 touch-target cursor-pointer whitespace-nowrap"
              >
                + Entrar na Fila
              </button>
            )}
          </div>
        </div>

        {/* Status Indicator Pill */}
        <div className="mt-4 pt-3.5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400">Status Geral:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full inline-block ${queueData?.current_serving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{queueData?.barber_status || 'Disponível'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Pessoas na fila: <strong className="text-brand-primary font-bold">{queueData?.total_waiting || 0}</strong></span>
            <span>•</span>
            <span>Atualizado às {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* 1. BARBER CARDS (CARROSSEL DE PROFISSIONAIS EM TEMPO REAL - ESTILO TONAFILA.APP) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <UserCheck className="w-4 h-4 text-brand-primary" />
            <span>Profissionais da Barbearia</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Toque no profissional para ver detalhes</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {displayStaff.map((stf) => {
            const isBusy = !!(
              queueData?.current_serving &&
              queueData.current_serving.staff_name.toLowerCase().includes(stf.name.toLowerCase())
            );

            return (
              <div
                key={stf.id}
                onClick={() => setProfileModalStaff(stf)}
                className="min-w-[130px] max-w-[140px] shrink-0 p-3 rounded-2xl glass-card border border-black/10 dark:border-white/10 hover:border-brand-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col items-center text-center group snap-start bg-white/40 dark:bg-black/20"
              >
                {/* Avatar with fallback */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/10 relative border-2 border-black/10 dark:border-white/10 group-hover:border-brand-primary transition-all mb-2 shadow-inner flex items-center justify-center">
                  {stf.avatar_url ? (
                    <img
                      src={stf.avatar_url}
                      alt={stf.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center font-bold text-lg text-brand-primary bg-zinc-900 ${stf.avatar_url ? 'hidden' : 'flex'}`}>
                    {stf.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Status indicator dot */}
                  <span
                    className={`absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                      isBusy ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                  {stf.name}
                </h4>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mb-2">
                  {stf.role || 'Barbeiro'}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide inline-flex items-center space-x-1 ${
                    isBusy
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isBusy ? 'Atendendo' : 'Livre'}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CARROSSEL NOSSOS SERVIÇOS (PRÉVIA RÁPIDA ESTILO TONAFILA.APP) */}
      {displayServices.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Scissors className="w-4 h-4 text-brand-primary" />
              <span>Nossos Serviços</span>
            </div>
            {onNavigateToBooking && (
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="text-[11px] font-bold text-brand-primary hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Ver todos e agendar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {displayServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleBookService(service)}
                className="min-w-[150px] max-w-[170px] shrink-0 p-3.5 rounded-2xl glass-card border border-black/10 dark:border-white/10 hover:border-brand-primary transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group snap-start bg-white/40 dark:bg-black/20"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
                    {service.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{service.duration_minutes} min</span>
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brand-primary font-mono">
                    R$ {service.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:translate-x-0.5 transition-transform flex items-center">
                    <span>Agendar</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultar Minha Vez na Fila */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 border border-brand-primary/30 shadow-lg bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent">
        <div className="flex items-center space-x-2 text-brand-primary mb-2">
          <Sparkles className="w-4 h-4" />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-heading">
            Consulte seu Lugar na Fila
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
          Digite o código do voucher ou seu nome para consultar sua posição e tempo estimado.
        </p>

        <form onSubmit={handleSearchMyTurn} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o código do voucher ou seu nome"
              className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-all cursor-pointer shadow-md shadow-brand-primary/20 shrink-0"
          >
            Ver Minha Posição
          </button>
        </form>

        {/* Card do Cliente Encontrado */}
        {hasSearched && myQueueItem && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                  <CheckCircle className="w-3 h-3" />
                  <span>Você foi localizado na fila!</span>
                </span>
                <h4 className="text-base sm:text-lg font-bold font-heading">
                  Olá, {myQueueItem.customer_display_name}!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Serviço agendado: <strong className="text-brand-primary">{myQueueItem.service_name}</strong> com <strong className="text-slate-900 dark:text-white">{myQueueItem.staff_name}</strong>.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Posição</span>
                <span className="text-2xl sm:text-3xl font-black font-heading text-brand-primary">
                  {myQueueItem.position}º
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                <span>Previsão de Atendimento: <strong>{myQueueItem.start_time}</strong> (~{myQueueItem.estimated_wait_minutes} min)</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500 inline mr-1.5" />
                <span>O barbeiro te avisará no WhatsApp quando faltar 10 minutos!</span>
              </span>
            </div>
          </div>
        )}

        {otherDateNotice && (
          <div className="mt-4 p-4 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/40 text-slate-900 dark:text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
              <span>{otherDateNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSelectDate(tomorrowStr)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              Ver Fila de Amanhã
            </button>
          </div>
        )}

        {hasSearched && !myQueueItem && !otherDateNotice && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Nenhum agendamento ativo com esse código encontrado na fila selecionada. Verifique o voucher ou faça um novo agendamento.</span>
          </div>
        )}
      </div>

      {/* 4. FILTROS POR BARBEIRO NA FILA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Filtrar Fila por Profissional
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {filteredQueue.length} cliente{filteredQueue.length === 1 ? '' : 's'} aguardando
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedBarberFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedBarberFilter === 'all'
                ? 'bg-brand-primary text-black shadow-sm'
                : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Todos ({rawQueue.length})
          </button>
          {displayStaff.map((stf) => {
            const countForStaff = rawQueue.filter(item =>
              item.staff_name.toLowerCase().includes(stf.name.toLowerCase())
            ).length;
            return (
              <button
                key={stf.id}
                type="button"
                onClick={() => setSelectedBarberFilter(stf.name)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBarberFilter === stf.name
                    ? 'bg-brand-primary text-black shadow-sm'
                    : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {stf.name} ({countForStaff})
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. GRID: CADEIRA ATUAL & PRÓXIMOS NA FILA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Cadeira Atual (Em Atendimento Agora) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Scissors className="w-4 h-4 text-brand-primary" />
            <span>Na Cadeira Agora</span>
          </div>

          <div className="glass-panel rounded-3xl p-5 sm:p-6 border-2 border-brand-primary/40 bg-brand-primary/5 space-y-4 shadow-xl">
            {isCurrentServingFiltered && queueData?.current_serving ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-brand-primary text-black uppercase tracking-wider animate-pulse flex items-center">
                    <Scissors className="w-3 h-3 mr-1" />
                    <span>Em Atendimento</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-brand-primary">
                    Voucher: {queueData.current_serving.voucher_code}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white">
                    {queueData.current_serving.customer_display_name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {queueData.current_serving.service_name}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Barbeiro</span>
                    <span className="font-bold text-slate-900 dark:text-white">{queueData.current_serving.staff_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Término previsto</span>
                    <span className="font-mono font-bold text-brand-primary">{queueData.current_serving.end_time}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-3">
                <Scissors className="w-8 h-8 mx-auto opacity-40 text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Cadeira Livre no Momento</p>
                  <p className="text-xs mt-0.5">O barbeiro está pronto para iniciar o próximo atendimento.</p>
                </div>
                {onNavigateToBooking && (
                  <button
                    type="button"
                    onClick={onNavigateToBooking}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    Agendar para Agora
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dica da Barbearia */}
          <div className="p-4 rounded-2xl glass-panel text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-black/10 dark:border-white/10">
            <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>Barbearia Campelo</span>
            </span>
            <p>
              Ambiente climatizado e atendimento com hora marcada enquanto aguarda a sua vez.
            </p>
          </div>
        </div>

        {/* Lista de Próximos na Fila */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>Próximos da Fila ({filteredQueue.length})</span>
            </span>
            <span className="text-[11px] text-brand-primary lowercase">ordem de atendimento</span>
          </div>

          <div className="space-y-3">
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item, idx) => {
                const isNext = item.status === 'next' || idx === 0;
                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl glass-card transition-all flex items-center justify-between gap-3 border ${
                      isNext
                        ? 'border-brand-primary/50 bg-brand-primary/5 shadow-md'
                        : 'border-black/10 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isNext 
                          ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20' 
                          : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.position}º
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.customer_display_name}
                          </h4>
                          {isNext && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-brand-primary border border-amber-500/30 shrink-0">
                              PRÓXIMO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.service_name} • <span className="text-slate-700 dark:text-slate-300 font-medium">{item.staff_name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                        {item.start_time}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        ~{item.estimated_wait_minutes} min espera
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel rounded-3xl p-10 text-center text-slate-500 dark:text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Fila livre!</p>
                <p className="text-xs">Não há clientes aguardando no momento. Aproveite para agendar agora!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. MODAL DE PERFIL DO PROFISSIONAL (ESTILO TONAFILA.APP) */}
      {profileModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-7 max-w-md w-full border border-black/10 dark:border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-5 bg-white dark:bg-zinc-900">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setProfileModalStaff(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Avatar */}
            <div className="text-center pt-2">
              <div className="w-24 h-24 rounded-3xl mx-auto overflow-hidden bg-zinc-800 border-4 border-brand-primary shadow-xl mb-3 flex items-center justify-center relative">
                {profileModalStaff.avatar_url ? (
                  <img
                    src={profileModalStaff.avatar_url}
                    alt={profileModalStaff.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-brand-primary">
                    {profileModalStaff.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                {profileModalStaff.name}
              </h3>
              <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mt-0.5">
                {profileModalStaff.role || 'Barbeiro Profissional'}
              </p>
            </div>

            {/* Bio */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
              {profileModalStaff.bio || 'Profissional especialista em cortes modernos, visagismo e cuidados masculinos na Barbearia Campelo.'}
            </div>

            {/* Horários de Atendimento */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2 text-xs">
              <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                <span>Horários de Atendimento</span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-black/5 dark:border-white/5">
                  <span>Segunda a Sábado</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {tenant.business_hours?.open_time || '09:00'} às {tenant.business_hours?.close_time || '20:00'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Domingo</span>
                  <span className="font-semibold text-slate-500">Fechado</span>
                </div>
              </div>
            </div>

            {/* Social Instagram Link */}
            {tenant.instagram && (
              <a
                href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl border border-black/10 dark:border-white/10 flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-primary/50 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>Instagram Oficial {tenant.instagram}</span>
              </a>
            )}

            {/* Action CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleBookWithStaff(profileModalStaff)}
                className="w-full py-3.5 px-4 rounded-2xl text-xs font-extrabold bg-brand-primary text-black hover:opacity-95 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center space-x-2 cursor-pointer touch-target"
              >
                <Scissors className="w-4 h-4" />
                <span>Agendar com {profileModalStaff.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BOTÃO FLUTUANTE EM DISPOSITIVOS MÓVEIS (ESTILO TONAFILA.APP) */}
      {onNavigateToBooking && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            type="button"
            onClick={onNavigateToBooking}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black shadow-2xl shadow-amber-500/40 border border-amber-300/40 flex items-center justify-center space-x-2.5 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <Scissors className="w-5 h-5" />
            <span>ENTRAR NA FILA AGORA</span>
          </button>
        </div>
      )}
    </div>
  );
};
