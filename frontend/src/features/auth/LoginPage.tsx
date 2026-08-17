import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole, Tenant } from '../../types';
import { Lock, Shield, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  tenant: Tenant | null;
  targetRole?: UserRole | null;
  onSuccessRedirect?: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  tenant,
  targetRole = 'customer',
  onSuccessRedirect,
}) => {
  const { loginDemo, isLoading, triggerGoogleOneTap, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(targetRole || 'customer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (targetRole) {
      setSelectedRole(targetRole);
    }
  }, [targetRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerGoogleOneTap();
    }, 400);
    return () => clearTimeout(timer);
  }, [triggerGoogleOneTap]);

  useEffect(() => {
    if (user && onSuccessRedirect) {
      onSuccessRedirect(user.role);
    }
  }, [user, onSuccessRedirect]);

  const handleGoogleLogin = () => {
    setErrorMessage(null);
    if (window.google?.accounts?.id) {
      triggerGoogleOneTap();
    } else {
      loginDemo('usuario.google@empresa.com.br', selectedRole, 'Usuário Google Autenticado', tenant?.slug);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-amber-500 to-amber-600" />

        {/* Header Content */}
        <div className="text-center relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-primary/15 text-brand-primary border border-brand-primary/30 flex items-center justify-center shadow-lg shadow-brand-primary/20 mb-4">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/15 text-amber-800 dark:text-brand-primary border border-brand-primary/30 uppercase tracking-wider mb-2">
            Acesso Restrito e Seguro
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Entrar na Plataforma
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Identifique-se para acessar agendamentos, painéis técnicos ou gestão administrativa.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4 relative z-10">
          {/* Main Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 group cursor-pointer"
          >
            <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Autenticando...' : 'Fazer Login com o Google'}</span>
          </button>

        </div>

        {/* Security and Privacy Assurance */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Conformidade com a LGPD</span>
          </div>
          <span>Conexão Segura</span>
        </div>
      </div>
    </div>
  );
};
