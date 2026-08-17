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
  RefreshCw
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
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const logs = await api.getAuditTrail(100);
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Erro ao carregar auditoria:', e);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (isSuperAdminAuthorized) {
      loadOverview();
      loadAuditLogs();
    }
  }, [isSuperAdminAuthorized]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

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

      setSuccessMessage(`Parceiro "${newName}" credenciado com sucesso com 30 dias de Trial ativo!`);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl space-y-6 bg-white dark:bg-zinc-950">
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
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Administrador Master • {user?.email}</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">ia.adminic.com.br</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
              Centro de Governança e Auditoria do Ecossistema
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Monitoramento dos parceiros credenciados, gestão de trials e trilha de auditoria criptográfica com SHA-256.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Credenciar Novo Parceiro</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/60 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Visão dos Parceiros ({overview?.tenants?.length || 0})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              loadAuditLogs();
            }}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 ${
              activeTab === 'audit'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Trilha de Auditoria Criptográfica ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW DOS PARCEIROS */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Parceiros Credenciados</span>
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-heading text-white">
                {overview?.total_tenants || 0}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="text-emerald-400 font-bold">{overview?.active_trials || 0}</span> ativos
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Faturamento Mensal Consolidado</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-heading text-white">
                R$ {(overview?.total_monthly_volume || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400">Volume transacionado no ecossistema</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Trials Ativos (30 dias)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-heading text-white">
                {overview?.active_trials || 0}
              </div>
              <div className="text-[11px] text-slate-400">Período gratuito de experimentação</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total de Agendamentos</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black font-heading text-white">
                {overview?.total_ecosystem_appointments || 0}
              </div>
              <div className="text-[11px] text-slate-400">Vouchers emitidos e validados</div>
            </div>
          </div>

          {/* Tenants List */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold font-heading text-white">
              Estabelecimentos Parceiros Credenciados
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {overview?.tenants?.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {t.category}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-medium">
                          {t.trial_days_remaining} dias restantes
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{t.name}</h4>
                      <p className="text-xs text-slate-400">
                        Responsável: <span className="text-slate-300 font-mono">{t.owner_email || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">/{t.slug}</span>
                      <button
                        onClick={() => onImpersonateTenant(t.slug)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Acessar Portal</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
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
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                <span>Trilha de Auditoria Digital Imutável (SHA-256)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registros de integridade encadeados por hash SHA-256 com rastreamento de IP, User-Agent e ações.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por ação, IP ou hash..."
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-64"
                />
              </div>
              <button
                onClick={loadAuditLogs}
                disabled={isLoadingAudit}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Data e Hora (Manaus)</th>
                    <th className="pb-3 pr-4">Ação</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Usuário</th>
                    <th className="pb-3 pr-4">IP de Origem</th>
                    <th className="pb-3">Hash de Integridade (SHA-256)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">
                        {log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : 'N/A'}
                      </td>
                      <td className="py-3 pr-4 text-white font-semibold">
                        {log.acao}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.tipo?.includes('SECURITY') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          log.tipo?.includes('AUTH') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          log.tipo?.includes('WRITE') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {log.tipo}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        {log.usuario}
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {log.ip_origem || '0.0.0.0'}
                      </td>
                      <td className="py-3 text-amber-400/90 font-mono text-[10px] truncate max-w-xs" title={log.hash_integridade}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-heading text-white">Credenciar Novo Parceiro</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Estabelecimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Barbearia Imperial"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Slug da URL (ex: barbearia-imperial) *</label>
                <input
                  type="text"
                  required
                  placeholder="barbearia-imperial"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="barbearia">Barbearia</option>
                    <option value="clinica">Clínica</option>
                    <option value="estetica">Estética e Beleza</option>
                    <option value="automotivo">Automotivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">WhatsApp (com DDD) *</label>
                  <input
                    type="text"
                    required
                    placeholder="92984899955"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">E-mail do Responsável *</label>
                <input
                  type="email"
                  required
                  placeholder="contato@empresa.com.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newPrimaryColor}
                      onChange={(e) => setNewPrimaryColor(e.target.value)}
                      className="w-10 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-400">{newPrimaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cor Secundária</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newSecondaryColor}
                      onChange={(e) => setNewSecondaryColor(e.target.value)}
                      className="w-10 h-9 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-400">{newSecondaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-all disabled:opacity-50"
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
