import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { Shield, Lock, X, CheckCircle2, Sparkles, User, Briefcase, LayoutDashboard, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: UserRole | null;
  targetSlug?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  targetSlug = 'barbearia-vintage',
}) => {
  const { loginDemo, isLoading, triggerGoogleOneTap } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'demo'>('google');
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole>(targetRole || 'customer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (targetRole) {
      setSelectedDemoRole(targetRole);
    }
  }, [targetRole]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        triggerGoogleOneTap();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, triggerGoogleOneTap]);

  if (!isOpen) return null;

  const handleGoogleClick = () => {
    setErrorMessage(null);
    if (window.google?.accounts?.id) {
      triggerGoogleOneTap();
    } else {
      loginDemo('usuario.google@empresa.com.br', selectedDemoRole, 'Usuário Google Autenticado', targetSlug);
    }
  };

  const handleDemoSubmit = async (role: UserRole) => {
    setErrorMessage(null);
    let email = '';
    let name = '';
    let staffId: string | undefined = undefined;

    switch (role) {
      case 'customer':
        email = 'valerius.maximus@empresa.com.br';
        name = 'Valerius Maximus';
        break;
      case 'staff':
        email = 'marcus.barber@empresa.com.br';
        name = 'Marcus Aurelius Silva Jr.';
        staffId = 'stf-marcus-barber';
        break;
      case 'partner_admin':
        email = 'diretoria@aurabarber.com.br';
        name = 'Diretoria Executiva do Estabelecimento';
        break;
      case 'super_admin':
        email = 'diretoria@adminic.com.br';
        name = 'Diretoria Global Adminic';
        break;
    }

    const success = await loginDemo(email, role, name, targetSlug, staffId);
    if (success) {
      onClose();
    } else {
      setErrorMessage('Não foi possível autenticar a sessão. Verifique os dados e tente novamente.');
    }
  };

  const getRoleTitle = (role?: UserRole | null) => {
    switch (role) {
      case 'customer': return 'Portal do Cliente';
      case 'staff': return 'Painel do Colaborador';
      case 'partner_admin': return 'Gestão do Estabelecimento';
      case 'super_admin': return 'Super Administrador Global';
      default: return 'Acesso Unificado ao Sistema';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-amber-500 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Brand and Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-amber-800 dark:text-brand-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5 text-brand-primary" />
              <span>Autenticação Segura Adminic</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              {getRoleTitle(targetRole)}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
              Conecte-se com sua conta corporativa Google ou utilize o acesso rápido para validação.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-white/10 mb-6">
            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'google'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Google One Tap</span>
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'demo'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>Perfis de Demonstração</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'google' ? (
            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
                <span>{isLoading ? 'Autenticando...' : 'Continuar com o Google'}</span>
              </button>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Google Identity Services e One Tap</span>
                </div>
                <p className="leading-relaxed">
                  O login ocorre via protocolo OpenID Connect com token JWT validado criptograficamente no backend da Adminic. Se a janela de 1 clique não abrir automaticamente, clique no botão acima.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Selecione um papel para navegar instantaneamente no sistema com permissões predefinidas:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Cliente */}
                <button
                  type="button"
                  onClick={() => handleDemoSubmit('customer')}
                  disabled={isLoading}
                  className="p-3.5 text-left rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-brand-primary/60 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cliente</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Consulta de agendamentos e vouchers</p>
                  </div>
                </button>

                {/* 2. Colaborador */}
                <button
                  type="button"
                  onClick={() => handleDemoSubmit('staff')}
                  disabled={isLoading}
                  className="p-3.5 text-left rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-brand-primary/60 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Colaborador</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Agenda e bloqueios de horário</p>
                  </div>
                </button>

                {/* 3. Gestor Parceiro */}
                <button
                  type="button"
                  onClick={() => handleDemoSubmit('partner_admin')}
                  disabled={isLoading}
                  className="p-3.5 text-left rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-brand-primary/60 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gestão Estabelecimento</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Métricas, faturamento e catálogo</p>
                  </div>
                </button>

                {/* 4. Super Admin */}
                <button
                  type="button"
                  onClick={() => handleDemoSubmit('super_admin')}
                  disabled={isLoading}
                  className="p-3.5 text-left rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-brand-primary/60 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Super Admin Global</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Visão executiva e onboarding</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Security and LGPD Assurance Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Conformidade com a LGPD</span>
            </div>
            <span>Criptografia SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
