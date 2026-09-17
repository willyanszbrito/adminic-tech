import React from 'react';
import { Lock, ArrowLeft, LogIn, ShieldAlert, UserCheck, LogOut } from 'lucide-react';

export interface RestrictedAccessViewProps {
  moduleName?: string;
  requiredRoleName?: string;
  userRole?: string;
  userEmail?: string;
  userName?: string;
  tenantName?: string;
  onOpenLogin: () => void;
  onGoHome: () => void;
  onNavigateCustomer?: () => void;
  onLogout?: () => void;
}

export const RestrictedAccessView: React.FC<RestrictedAccessViewProps> = ({
  moduleName = 'Painel Administrativo',
  userRole,
  userEmail,
  userName,
  tenantName,
  onOpenLogin,
  onGoHome,
  onNavigateCustomer,
  onLogout,
}) => {
  const isCustomer = userRole === 'customer';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-amber-500/30 text-center space-y-6 shadow-2xl bg-white dark:bg-zinc-950">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border shadow-lg ${
          isCustomer 
            ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 shadow-rose-500/10' 
            : 'bg-amber-500/15 text-amber-500 border-amber-500/30 shadow-amber-500/10'
        }`}>
          {isCustomer ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
        </div>

        <div className="space-y-2.5">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            isCustomer 
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            {isCustomer ? 'Perfil Não Autorizado' : 'Acesso Restrito'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white pt-1">
            {isCustomer ? 'Acesso Não Permitido' : 'Autenticação Obrigatória'}
          </h2>
          {isCustomer ? (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Você está conectado como <strong className="text-slate-900 dark:text-white">{userName || 'Cliente'}</strong>{' '}
              {userEmail && <span className="font-mono text-[11px]">({userEmail})</span>} com perfil de <strong className="text-amber-600 dark:text-amber-400">Cliente</strong>.
              <br className="hidden sm:inline" /> O {moduleName} é de uso exclusivo de gestores e colaboradores homologados{tenantName ? ` da ${tenantName}` : ''}.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              O {moduleName} requer autenticação de gestor ou colaborador autorizado{tenantName ? ` da ${tenantName}` : ''}.
            </p>
          )}
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
                  <span>Acessar Meus Agendamentos</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-3 px-4 rounded-xl glass-pill text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair / Entrar com Outra Conta</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Fazer Login com Conta Autorizada</span>
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
