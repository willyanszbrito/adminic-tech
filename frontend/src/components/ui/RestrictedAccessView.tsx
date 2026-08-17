import React from 'react';
import { Lock, ArrowLeft, LogIn } from 'lucide-react';

interface RestrictedAccessViewProps {
  moduleName: string;
  requiredRoleName: string;
  onOpenLogin: () => void;
  onGoHome: () => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  moduleName,
  requiredRoleName,
  onOpenLogin,
  onGoHome,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-amber-500/30 text-center space-y-6 shadow-2xl bg-white dark:bg-zinc-950">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Controle de Acesso (RBAC)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white pt-2">
            Acesso Restrito: {moduleName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Este ambiente exige autenticação ativa e permissões de <strong>{requiredRoleName}</strong> validadas criptograficamente pelo servidor.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Fazer Login para Acessar</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-3 px-4 rounded-xl glass-pill text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-black/10 dark:border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Página Inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
