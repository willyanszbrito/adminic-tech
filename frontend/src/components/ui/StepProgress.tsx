import React from 'react';
import { WizardStep } from '../../types';
import { Check, Scissors, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface StepProgressProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  maxStepReached: number;
}

const steps = [
  { step: 1 as WizardStep, label: 'Servico', icon: Scissors },
  { step: 2 as WizardStep, label: 'Profissional', icon: User },
  { step: 3 as WizardStep, label: 'Data e Hora', icon: Calendar },
  { step: 4 as WizardStep, label: 'Seus Dados', icon: FileText },
  { step: 5 as WizardStep, label: 'Voucher', icon: CheckCircle2 },
];

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  onStepClick,
  maxStepReached,
}) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-3.5 sm:p-5 mb-6 sm:mb-8">
      {/* Mobile Step Bar */}
      <div className="flex sm:hidden items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/40 flex items-center justify-center font-bold text-xs shrink-0">
            {currentStep}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium block">
              Etapa {currentStep} de 5
            </span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {steps[currentStep - 1].label}
            </h3>
          </div>
        </div>

        {/* Clickable Mobile Mini Steps */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {steps.slice(0, 4).map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            const isClickable = s.step <= maxStepReached && s.step !== 5;
            return (
              <button
                key={s.step}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(s.step)}
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all touch-target ${
                  isCurrent
                    ? 'bg-brand-primary text-black ring-2 ring-brand-primary/40 shadow-sm'
                    : isCompleted
                    ? 'bg-brand-primary/20 text-brand-primary'
                    : 'bg-black/5 dark:bg-white/10 text-slate-400'
                }`}
                title={`Etapa ${s.step}: ${s.label}`}
              >
                {isCompleted ? '✓' : s.step}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-black/10 dark:bg-white/10 z-0" />
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-[2px] bg-brand-primary z-0 transition-all duration-500"
          style={{
            width: `${((Math.min(currentStep, 5) - 1) / (steps.length - 1)) * 90}%`,
          }}
        />

        {steps.map((item) => {
          const Icon = item.icon;
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const isClickable = item.step <= maxStepReached && item.step !== 5;

          return (
            <button
              key={item.step}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(item.step)}
              className={`relative z-10 flex flex-col items-center group focus:outline-none transition-transform duration-200 ${
                isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/30'
                    : isCurrent
                    ? 'bg-brand-primary/20 text-brand-primary border-2 border-brand-primary shadow-lg shadow-brand-primary/20 ring-4 ring-brand-primary/10'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-400 border border-black/10 dark:border-white/10'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-medium tracking-wide transition-colors ${
                  isCurrent
                    ? 'text-brand-primary font-semibold'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
