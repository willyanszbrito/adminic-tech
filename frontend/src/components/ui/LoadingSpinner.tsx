import * as React from 'react';

export interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Carregando',
  submessage,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4 transition-colors duration-300 bg-slate-50 dark:bg-[#08080a] text-slate-900 dark:text-white">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl border-4 border-black/10 dark:border-white/10 border-t-brand-primary animate-spin shadow-xl" />
        <div className="absolute inset-0 rounded-2xl blur-xl bg-brand-glow opacity-60 animate-pulse pointer-events-none" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold font-heading text-slate-800 dark:text-slate-100">
          {message}
        </p>
        {submessage && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {submessage}
          </span>
        )}
      </div>
    </div>
  );
};
