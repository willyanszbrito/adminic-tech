import * as React from 'react';
import { PortalView, Tenant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  ShieldAlert,
  Sun,
  Moon,
  Layers,
  Server,
  LogIn,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

export interface TopNavProps {
  currentView: PortalView;
  onSelectView: (view: PortalView) => void;
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

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'booking' as PortalView, label: 'Agendamento Público', icon: Calendar },
    { id: 'customer' as PortalView, label: 'Meus Agendamentos', icon: UserCheck },
    { id: 'staff' as PortalView, label: 'Colaborador', icon: Briefcase },
    { id: 'admin' as PortalView, label: 'Gestão do Parceiro', icon: LayoutDashboard },
    { id: 'super-admin' as PortalView, label: 'Super Admin', icon: ShieldAlert },
  ];

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'customer': return 'Cliente';
      case 'staff': return 'Colaborador';
      case 'partner_admin': return 'Gestor';
      case 'super_admin': return 'Super Admin';
      default: return 'Conectado';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'customer': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'staff': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'partner_admin': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'super_admin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/10 dark:border-white/10 px-4 sm:px-8 py-3 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Brand and Portal Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/40 flex items-center justify-center font-extrabold font-heading text-sm shadow-md">
              A
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold tracking-wider uppercase font-heading text-slate-900 dark:text-white">
                  Adminic
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono">
                  ia.adminic.com.br
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                Plataforma de Agendamento Multi-Tenant
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-xs glass-pill text-slate-700 dark:text-slate-300"
              title="Alternar Tema Claro/Escuro"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1.5 rounded-xl border border-brand-primary/40"
              >
                <img
                  src={user?.avatar_url || 'https://placehold.co/100x100/3b82f6/ffffff?text=User'}
                  alt={user?.name}
                  className="w-6 h-6 rounded-lg object-cover"
                />
              </button>
            ) : (
              <button
                onClick={() => openLoginModal()}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-black flex items-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Portal Switcher Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
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

        {/* Right Action Shortcuts */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 transition-all cursor-pointer"
            title={themeMode === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Partner Selector */}
          <button
            onClick={onOpenSwitcher}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-brand-primary" />
            <span>Parceiro:</span>
            <span className="font-mono text-brand-primary">{tenant.slug}</span>
          </button>

          {/* Swagger API */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 transition-all"
            title="Documentação OpenAPI Swagger"
          >
            <Server className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>API Docs</span>
          </a>

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
                  className="w-5 h-5 rounded-lg object-cover"
                />
                <span className="max-w-[100px] truncate font-medium">{user.name.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-panel bg-surface border border-surface-border rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 border-b border-surface-border mb-1">
                    <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                    <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                    <div className="mt-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-text-main hover:bg-surface-secondary flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-primary-500" />
                    <span>Alternar Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal()}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-all flex items-center space-x-1.5 shadow-md shadow-brand-primary/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

