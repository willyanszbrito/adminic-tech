import * as React from 'react';
import { useState, useEffect } from 'react';
import { SuperAdminOverview } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Users,
  DollarSign,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  X,
  Lock,
  FileCheck2,
  Activity,
  ShieldCheck,
  Search,
  RefreshCw,
  Mail
} from 'lucide-react';

export interface SuperAdminPortalProps {
  onImpersonateTenant: (slug: string) => void;
  onRefreshEcosystem: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  onImpersonateTenant,
  onRefreshEcosystem,
}) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [overview, setOverview] = useState<SuperAdminOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingEmailSlug, setSendingEmailSlug] = useState<string | null>(null);

  // New Tenant Form State
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [newSlogan, setNewSlogan] = useState('');
  const [newCategory, setNewCategory] = useState('barbearia');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPrimaryColor, setNewPrimaryColor] = useState('#d4af37');
  const [newSecondaryColor, setNewSecondaryColor] = useState('#121212');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState('');

  const isSuperAdminAuthorized = isAuthenticated && user?.role === 'super_admin';

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuperAdminOverview();
      setOverview(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar dados do ecossistema.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const logs = await api.getAuditTrail(100);
      setAuditLogs(logs);
    } catch (err: any) {
      setErrorMessage('Erro ao carregar trilha de auditoria.');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (isSuperAdminAuthorized) {
      loadOverview();
    }
  }, [isSuperAdminAuthorized]);

  const handleSendWelcomeEmail = async (slug: string, name: string) => {
    setSendingEmailSlug(slug);
    try {
      await api.sendPartnerWelcomeEmail(slug);
      setSuccessMessage(`E-mail de acesso e instruções enviado com sucesso para o parceiro "${name}"!`);
    } catch (err: any) {
      setErrorMessage(err.message || `Falha ao enviar e-mail para ${name}.`);
    } finally {
      setSendingEmailSlug(null);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.createTenant({
        slug: newSlug.trim().toLowerCase(),
        name: newName.trim(),
        slogan: newSlogan.trim(),
        category: newCategory,
        email: newEmail.trim(),
        phone: newPhone.trim(),
        whatsapp: newWhatsapp.trim(),
        address: newAddress.trim(),
        primary_color: newPrimaryColor,
        secondary_color: newSecondaryColor,
      });

      setSuccessMessage(`Parceiro "${newName}" credenciado com sucesso! E-mail com link de acesso via Google enviado para ${newEmail.trim()}.`);
      setIsModalOpen(false);
      setNewSlug('');
      setNewName('');
      setNewSlogan('');
      setNewEmail('');
      setNewPhone('');
      setNewWhatsapp('');
      setNewAddress('');
      loadOverview();
      onRefreshEcosystem();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao credenciar parceiro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Tela de Bloqueio de Acesso
  if (!isSuperAdminAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fade-in">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl space-y-6 bg-white dark:bg-zinc-950">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Acesso Restrito
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white pt-2">
              Acesso Restrito
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Esta área requer autenticação e permissões adequadas para acesso.
            </p>
          </div>

          <button
            onClick={() => openLoginModal('super_admin')}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer touch-target"
          >
            <span>Fazer Login para Acessar</span>
          </button>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter((log) => {
    if (!auditFilter) return true;
    const q = auditFilter.toLowerCase();
    return (
      (log.acao && log.acao.toLowerCase().includes(q)) ||
      (log.usuario && log.usuario.toLowerCase().includes(q)) ||
      (log.tipo && log.tipo.toLowerCase().includes(q)) ||
      (log.ip_origem && log.ip_origem.toLowerCase().includes(q)) ||
      (log.hash_integridade && log.hash_integridade.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8 space-y-4 border border-black/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Super Administrador • {user?.email}</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                Painel Global
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white pt-1">
              Centro de Governança e Auditoria do Ecossistema
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Monitoramento dos parceiros credenciados, gestão de trials e trilha de auditoria criptográfica com SHA-256.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer touch-target"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Credenciar Novo Parceiro</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 pt-2 border-t border-black/10 dark:border-white/10 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 touch-target ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Visão dos Parceiros ({overview?.tenants?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('audit');
              loadAuditLogs();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shrink-0 touch-target ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>Trilha de Auditoria ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW DOS PARCEIROS */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Parceiros Credenciados</span>
                <Building2 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {overview?.total_tenants || 0}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{overview?.active_trials || 0}</span> ativos no trial
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Faturamento Mensal Consolidado</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                R$ {(overview?.total_monthly_volume || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Volume transacionado no ecossistema</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Trials Ativos (30 dias)</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {overview?.active_trials || 0}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Período gratuito de experimentação</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2 border border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total de Agendamentos</span>
                <Users className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {overview?.total_ecosystem_appointments || 0}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Vouchers emitidos e validados</div>
            </div>
          </div>

          {/* Tenants List */}
          <div className="glass-panel rounded-3xl p-5 sm:p-8 space-y-6 border border-black/10 dark:border-white/10">
            <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
              Estabelecimentos Parceiros Credenciados
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {overview?.tenants?.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {t.category}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {t.trial_days_remaining} dias restantes
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{t.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                        Responsável: <span className="text-slate-700 dark:text-slate-300 font-mono">{t.owner_email || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{t.slug}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendWelcomeEmail(t.slug, t.name)}
                          disabled={sendingEmailSlug === t.slug}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer touch-target disabled:opacity-50"
                          title="Enviar e-mail com link de acesso e instruções de login Google"
                        >
                          <Mail className={`w-3.5 h-3.5 text-amber-500 ${sendingEmailSlug === t.slug ? 'animate-bounce' : ''}`} />
                          <span className="hidden sm:inline">{sendingEmailSlug === t.slug ? 'Enviando...' : 'Enviar Acesso'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onImpersonateTenant(t.slug)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer touch-target"
                        >
                          <span>Acessar</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: TRILHA DE AUDITORIA CRIPTOGRÁFICA (SHA-256) */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-3xl p-5 sm:p-8 space-y-6 border border-black/10 dark:border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Trilha de Auditoria Digital Imutável (SHA-256)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Registros de integridade encadeados por hash SHA-256 com rastreamento de IP, User-Agent e ações.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filtrar por ação, IP ou hash..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full sm:w-64"
                />
              </div>
              <button
                onClick={loadAuditLogs}
                disabled={isLoadingAudit}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer touch-target shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700"
                title="Atualizar Logs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAudit ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {isLoadingAudit ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhum registro de auditoria encontrado para o filtro aplicado.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 px-1 scrollbar-none">
              <table className="w-full text-left text-xs min-w-[680px]">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Data e Hora (Manaus)</th>
                    <th className="pb-3 pr-4">Ação</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Usuário</th>
                    <th className="pb-3 pr-4">IP de Origem</th>
                    <th className="pb-3">Hash de Integridade (SHA-256)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono text-[11px]">
                  {filteredLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : 'N/A'}
                      </td>
                      <td className="py-3 pr-4 text-slate-900 dark:text-white font-sans font-semibold">
                        {log.acao}
                      </td>
                      <td className="py-3 pr-4 font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.tipo?.includes('SECURITY') ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30' :
                          log.tipo?.includes('AUTH') ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30' :
                          log.tipo?.includes('WRITE') ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' :
                          'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        }`}>
                          {log.tipo}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-700 dark:text-slate-300 font-sans">
                        {log.usuario}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                        {log.ip_origem || '0.0.0.0'}
                      </td>
                      <td className="py-3 text-amber-600 dark:text-amber-400/90 font-mono text-[10px] truncate max-w-xs" title={log.hash_integridade}>
                        {log.hash_integridade ? `${log.hash_integridade.substring(0, 16)}...` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Credenciar Novo Parceiro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">Credenciar Novo Parceiro</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer touch-target"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nome do Estabelecimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Imperial"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Slug da URL (ex: barbearia-imperial) *</label>
                <input
                  type="text"
                  required
                  placeholder="barbearia-imperial"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="barbearia">Barbearia</option>
                    <option value="clinica">Clínica</option>
                    <option value="estetica">Estética e Beleza</option>
                    <option value="automotivo">Automotivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">WhatsApp (com DDD) *</label>
                  <input
                    type="text"
                    required
                    placeholder="92984899955"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  E-mail Google do Gestor / Responsável *
                </label>
                <input
                  type="email"
                  required
                  placeholder="gestor@gmail.com ou email corporativo Google"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 placeholder-slate-400"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  O parceiro utilizará este e-mail para fazer login instantâneo com 1 clique usando sua conta Google.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newPrimaryColor}
                      onChange={(e) => setNewPrimaryColor(e.target.value)}
                      className="w-10 h-9 rounded-lg bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{newPrimaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cor Secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newSecondaryColor}
                      onChange={(e) => setNewSecondaryColor(e.target.value)}
                      className="w-10 h-9 rounded-lg bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{newSecondaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer touch-target flex items-center justify-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50 cursor-pointer touch-target flex items-center justify-center"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Credenciar Parceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
