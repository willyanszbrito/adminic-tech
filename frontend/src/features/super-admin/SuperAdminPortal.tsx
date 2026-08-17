import * as React from 'react';
import { useState, useEffect } from 'react';
import { SuperAdminOverview } from '../../types';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Building2,
  Users,
  DollarSign,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

export interface SuperAdminPortalProps {
  onImpersonateTenant: (slug: string) => void;
  onRefreshEcosystem: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({
  onImpersonateTenant,
  onRefreshEcosystem,
}) => {
  const [overview, setOverview] = useState<SuperAdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [newPrimaryColor, setNewPrimaryColor] = useState('#0ea5e9');
  const [newSecondaryColor, setNewSecondaryColor] = useState('#0f172a');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    loadOverview();
  }, []);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Super Administrador Executivo</span>
              </span>
              <span className="text-xs text-slate-500 font-mono">adminic.com.br</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
              Centro de Controle Global do Ecossistema
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Visão macro de todas as empresas cadastradas, licenciamento de trials de 30 dias e impersonação direta.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Credenciar Novo Parceiro</span>
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

      {/* Global Metrics Cards */}
      {isLoading ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        </div>
      ) : overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-3xl p-6 border border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Parceiros Ativos</span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              {overview.total_tenants}
            </p>
            <span className="text-[11px] text-slate-500 block">
              Empresas operando no ecossistema
            </span>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Trials Ativos</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              {overview.active_trials}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              100% de adesão ao período de 30 dias
            </span>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Agendamentos Totais</span>
              <div className="p-2 rounded-xl bg-brand-primary/15 text-brand-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              {overview.total_ecosystem_appointments}
            </p>
            <span className="text-[11px] text-slate-500 block">
              Processados em toda a rede Adminic
            </span>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-black/10 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Volume Mensal</span>
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              R$ {overview.total_monthly_volume.toFixed(2)}
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Volume consolidado dos parceiros
            </span>
          </div>
        </div>
      )}

      {/* Tenants Roster Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-primary" />
            <span>Relação de Empresas e Status de Licenciamento (30 Dias)</span>
          </h3>
          <span className="text-xs text-slate-500">
            {overview?.tenants.length || 0} credenciadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Empresa Parceira</th>
                <th className="py-3 px-3">Segmento</th>
                <th className="py-3 px-3">Status do Trial (30 Dias)</th>
                <th className="py-3 px-3">Faturamento Estimado</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {overview?.tenants.map((t) => (
                <tr key={t.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-3">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</div>
                    <span className="font-mono text-[10px] text-slate-500">ia.adminic.com.br/{t.slug}</span>
                  </td>

                  <td className="py-4 px-3 capitalize text-slate-700 dark:text-slate-300 font-medium">
                    {t.category}
                  </td>

                  <td className="py-4 px-3">
                    <div className="space-y-1.5 w-48">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {t.trial_days_remaining} dias restantes
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">Término: {t.trial_ends_at}</span>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${(t.trial_days_remaining / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3 font-extrabold text-slate-900 dark:text-white font-heading">
                    R$ {t.monthly_revenue.toFixed(2)}
                  </td>

                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={() => onImpersonateTenant(t.slug)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-all flex items-center space-x-1 ml-auto cursor-pointer shadow-sm"
                      title="Abrir ambiente desta empresa"
                    >
                      <span>Impersonar / Acessar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Credenciar Novo Parceiro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15 shadow-2xl bg-white dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    Credenciar Nova Empresa Parceira
                  </h3>
                  <p className="text-xs text-slate-500">Inicia automaticamente com 30 dias de Trial gratuito</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug da URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="ex: nova-clinica-prime"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Clínica Prime Saúde"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Slogan ou Frase de Impacto *
                </label>
                <input
                  type="text"
                  required
                  value={newSlogan}
                  onChange={(e) => setNewSlogan(e.target.value)}
                  placeholder="ex: Medicina Integrada e Bem-Estar"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Segmento *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-transparent"
                  >
                    <option value="barbearia" className="bg-white dark:bg-zinc-900">Barbearia</option>
                    <option value="clinica" className="bg-white dark:bg-zinc-900">Clínica</option>
                    <option value="estetica" className="bg-white dark:bg-zinc-900">Estética e Beleza</option>
                    <option value="automotivo" className="bg-white dark:bg-zinc-900">Estética Automotiva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail do Responsável *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    placeholder="5511988887777"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Avenida Paulista, 1000, São Paulo - SP"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cor Primária (HEX)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newPrimaryColor}
                      onChange={(e) => setNewPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newPrimaryColor}
                      onChange={(e) => setNewPrimaryColor(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cor Secundária (HEX)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newSecondaryColor}
                      onChange={(e) => setNewSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newSecondaryColor}
                      onChange={(e) => setNewSecondaryColor(e.target.value)}
                      className="w-full glass-input px-3 py-1.5 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Finalizar Credenciamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
