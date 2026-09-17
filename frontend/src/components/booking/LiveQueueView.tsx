import React, { useState, useEffect, useCallback } from 'react';
import { Tenant, DailyQueueResponse, QueueCustomerItem } from '../../types';
import { api } from '../../services/api';
import { 
  Users, Clock, Scissors, Search, CheckCircle, 
  Sparkles, RefreshCw, AlertCircle, MessageCircle, Calendar
} from 'lucide-react';

interface LiveQueueViewProps {
  tenant: Tenant;
  onNavigateToBooking?: () => void;
}

export const LiveQueueView: React.FC<LiveQueueViewProps> = ({ tenant, onNavigateToBooking }) => {
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
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
            <span className="text-slate-500 dark:text-slate-400">Status do Barbeiro:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{queueData?.barber_status || 'Atendendo no Momento'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Pessoas na fila: <strong className="text-brand-primary font-bold">{queueData?.total_waiting || 0}</strong></span>
            <span>•</span>
            <span>Última atualização: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

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

      {/* Grid: Cadeira Atual & Próximos na Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Cadeira Atual (Em Atendimento Agora) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Scissors className="w-4 h-4 text-brand-primary" />
            <span>Na Cadeira Agora</span>
          </div>

          <div className="glass-panel rounded-3xl p-5 sm:p-6 border-2 border-brand-primary/40 bg-brand-primary/5 space-y-4 shadow-xl">
            {queueData?.current_serving ? (
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
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <Scissors className="w-8 h-8 mx-auto opacity-40 text-brand-primary" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Cadeira Livre no Momento</p>
                <p className="text-xs">O barbeiro está pronto para iniciar o próximo atendimento.</p>
              </div>
            )}
          </div>

          {/* Dica da Barbearia */}
          <div className="p-4 rounded-2xl glass-panel text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border border-black/10 dark:border-white/10">
            <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              <span>Dica Barbearia Campelo</span>
            </span>
            <p>
              Aproveite nosso ambiente climatizado e atendimento com hora marcada enquanto aguarda a sua vez.
            </p>
          </div>
        </div>

        {/* Lista de Próximos na Fila */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>Próximos da Fila ({queueData?.queue.length || 0})</span>
            </span>
            <span className="text-[11px] text-brand-primary lowercase">ordem de atendimento</span>
          </div>

          <div className="space-y-3">
            {queueData && queueData.queue.length > 0 ? (
              queueData.queue.map((item, idx) => {
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
                          {item.service_name}
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
    </div>
  );
};
