import React, { useState, useEffect } from 'react';
import { Staff, Tenant, Service, Appointment } from '../../types';
import { api } from '../../services/api';
import { StaffEmergencyCancelModal } from '../../components/booking/StaffEmergencyCancelModal';
import {
  User,
  Calendar,
  Ban,
  Star,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CalendarCheck
} from 'lucide-react';

export interface StaffPortalProps {
  tenant: Tenant;
  staffList: Staff[];
  services: Service[];
  onRefreshTenant?: () => void;
  onRefreshStaff?: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  tenant,
  staffList,
  services,
  onRefreshTenant,
  onRefreshStaff,
}) => {
  const refresh = onRefreshStaff || onRefreshTenant || (() => {});
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    staffList[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'schedule'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Cancellation Modal State
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const currentStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  // Profile Form State
  const [name, setName] = useState(currentStaff?.name || '');
  const [role, setRole] = useState(currentStaff?.role || '');
  const [phone, setPhone] = useState(currentStaff?.phone || '');
  const [email, setEmail] = useState(currentStaff?.email || '');
  const [bio, setBio] = useState(currentStaff?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentStaff?.avatar_url || '');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    currentStaff?.specialty_service_ids || []
  );

  // Schedule & Shifts State
  const [startTime, setStartTime] = useState(currentStaff?.shifts?.[0]?.start_time || '10:00');
  const [endTime, setEndTime] = useState(currentStaff?.shifts?.[0]?.end_time || '20:00');
  const [lunchStart, setLunchStart] = useState(currentStaff?.shifts?.[0]?.lunch_start || '13:00');
  const [lunchEnd, setLunchEnd] = useState(currentStaff?.shifts?.[0]?.lunch_end || '14:00');

  // Block Slot State
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockStart, setBlockStart] = useState('14:00');
  const [blockEnd, setBlockEnd] = useState('15:30');
  const [blockReason, setBlockReason] = useState('Reunião de Alinhamento / Intervalo');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const data = await api.getTenantDashboardMetrics(tenant.slug);
      if (data && data.recent_appointments) {
        // Filter appointments for the active staff
        const staffAppts = data.recent_appointments.filter(
          (a: Appointment) => !a.staff_id || a.staff_id === currentStaff?.id || a.staff?.id === currentStaff?.id
        );
        setAppointments(staffAppts.length > 0 ? staffAppts : data.recent_appointments);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [tenant.slug, selectedStaffId]);

  useEffect(() => {
    if (currentStaff) {
      setName(currentStaff.name || '');
      setRole(currentStaff.role || '');
      setPhone(currentStaff.phone || '');
      setEmail(currentStaff.email || '');
      setBio(currentStaff.bio || '');
      setAvatarUrl(currentStaff.avatar_url || '');
      setSelectedServices(currentStaff.specialty_service_ids || []);
      if (currentStaff.shifts && currentStaff.shifts.length > 0) {
        setStartTime(currentStaff.shifts[0].start_time || '10:00');
        setEndTime(currentStaff.shifts[0].end_time || '20:00');
        setLunchStart(currentStaff.shifts[0].lunch_start || '13:00');
        setLunchEnd(currentStaff.shifts[0].lunch_end || '14:00');
      }
    }
  }, [selectedStaffId, staffList]);

  const handleStaffChange = (newId: string) => {
    setSelectedStaffId(newId);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleToggleService = (srvId: string) => {
    setSelectedServices(prev =>
      prev.includes(srvId) ? prev.filter(id => id !== srvId) : [...prev, srvId]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const shifts = [0, 1, 2, 3, 4, 5].map(day => ({
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      lunch_start: lunchStart,
      lunch_end: lunchEnd,
    }));

    try {
      await api.updateStaffProfile(tenant.slug, currentStaff.id, {
        name,
        role,
        bio,
        phone,
        email,
        avatar_url: avatarUrl,
        specialty_service_ids: selectedServices,
        shifts,
      });
      setSuccessMessage('Perfil profissional atualizado com sucesso!');
      refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await api.blockStaffSlot(tenant.slug, currentStaff.id, {
        date: blockDate,
        start_time: blockStart,
        end_time: blockEnd,
        reason: blockReason,
      });
      setSuccessMessage(`Bloqueio para ${blockDate} (${blockStart} - ${blockEnd}) adicionado com sucesso!`);
      refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao bloquear horário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancelAppointment = async (voucherCode: string) => {
    try {
      await api.cancelAppointment(tenant.slug, voucherCode);
      setSuccessMessage(`Atendimento (${voucherCode}) cancelado com sucesso. O horário foi liberado no sistema.`);
      loadAppointments();
      refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao cancelar atendimento.');
      throw err;
    }
  };

  if (!currentStaff) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Nenhum colaborador cadastrado neste estabelecimento.
        </p>
      </div>
    );
  }

  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header e Collaborator Switcher */}
      <div className="glass-panel rounded-3xl p-4 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                Área do Colaborador
              </span>
              <span className="text-xs text-slate-500 truncate">• {tenant.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
              Painel do Profissional e Atendimentos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Gerencie seus agendamentos, notifique imprevistos com modelos WhatsApp e E-mail e configure sua jornada.
            </p>
          </div>

          {/* Switch Collaborator Selector */}
          <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 p-2.5 rounded-2xl border border-black/10 dark:border-white/10 w-full sm:w-auto shrink-0">
            <User className="w-4 h-4 text-brand-primary shrink-0" />
            <select
              value={selectedStaffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-full"
            >
              {staffList.map((s: Staff) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {s.name} ({s.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 pt-2 border-t border-black/10 dark:border-white/10 overflow-x-auto -mx-1 px-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap touch-target ${
              activeTab === 'appointments'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Agenda e Atendimentos ({appointments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap touch-target ${
              activeTab === 'profile'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Dados e Apresentação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap touch-target ${
              activeTab === 'schedule'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jornada e Bloqueios</span>
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

      {/* TAB 1: AGENDA E ATENDIMENTOS (Com métricas e cancelamento de imprevisto) */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Visual KPI Summary for Collaborator */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Total de Atendimentos</span>
                <CalendarCheck className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                {appointments.length}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Atribuídos a você</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Confirmados</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
                {confirmedCount}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Prontos para atendimento</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Concluídos</span>
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-xl font-bold font-heading text-sky-600 dark:text-sky-400">
                {completedCount}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Finalizados com sucesso</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-black/10 dark:border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Cancelados</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xl font-bold font-heading text-rose-600 dark:text-rose-400">
                {cancelledCount}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Horários liberados</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-4 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <span>Atendimentos Agendados para {currentStaff.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Caso ocorra qualquer imprevisto, clique em "Imprevisto / Cancelar" para notificar o cliente via WhatsApp e E-mail com opções de estorno 100% ou reagendamento.
                </p>
              </div>
              <button
                onClick={loadAppointments}
                disabled={isLoadingAppointments}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer self-start sm:self-auto touch-target"
              >
                {isLoadingAppointments ? 'Atualizando...' : 'Atualizar Agenda'}
              </button>
            </div>

            {isLoadingAppointments ? (
              <div className="py-12 flex items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary mr-2" />
                <span className="text-xs">Carregando agendamentos do profissional...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <Calendar className="w-10 h-10 mx-auto opacity-40 text-brand-primary" />
                <p className="text-xs">Nenhum agendamento pendente no momento para este profissional.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1 px-1 scrollbar-none">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-semibold">Voucher</th>
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Data e Horário</th>
                      <th className="pb-3 font-semibold">Serviço e Valor</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {appointments.map((appt) => {
                      const isConfirmed = appt.status === 'confirmed';
                      return (
                        <tr key={appt.id || appt.voucher_code} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 font-mono font-bold text-brand-primary">
                            {appt.voucher_code}
                          </td>
                          <td className="py-3.5">
                            <p className="font-semibold text-slate-900 dark:text-white">{appt.customer_name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{appt.customer_phone || appt.customer_email || 'Sem contato'}</p>
                          </td>
                          <td className="py-3.5 text-slate-700 dark:text-slate-300">
                            <span className="font-medium">{appt.appointment_date}</span> às <span className="font-bold">{appt.start_time}</span>
                          </td>
                          <td className="py-3.5">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {appt.service?.name || (appt as any).service_name || 'Procedimento'}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-semibold">
                              R$ {appt.price.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isConfirmed
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}>
                              {isConfirmed ? 'Confirmado' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {isConfirmed ? (
                              <button
                                onClick={() => {
                                  setSelectedAppointmentForCancel(appt);
                                  setIsCancelModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto cursor-pointer transition-colors touch-target"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Imprevisto / Cancelar</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Cancelado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DADOS E APRESENTAÇÃO */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-primary" />
              <span>Editar Informações do Especialista</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome Completo *
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cargo / Especialidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Telefone Direto / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    E-mail de Notificações
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="barbeiro@empresa.com"
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Foto de Perfil (Avatar URL)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Biografia / Apresentação para os Clientes
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre sua técnica, tempo de experiência e especialidades..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs resize-none"
                />
              </div>

              {/* Specialty Services Checklist */}
              {services.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Serviços que este Especialista Realiza:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map((srv) => (
                      <label
                        key={srv.id}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedServices.includes(srv.id)
                            ? 'bg-brand-primary/10 border-brand-primary/40 text-slate-900 dark:text-white font-semibold'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(srv.id)}
                          onChange={() => handleToggleService(srv.id)}
                          className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="truncate">{srv.name} (R$ {srv.price.toFixed(2)})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 shadow-md shadow-brand-primary/20 cursor-pointer touch-target"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Alterações de Perfil</span>
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-white uppercase tracking-wider">
              Visualização no Fluxo do Cliente
            </h4>
            <div className="glass-panel p-6 rounded-3xl border-2 border-brand-primary/30 text-center space-y-4 shadow-xl">
              <div className="relative w-20 h-20 mx-auto">
                <img
                  src={avatarUrl || currentStaff.avatar_url}
                  alt={name || currentStaff.name}
                  className="w-full h-full rounded-2xl object-cover border-2 border-brand-primary shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/150x150/18181b/d4af37?text=${encodeURIComponent(name.charAt(0))}`;
                  }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{name || currentStaff.name}</h4>
                <p className="text-xs text-brand-primary font-medium">{role || currentStaff.role}</p>
                <div className="flex items-center justify-center space-x-1 text-xs text-amber-500 mt-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold">{currentStaff.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500">({currentStaff.total_reviews} avaliações)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-3">
                "{bio || currentStaff.bio || 'Especialista em visagismo e atendimento de alto padrão.'}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JORNADA E BLOQUEIOS */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Daily Shift Config */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span>Horários da Jornada de Trabalho</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Defina seu horário padrão de atendimento e o intervalo de almoço/descanso.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Início do Expediente
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fim do Expediente
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Início do Intervalo
                  </label>
                  <input
                    type="time"
                    value={lunchStart}
                    onChange={(e) => setLunchStart(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fim do Intervalo
                  </label>
                  <input
                    type="time"
                    value={lunchEnd}
                    onChange={(e) => setLunchEnd(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-brand-primary text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 shadow-md shadow-brand-primary/20 cursor-pointer touch-target"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar Jornada Padrão</span>
              </button>
            </form>
          </div>

          {/* Block Specific Slot Form */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>Bloquear Horário Pontual</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Impeça agendamentos em um dia específico para consultas, treinamentos ou compromissos.
            </p>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data do Bloqueio
                </label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Horário Inicial
                  </label>
                  <input
                    type="time"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Horário Final
                  </label>
                  <input
                    type="time"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Motivo do Bloqueio
                </label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Consulta médica, treinamento..."
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-md shadow-rose-500/20 cursor-pointer touch-target"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>Adicionar Bloqueio na Agenda</span>
              </button>
            </form>

            {/* List Existing Blocks */}
            {currentStaff.blocked_slots && currentStaff.blocked_slots.length > 0 && (
              <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Bloqueios Registrados:
                </span>
                <div className="space-y-2">
                  {currentStaff.blocked_slots.map((blk) => (
                    <div
                      key={blk.id}
                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">{blk.reason}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {blk.date} • {blk.start_time} às {blk.end_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Cancellation Modal with WhatsApp and Email Templates */}
      <StaffEmergencyCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        appointment={selectedAppointmentForCancel}
        tenant={tenant}
        staffName={currentStaff?.name || 'Profissional'}
        onConfirmCancel={handleConfirmCancelAppointment}
      />
    </div>
  );
};
