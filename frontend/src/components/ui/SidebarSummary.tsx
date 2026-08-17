import React from 'react';
import { Service, Staff, WizardStep } from '../../types';
import { Scissors, User, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { abTesting, EXPERIMENTS } from '../../services/abTesting';

interface SidebarSummaryProps {
  currentStep: WizardStep;
  selectedService: Service | null;
  selectedStaff: Staff | null;
  isAnyStaff: boolean;
  selectedDate: string;
  selectedSlot: string;
  slotEndTime?: string;
  paymentMethod?: string;
  onProceed: () => void;
  canProceed: boolean;
  isSubmitting?: boolean;
}

export const SidebarSummary: React.FC<SidebarSummaryProps> = ({
  currentStep,
  selectedService,
  selectedStaff,
  isAnyStaff,
  selectedDate,
  selectedSlot,
  slotEndTime,
  paymentMethod = 'pix',
  onProceed,
  canProceed,
  isSubmitting = false,
}) => {
  const ctaVariant = abTesting.getVariant(EXPERIMENTS.CTA_BOOKING_BUTTON);

  const getButtonText = () => {
    if (isSubmitting) return 'Confirmando agendamento...';
    switch (currentStep) {
      case 1:
        return 'Continuar para Profissional';
      case 2:
        return 'Continuar para Data e Horário';
      case 3:
        return 'Continuar para Identificação';
      case 4:
        return ctaVariant === 'variant_b' ? 'Garantir Meu Horário Exclusivo' : 'Finalizar e Confirmar Reserva';
      default:
        return 'Avançar';
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-6 border border-black/10 dark:border-white/10 sticky top-20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-black/10 dark:border-white/10">
        <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
          <span>Resumo do Agendamento</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
          Etapa {currentStep}/4
        </span>
      </div>

      {/* Selected Items */}
      <div className="py-3.5 sm:py-4 space-y-3.5 sm:space-y-4 text-sm">
        {/* Service */}
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl border shrink-0 ${selectedService ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400'}`}>
            <Scissors className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">Serviço</span>
            {selectedService ? (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedService.name}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                  <span>{selectedService.duration_minutes} min</span>
                  <span>•</span>
                  <span className="text-brand-primary font-semibold">R$ {selectedService.price.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Nenhum serviço selecionado</p>
            )}
          </div>
        </div>

        {/* Staff */}
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl border shrink-0 ${selectedStaff || isAnyStaff ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400'}`}>
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">Profissional</span>
            {selectedStaff ? (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedStaff.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedStaff.role}</p>
              </div>
            ) : isAnyStaff ? (
              <p className="font-medium text-slate-800 dark:text-white text-xs">Primeiro profissional disponível</p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Pendente de seleção</p>
            )}
          </div>
        </div>

        {/* Date e Time */}
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl border shrink-0 ${selectedDate && selectedSlot ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400'}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">Data e Horário</span>
            {selectedDate && selectedSlot ? (
              <div>
                <p className="font-semibold text-slate-900 dark:text-white capitalize truncate">{formatDateDisplay(selectedDate)}</p>
                <p className="text-xs text-brand-primary font-medium flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{selectedSlot} {slotEndTime ? `às ${slotEndTime}` : ''}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Escolha o dia e horário</p>
            )}
          </div>
        </div>
      </div>

      {/* Price Calculation */}
      <div className="pt-3.5 sm:pt-4 border-t border-black/10 dark:border-white/10">
        <div className="flex items-baseline justify-between mb-3 sm:mb-4">
          <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Total</span>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              R$ {selectedService ? selectedService.price.toFixed(2) : '0,00'}
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400">
              {currentStep === 4
                ? paymentMethod === 'pix'
                  ? 'PIX Instantâneo'
                  : 'Pagamento no Local'
                : 'Pagamento no estabelecimento'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {currentStep < 5 && (
          <button
            type="button"
            disabled={!canProceed || isSubmitting}
            onClick={onProceed}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg touch-target ${
              canProceed && !isSubmitting
                ? 'bg-brand-primary text-black hover:opacity-95 active:scale-[0.98] shadow-brand-primary/20 cursor-pointer'
                : 'bg-black/5 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-black/5 dark:border-white/5'
            }`}
          >
            <span>{getButtonText()}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4 shrink-0" />}
          </button>
        )}

        {/* Guarantee Banner */}
        <div className="mt-3.5 sm:mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center space-x-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Cancelamento gratuito até 2h antes do horário agendado.</span>
        </div>
      </div>
    </div>
  );
};
