import React from 'react';
import { Lock, ArrowLeft, LogIn, UserCheck, LogOut } from 'lucide-react';

export interface RestrictedAccessViewProps {
  userRole?: string;
  onOpenLogin: () => void;
  onGoHome: () => void;
  onNavigateCustomer?: () => void;
  onLogout?: () => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  userRole,
  onOpenLogin,
  onGoHome,
  onNavigateCustomer,
  onLogout,
}) => {
  const isCustomer = userRole === 'customer';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-black/10 dark:border-white/10 text-center space-y-6 shadow-2xl bg-white dark:bg-zinc-950">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400">
            Acesso Restrito
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white pt-1">
            Recurso Indisponível
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isCustomer
              ? 'Esta página não está disponível para o seu perfil. Utilize os atalhos abaixo para gerenciar seus agendamentos.'
              : 'Esta área requer autenticação prévia para ser acessada.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {isCustomer ? (
            <>
              {onNavigateCustomer && (
                <button
                  type="button"
                  onClick={onNavigateCustomer}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:opacity-90 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-brand-primary/20 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Ir para Meus Agendamentos</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-3 px-4 rounded-xl glass-pill text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-black/10 dark:border-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:opacity-90 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-brand-primary/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Identificar-se</span>
            </button>
          )}

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
