import React, { useMemo } from 'react';
import { AvailabilityResponse, TimeSlot } from '../../types';
import { Calendar as CalendarIcon, Clock, Sun, Sunrise, Sunset, AlertCircle, Loader2 } from 'lucide-react';

interface Step3DateTimeProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availability: AvailabilityResponse | null;
  isLoadingAvailability: boolean;
  selectedSlot: string;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const Step3DateTime: React.FC<Step3DateTimeProps> = ({
  selectedDate,
  onSelectDate,
  availability,
  isLoadingAvailability,
  selectedSlot,
  onSelectSlot,
}) => {
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('pt-BR', { month: 'short' });
      dates.push({ iso, weekday, dayNum, month, isToday: i === 0 });
    }
    return dates;
  }, []);

  const { morningSlots, afternoonSlots, eveningSlots } = useMemo(() => {
    if (!availability) return { morningSlots: [], afternoonSlots: [], eveningSlots: [] };
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    availability.slots.forEach((s) => {
      const hour = parseInt(s.start_time.split(':')[0], 10);
      if (hour < 12) {
        morning.push(s);
      } else if (hour < 18) {
        afternoon.push(s);
      } else {
        evening.push(s);
      }
    });

    return { morningSlots: morning, afternoonSlots: afternoon, eveningSlots: evening };
  }, [availability]);

  const renderSlotGroup = (title: string, icon: React.ElementType, slots: TimeSlot[]) => {
    if (slots.length === 0) return null;
    const Icon = icon;

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Icon className="w-4 h-4 text-brand-primary" />
          <span>{title}</span>
          <span className="text-[10px] text-slate-500 font-normal">({slots.filter(s => s.is_available).length} livres)</span>
        </div>

        <div className="grid grid-cols-3 min-[420px]:grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedSlot === slot.start_time;
            if (slot.is_available) {
              return (
                <button
                  key={slot.start_time}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`py-2.5 px-1.5 sm:px-2 rounded-xl text-xs font-semibold text-center transition-all touch-target ${
                    isSelected
                      ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/50 scale-105'
                      : 'glass-card text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/15 hover:border-brand-primary/50'
                  }`}
                >
                  <span className="block text-xs sm:text-sm">{slot.start_time}</span>
                  <span className="text-[9px] sm:text-[10px] opacity-70 block font-normal mt-0.5">até {slot.end_time}</span>
                </button>
              );
            }

            return (
              <div
                key={slot.start_time}
                title={slot.reason || 'Horário Indisponível'}
                className="py-2.5 px-1.5 sm:px-2 rounded-xl text-xs font-medium text-center bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50 select-none"
              >
                <span className="block text-xs sm:text-sm line-through">{slot.start_time}</span>
                <span className="text-[8px] sm:text-[9px] block text-zinc-500 mt-0.5 truncate">{slot.reason || 'Ocupado'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Picker Strip */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-brand-primary shrink-0" />
            <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">Selecione a Data</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => e.target.value && onSelectDate(e.target.value)}
            className="glass-input text-xs px-2.5 py-1.5 rounded-xl text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
          />
        </div>

        {/* 14-day Horizontal Scroll Strip */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none pt-1 -mx-1 px-1">
          {dateOptions.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => onSelectDate(item.iso)}
                className={`flex-shrink-0 w-14 sm:w-16 py-2.5 sm:py-3 rounded-2xl flex flex-col items-center justify-center transition-all touch-target ${
                  isSelected
                    ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/25 ring-2 ring-brand-primary/40 scale-105'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {item.isToday ? 'Hoje' : item.weekday}
                </span>
                <span className="text-base sm:text-lg font-extrabold my-0.5 font-heading">
                  {item.dayNum}
                </span>
                <span className="text-[9px] sm:text-[10px] opacity-75 capitalize">
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Section */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>Horarios Disponiveis</span>
            </h3>
            {availability && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {availability.day_name} • {availability.staff_name}
              </p>
            )}
          </div>

          {availability && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              availability.available_slots > 0
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
            }`}>
              {availability.available_slots} horários livres
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoadingAvailability ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
            <p className="text-xs font-medium">Calculando disponibilidade em tempo real...</p>
          </div>
        ) : !availability || availability.slots.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500/80 mx-auto" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Nenhum horário disponível para esta data</p>
            <p className="text-xs max-w-sm mx-auto">
              O estabelecimento pode estar fechado neste dia ou todos os horários já foram preenchidos. Por favor, escolha outra data acima.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderSlotGroup('Manhã', Sunrise, morningSlots)}
            {renderSlotGroup('Tarde', Sun, afternoonSlots)}
            {renderSlotGroup('Noite', Sunset, eveningSlots)}
          </div>
        )}
      </div>
    </div>
  );
};
