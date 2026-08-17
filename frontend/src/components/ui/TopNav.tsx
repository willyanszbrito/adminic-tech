import * as React from 'react';
import { PortalView, Tenant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { isDedicatedSubdomain } from '../../services/domainHelper';
import {
  Calendar,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  ShieldAlert,
  Sun,
  Moon,
  Layers,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Home
} from 'lucide-react';

export interface TopNavProps {
  currentView: PortalView | 'landing';
  onSelectView: (view: PortalView | 'landing') => void;
  tenant: Tenant;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSwitcher: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onSelectView,
  tenant,
  themeMode,
  onToggleTheme,
  onOpenSwitcher,
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const isDedicated = isDedicatedSubdomain();

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // RBAC Dinâmico e Isolamento White-Label por Subdomínio
  const navItems = React.useMemo(() => {
    const items: Array<{ id: PortalView | 'landing'; label: string; icon: any }> = [];

    // Se estiver no portal central (ia.adminic.com.br), exibe a aba Início
    if (!isDedicated) {
      items.push({ id: 'landing', label: 'Início', icon: Home });
      items.push({ id: 'booking', label: `Agendar (${tenant.name})`, icon: Calendar });
    } else {
      // No subdomínio exclusivo da barbearia (ex: campelo.adminic.com.br), exibe apenas a experiência da barbearia
      items.push({ id: 'booking', label: 'Agendar Horário', icon: Calendar });
    }

    items.push({ id: 'customer', label: 'Meus Agendamentos', icon: UserCheck });

    if (isAuthenticated && user) {
      if (user.role === 'staff' || user.role === 'partner_admin' || user.role === 'super_admin') {
        items.push({ id: 'staff', label: 'Colaborador', icon: Briefcase });
      }
      if (user.role === 'partner_admin' || user.role === 'super_admin') {
        items.push({ id: 'admin', label: 'Gestão', icon: LayoutDashboard });
      }
      if (user.role === 'super_admin' && !isDedicated) {
        items.push({ id: 'super-admin', label: 'Super Admin', icon: ShieldAlert });
      }
    }

    return items;
  }, [isAuthenticated, user, tenant.name, isDedicated]);

  const getRoleLabel = (_role?: string) => {
    return 'Conectado';
  };

  const getRoleBadgeColor = (_role?: string) => {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/10 dark:border-white/10 px-3 sm:px-8 py-2.5 sm:py-3 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand and Portal Identity */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => onSelectView(isDedicated ? 'booking' : 'landing')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group min-w-0 flex-1"
          >
            {isDedicated && tenant.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={tenant.name} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-amber-500/40 shadow-md group-hover:scale-105 transition-transform shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/100x100/18181b/${tenant.theme.primary_color.replace('#', '')}?text=${encodeURIComponent(tenant.name.charAt(0))}`;
                }}
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-extrabold font-heading text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform shrink-0">
                {isDedicated ? tenant.name.charAt(0) : 'A'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-xs font-bold tracking-wider uppercase font-heading text-slate-900 dark:text-white truncate">
                  {isDedicated ? tenant.name : 'IA Adminic'}
                </span>
                <span className="hidden min-[380px]:inline-block text-[9px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono truncate max-w-[120px]">
                  {typeof window !== 'undefined' ? window.location.hostname : 'adminic.com.br'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {isDedicated ? (tenant.slogan || 'Agendamento Online Exclusivo') : 'Plataforma de Agendamento Inteligente'}
              </p>
            </div>
          </div>

          {/* Mobile Action Controls */}
          <div className="flex md:hidden items-center space-x-1.5 shrink-0 ml-2" ref={menuRef}>
            {/* Mobile Partner Selector */}
            {!isDedicated && (
              <button
                onClick={onOpenSwitcher}
                className="p-2 rounded-xl text-xs glass-pill text-amber-500 hover:bg-black/5 dark:hover:bg-white/10 border border-amber-500/30 touch-target flex items-center justify-center"
                title="Trocar Estabelecimento"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-xs glass-pill text-slate-700 dark:text-slate-300 touch-target flex items-center justify-center"
              title="Alternar Tema Claro/Escuro"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile User / Auth Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1 rounded-xl border border-amber-500/40 touch-target flex items-center justify-center"
                  title="Menu do Usuário"
                >
                  <img
                    src={user?.avatar_url || 'https://placehold.co/100x100/3b82f6/ffffff?text=User'}
                    alt={user?.name}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                </button>

                {/* Mobile Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-2.5 border border-black/10 dark:border-white/15 shadow-2xl z-50 bg-white dark:bg-zinc-950 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-black/5 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === 'super_admin' && (
                        <button
                          onClick={() => {
                            onSelectView('super-admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-purple-600 dark:text-purple-400"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Painel de Controle</span>
                        </button>
                      )}

                      {(user.role === 'partner_admin' || user.role === 'super_admin') && (
                        <button
                          onClick={() => {
                            onSelectView('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-amber-600 dark:text-amber-400"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Painel Administrativo</span>
                        </button>
                      )}

                      {(user.role === 'staff' || user.role === 'partner_admin' || user.role === 'super_admin') && (
                        <button
                          onClick={() => {
                            onSelectView('staff');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Agenda e Atendimentos</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectView('customer');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-slate-700 dark:text-slate-300"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Meus Agendamentos</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-black/5 dark:border-white/10">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          onSelectView('landing');
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Encerrar Sessão</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-black flex items-center space-x-1 touch-target shadow-md shadow-brand-primary/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Portal Switcher Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20 ring-1 ring-brand-primary/40'
                    : 'glass-pill text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Shortcuts (Desktop) */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 transition-all cursor-pointer"
            title={themeMode === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Partner Selector - Only displayed on central portal */}
          {!isDedicated && (
            <button
              onClick={onOpenSwitcher}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Escolher outro estabelecimento parceiro"
            >
              <Layers className="w-3.5 h-3.5 text-brand-primary" />
              <span>Estabelecimento:</span>
              <span className="font-mono text-brand-primary font-bold">{tenant.slug}</span>
            </button>
          )}

          {/* Authentication Button or User Menu */}
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold glass-pill text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/15 border border-brand-primary/30 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
              >
                <img
                  src={user.avatar_url || 'https://placehold.co/100x100/3b82f6/ffffff?text=User'}
                  alt={user.name}
                  className="w-5 h-5 rounded-md object-cover border border-brand-primary/40"
                />
                <span className="font-medium max-w-[100px] truncate">{user.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-black/10 dark:border-white/15 shadow-2xl z-50 bg-white dark:bg-zinc-950 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-black/5 dark:border-white/10">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {user.role === 'super_admin' && (
                      <button
                        onClick={() => {
                          onSelectView('super-admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-purple-600 dark:text-purple-400"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Painel de Controle</span>
                      </button>
                    )}

                    {(user.role === 'partner_admin' || user.role === 'super_admin') && (
                      <button
                        onClick={() => {
                          onSelectView('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-brand-primary"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Painel Administrativo</span>
                      </button>
                    )}

                    {(user.role === 'staff' || user.role === 'partner_admin' || user.role === 'super_admin') && (
                      <button
                        onClick={() => {
                          onSelectView('staff');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-emerald-600 dark:text-emerald-400"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Agenda e Atendimentos</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectView('customer');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center space-x-2 text-slate-700 dark:text-slate-300"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Meus Agendamentos</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-black/5 dark:border-white/10">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        onSelectView('landing');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-primary hover:opacity-90 text-black shadow-md shadow-brand-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acessar Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
