import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tenant, DashboardMetrics, Service, ServiceCategory, Staff } from '../../types';
import { api } from '../../services/api';
import {
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Percent,
  Clock,
  Plus,
  Palette,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scissors,
  Users,
  QrCode,
  Store,
  Trash2,
  Edit3,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

export interface AdminPortalProps {
  tenant: Tenant;
  categories: ServiceCategory[];
  services: Service[];
  staffList?: Staff[];
  onRefreshTenant: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  tenant,
  categories,
  services,
  staffList = [],
  onRefreshTenant,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'catalog' | 'staff' | 'pix' | 'settings'>('metrics');

  // Service Management State
  const [isEditingService, setIsEditingService] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState(categories[0]?.id || '');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceDuration, setServiceDuration] = useState(30);
  const [servicePrice, setServicePrice] = useState(30);
  const [serviceImageUrl, setServiceImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Category Management State
  const [newCatName, setNewCatName] = useState('');

  // Staff Management State
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Barbeiro Especialista');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffBio, setStaffBio] = useState('');
  const [staffAvatar, setStaffAvatar] = useState(tenant.logo_url || '');

  // PIX & Mercado Pago Settings State
  const [pixEnabled, setPixEnabled] = useState(tenant.pix_enabled ?? true);
  const [pixMode, setPixMode] = useState<'production' | 'test_penny'>(
    tenant.pix_mode || 'test_penny'
  );
  const [mpPublicKey, setMpPublicKey] = useState(tenant.mercadopago_public_key || '');
  const [mpAccessToken, setMpAccessToken] = useState(tenant.mercadopago_access_token || '');
  const [mpPixKey, setMpPixKey] = useState(tenant.mercadopago_pix_key || '');
  const [whatsappMsg, setWhatsappMsg] = useState(tenant.whatsapp_custom_message || '');

  // General Settings & Theme State
  const [name, setName] = useState(tenant.name);
  const [slogan, setSlogan] = useState(tenant.slogan);
  const [description, setDescription] = useState(tenant.description);
  const [phone, setPhone] = useState(tenant.phone);
  const [whatsapp, setWhatsapp] = useState(tenant.whatsapp);
  const [email, setEmail] = useState(tenant.email);
  const [address, setAddress] = useState(tenant.address);
  const [instagram, setInstagram] = useState(tenant.instagram || '');
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url);
  const [primaryColor, setPrimaryColor] = useState(tenant.theme.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(tenant.theme.secondary_color);
  const [accentColor, setAccentColor] = useState(tenant.theme.accent_color);
  const [badgeText, setBadgeText] = useState(tenant.theme.badge_text);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMetrics = async () => {
    try {
      const data = await api.getTenantDashboardMetrics(tenant.slug);
      setMetrics(data);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [tenant.slug]);

  // Handle Create or Update Service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (isEditingService) {
        await api.updateService(tenant.slug, isEditingService, {
          name: serviceName,
          category_id: serviceCategory,
          description: serviceDescription,
          duration_minutes: Number(serviceDuration),
          price: Number(servicePrice),
          image_url: serviceImageUrl || undefined,
          is_featured: isFeatured,
        });
        setSuccessMessage(`Serviço "${serviceName}" atualizado com sucesso!`);
        setIsEditingService(null);
      } else {
        await api.createService(tenant.slug, {
          category_id: serviceCategory || categories[0]?.id || 'cat-cortes',
          name: serviceName,
          description: serviceDescription,
          duration_minutes: Number(serviceDuration),
          price: Number(servicePrice),
          is_featured: isFeatured,
        });
        setSuccessMessage(`Serviço "${serviceName}" adicionado ao catálogo!`);
      }
      setServiceName('');
      setServiceDescription('');
      setServiceImageUrl('');
      onRefreshTenant();
      loadMetrics();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar serviço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditServiceClick = (srv: Service) => {
    setIsEditingService(srv.id);
    setServiceName(srv.name);
    setServiceCategory(srv.category_id);
    setServiceDescription(srv.description);
    setServiceDuration(srv.duration_minutes);
    setServicePrice(srv.price);
    setServiceImageUrl(srv.image_url || '');
    setIsFeatured(srv.is_featured);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteService = async (srvId: string, srvName: string) => {
    if (!confirm(`Deseja realmente excluir o serviço "${srvName}"?`)) return;
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.deleteService(tenant.slug, srvId);
      setSuccessMessage(`Serviço "${srvName}" excluído com sucesso!`);
      onRefreshTenant();
      loadMetrics();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao excluir serviço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createCategory(tenant.slug, {
        name: newCatName,
        icon: 'scissors',
        display_order: categories.length + 1,
      });
      setSuccessMessage(`Categoria "${newCatName}" criada com sucesso!`);
      setNewCatName('');
      onRefreshTenant();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Deseja realmente excluir a categoria "${catName}"?`)) return;
    setIsSubmitting(true);
    try {
      await api.deleteCategory(tenant.slug, catId);
      setSuccessMessage(`Categoria "${catName}" excluída com sucesso!`);
      onRefreshTenant();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao excluir categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Staff
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.createStaff(tenant.slug, {
        name: staffName,
        role: staffRole,
        phone: staffPhone,
        email: staffEmail,
        bio: staffBio,
        avatar_url: staffAvatar || tenant.logo_url,
        specialty_service_ids: services.map(s => s.id),
      });
      setSuccessMessage(`Colaborador "${staffName}" cadastrado com sucesso!`);
      setStaffName('');
      setStaffBio('');
      onRefreshTenant();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao cadastrar colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (stfId: string, stfName: string) => {
    if (!confirm(`Deseja realmente excluir o profissional "${stfName}" da equipe?`)) return;
    setIsSubmitting(true);
    try {
      await api.deleteStaff(tenant.slug, stfId);
      setSuccessMessage(`Profissional "${stfName}" removido com sucesso.`);
      onRefreshTenant();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao remover colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save PIX Settings
  const handleSavePixSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.updateTenantSettings(tenant.slug, {
        pix_enabled: pixEnabled,
        pix_mode: pixMode,
        pix_penny_price: 0.01,
        mercadopago_public_key: mpPublicKey,
        mercadopago_access_token: mpAccessToken,
        mercadopago_pix_key: mpPixKey,
        whatsapp_custom_message: whatsappMsg,
      });
      setSuccessMessage('Configurações de PIX e Mercado Pago atualizadas com sucesso!');
      onRefreshTenant();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar configurações de pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save General Info & Theme
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.updateTenantSettings(tenant.slug, {
        name,
        slogan,
        description,
        phone,
        whatsapp,
        email,
        address,
        instagram,
        logo_url: logoUrl,
        theme: {
          ...tenant.theme,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: accentColor,
          badge_text: badgeText,
        },
      });
      setSuccessMessage('Dados cadastrais e tema atualizados com sucesso!');
      onRefreshTenant();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar informações da empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                Painel do Parceiro / Gestor
              </span>
              <span className="text-xs text-slate-500">• {tenant.name}</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
              Central de Gestão e Configuração Completa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Gerencie faturamento, catálogo de preços, equipe, pagamentos PIX e identidade visual em tempo real.
            </p>
          </div>

          {/* Mode & Trial Status Badge */}
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-2xl border text-right ${
              pixMode === 'test_penny'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Modo PIX Atual</span>
              <span className={`text-xs font-bold ${pixMode === 'test_penny' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {pixMode === 'test_penny' ? '🧪 Teste Real (R$ 0,01)' : '💰 Produção (Valor Cheio)'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Licença</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {tenant.trial_days_remaining} dias de Trial
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 pt-3 border-t border-black/10 dark:border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Métricas e Desempenho</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Catálogo e Serviços ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'staff'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipe e Colaboradores ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'pix'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>PIX & Mercado Pago (R$ 0,01)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Dados da Empresa & Tema</span>
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

      {/* ========================================================================= */}
      {/* TAB 1: METRICS & OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-3xl p-6 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Faturamento Mensal</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                R$ {(metrics?.monthly_revenue || tenant.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Crescimento estável no período</span>
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Agendamentos</span>
                <CalendarCheck className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {metrics?.confirmed_appointments || 0} confirmados
              </p>
              <p className="text-[11px] text-slate-500">
                Total de {metrics?.total_appointments || 0} solicitações
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                R$ {(metrics?.average_ticket || 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500">Por atendimento concluído</p>
            </div>

            <div className="glass-panel rounded-3xl p-6 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Taxa de Ocupação</span>
                <Percent className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {metrics?.occupancy_rate_percent || 85}%
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Alta eficiência de agenda</p>
            </div>
          </div>

          {/* Recent Bookings List */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>Últimos Atendimentos Registrados</span>
            </h3>

            {metrics?.recent_appointments && metrics.recent_appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-slate-500">
                      <th className="pb-3 font-semibold">Voucher</th>
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Serviço</th>
                      <th className="pb-3 font-semibold">Profissional</th>
                      <th className="pb-3 font-semibold">Data / Hora</th>
                      <th className="pb-3 font-semibold">Valor</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {metrics.recent_appointments.map((a: any) => (
                      <tr key={a.voucher_code} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-bold text-brand-primary">{a.voucher_code}</td>
                        <td className="py-3 font-medium text-slate-900 dark:text-white">{a.customer_name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{a.service?.name || a.service_name || 'Serviço'}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{a.staff?.name || a.staff_name || 'Profissional'}</td>
                        <td className="py-3 text-slate-500">{a.appointment_date || a.date} às {a.start_time}</td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">R$ {Number(a.price).toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}>
                            {a.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum agendamento recente registrado ainda.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CATALOG & SERVICES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Add or Edit Service */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="pb-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-brand-primary" />
                <span>{isEditingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</span>
              </h3>
              {isEditingService && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingService(null);
                    setServiceName('');
                    setServiceDescription('');
                    setServiceImageUrl('');
                  }}
                  className="text-[11px] text-rose-500 font-semibold hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nome do Serviço / Procedimento *
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Corte Degradê, Barboterapia..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Categoria *
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    required
                    value={servicePrice}
                    onChange={(e) => setServicePrice(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    required
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(Number(e.target.value))}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  URL da Imagem / Foto
                </label>
                <input
                  type="text"
                  value={serviceImageUrl}
                  onChange={(e) => setServiceImageUrl(e.target.value)}
                  placeholder="/logos/logo_campelo.jpg ou https://..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Descrição Detalhada
                </label>
                <textarea
                  rows={2}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Explique o que está incluído no procedimento..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs resize-none"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Destacar este serviço no topo do catálogo
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isEditingService ? 'Salvar Edição do Serviço' : 'Cadastrar Serviço'}</span>
              </button>
            </form>

            {/* Quick Add Category Section */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-primary" />
                <span>Nova Categoria de Serviços</span>
              </h4>
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome da categoria..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 glass-input px-3 py-1.5 rounded-lg text-xs"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newCatName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 cursor-pointer"
                >
                  Criar
                </button>
              </form>

              {/* List Categories with Delete */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] text-slate-700 dark:text-slate-300"
                  >
                    <span>{c.name}</span>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                        title="Excluir Categoria"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right List: Current Catalog Services */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Serviços Ativos no Estabelecimento ({services.length})
              </h3>
            </div>

            <div className="space-y-3">
              {services.map((srv) => {
                const cat = categories.find((c) => c.id === srv.category_id);
                return (
                  <div
                    key={srv.id}
                    className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-brand-primary/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-black/5 dark:border-white/10">
                        <img
                          src={srv.image_url || tenant.logo_url}
                          alt={srv.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {srv.name}
                          </h4>
                          {srv.is_featured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              Destaque
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {cat?.name || 'Geral'} • {srv.duration_minutes} min •{' '}
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            R$ {srv.price.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleEditServiceClick(srv)}
                        title="Editar Serviço"
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(srv.id, srv.name)}
                        title="Excluir Serviço"
                        className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STAFF & TEAM MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Add New Staff */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="pb-3 border-b border-black/10 dark:border-white/10">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <span>Adicionar Barbeiro / Colaborador</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastre profissionais que poderão receber agendamentos online.
              </p>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Ex: Julio Sousa, Jefferson..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Cargo / Função *
                </label>
                <input
                  type="text"
                  required
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  placeholder="Ex: Master Barber, Barbeiro Fundador"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="(92) 99104-4930"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="julio@barbearia.com"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Foto de Perfil ou Avatar URL
                </label>
                <input
                  type="text"
                  value={staffAvatar}
                  onChange={(e) => setStaffAvatar(e.target.value)}
                  placeholder="/logos/logo_campelo.jpg"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Biografia / Especialidades
                </label>
                <textarea
                  rows={2}
                  value={staffBio}
                  onChange={(e) => setStaffBio(e.target.value)}
                  placeholder="Resumo da experiência profissional..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Adicionar à Equipe</span>
              </button>
            </form>
          </div>

          {/* Right List: Current Team */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Profissionais Cadastrados ({staffList.length})
              </h3>
            </div>

            <div className="space-y-3">
              {staffList.map((stf) => (
                <div
                  key={stf.id}
                  className="glass-panel rounded-2xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black/10 shrink-0 border border-black/5 dark:border-white/10">
                      <img
                        src={stf.avatar_url || tenant.logo_url}
                        alt={stf.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {stf.name}
                      </h4>
                      <p className="text-xs text-brand-primary font-medium">{stf.role}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {stf.phone || tenant.phone} • {stf.specialty_service_ids.length} serviços habilitados
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStaff(stf.id, stf.name)}
                    disabled={staffList.length <= 1}
                    title={staffList.length <= 1 ? 'Não é possível excluir o único profissional' : 'Excluir'}
                    className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PIX & MERCADO PAGO CONFIGURATION (R$ 0,01 PENNY MODE) */}
      {/* ========================================================================= */}
      {activeTab === 'pix' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
          <div className="pb-4 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                <span>Integração de Pagamento PIX Instantâneo & Mercado Pago</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure as credenciais e escolha o modo de cobrança para validação real em produção ou valor integral.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Chaves Criptografadas</span>
            </div>
          </div>

          <form onSubmit={handleSavePixSettings} className="space-y-6">
            {/* PIX Enable Switch */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Habilitar Pagamento PIX na Tela de Agendamento
                </h4>
                <p className="text-[11px] text-slate-500">
                  Permite que os clientes paguem via PIX com QR Code dinâmico e Copia e Cola antes ou após a reserva.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pixEnabled}
                  onChange={(e) => setPixEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Mode Selector: Production vs 1 Cent Test Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 dark:text-white">
                Modo de Operação do PIX:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                    pixMode === 'test_penny'
                      ? 'border-brand-primary bg-brand-primary/10 shadow-lg'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="pixMode"
                        value="test_penny"
                        checked={pixMode === 'test_penny'}
                        onChange={() => setPixMode('test_penny')}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Modo Validação Real de Produção (R$ 0,01)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      Recomendado p/ Testes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    O QR Code oficial cobra apenas <strong>R$ 0,01 centavo</strong> no banco real do cliente para você testar todo o fluxo com custos mínimos antes de cobrar o valor real.
                  </p>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                    pixMode === 'production'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg'
                      : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="pixMode"
                        value="production"
                        checked={pixMode === 'production'}
                        onChange={() => setPixMode('production')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Modo Comercial Cheio (Valor Integral)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Produção Ativa
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Cobra o valor integral cadastrado de cada serviço (ex: R$ 30,00, R$ 70,00) diretamente na conta bancária do estabelecimento.
                  </p>
                </label>
              </div>
            </div>

            {/* Mercado Pago API Keys */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>Credenciais do Mercado Pago</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Public Key (Chave Pública)
                  </label>
                  <input
                    type="text"
                    value={mpPublicKey}
                    onChange={(e) => setMpPublicKey(e.target.value)}
                    placeholder="APP_USR-2495fe9b-0ec9-4b6f-819c-..."
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Access Token (Chave Secreta)
                  </label>
                  <input
                    type="password"
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder="APP_USR-..."
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Chave PIX do Estabelecimento (E-mail, Telefone, CNPJ ou Aleatória)
                </label>
                <input
                  type="text"
                  value={mpPixKey}
                  onChange={(e) => setMpPixKey(e.target.value)}
                  placeholder="ex: contato@campelobarbearia.com.br ou 92991044930"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Template de Notificação WhatsApp Personalizada
                </label>
                <textarea
                  rows={2}
                  value={whatsappMsg}
                  onChange={(e) => setWhatsappMsg(e.target.value)}
                  placeholder="Olá {cliente}! Seu agendamento de {servico} na Barbearia foi confirmado com sucesso para {data} às {hora}."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Configurações de Pagamento e PIX</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GENERAL SETTINGS & THEME */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
          <div className="pb-4 border-b border-black/10 dark:border-white/10">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <Store className="w-5 h-5 text-brand-primary" />
              <span>Dados Cadastrais, Contato e Identidade Visual</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Personalize o nome da barbearia, slogan, endereço, redes sociais e cores do tema.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Logo Preview & URL */}
            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/10 shrink-0 border border-black/10 dark:border-white/10">
                <img
                  src={logoUrl || tenant.logo_url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  URL do Logotipo do Estabelecimento
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/logos/logo_campelo.jpg ou link https://..."
                  className="w-full glass-input px-3 py-1.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Nome e Slogan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nome do Estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Slogan / Subtítulo *
                </label>
                <input
                  type="text"
                  required
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Contatos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span>Telefone Comercial</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span>WhatsApp Principal</span>
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-sky-500" />
                  <span>E-mail</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@campelobarbearia_"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Endereço Completo</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Cosme Ferreira, 6340 - Zumbi dos Palmares, Manaus - AM"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Descrição e Apresentação da Barbearia
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs resize-none"
              />
            </div>

            {/* Theme Colors */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-brand-primary" />
                <span>Paleta de Cores e Identidade Visual</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Cor Primária</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full glass-input px-2 py-1 text-[11px] font-mono rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Cor Secundária</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full glass-input px-2 py-1 text-[11px] font-mono rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Cor de Destaque</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full glass-input px-2 py-1 text-[11px] font-mono rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Selo do Topo</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full glass-input px-2 py-2 text-[11px] rounded"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Dados Cadastrais e Tema</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
