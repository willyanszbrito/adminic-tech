import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tenant, Staff, Service, Appointment } from '../../types';
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
  Phone,
  Mail,
  Clock,
  Scissors,
  AlertTriangle
} from 'lucide-react';

export interface StaffPortalProps {
  tenant: Tenant;
  staffList: Staff[];
  services?: Service[];
  onRefreshStaff?: () => void;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  tenant,
  staffList,
  services = [],
  onRefreshStaff,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const currentStaff = staffList.find((s: Staff) => s.id === selectedStaffId) || staffList[0];

  const [activeTab, setActiveTab] = useState<'appointments' | 'profile' | 'schedule'>('appointments');

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  // Profile Edit State
  const [name, setName] = useState(currentStaff?.name || '');
  const [role, setRole] = useState(currentStaff?.role || '');
  const [phone, setPhone] = useState(currentStaff?.phone || '');
  const [email, setEmail] = useState(currentStaff?.email || '');
  const [bio, setBio] = useState(currentStaff?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentStaff?.avatar_url || '');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    currentStaff?.specialty_service_ids || []
  );

  // Shift Edit State
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
        // Filter appointments for the active staff (or show all for the tenant)
        const staffAppts = data.recent_appointments.filter(
          (a: Appointment) => !a.staff_id || a.staff_id === currentStaff?.id
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
      setSuccessMessage(`Perfil de ${name} salvo e sincronizado com sucesso!`);
      if (onRefreshStaff) onRefreshStaff();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar alterações no perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockSlot = async (e: React.FormEvent) => {
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
      setSuccessMessage(`Horário bloqueado com sucesso em ${blockDate} (${blockStart} às ${blockEnd}).`);
      if (onRefreshStaff) onRefreshStaff();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar bloqueio de agenda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCancelEmergency = (appt: Appointment) => {
    setSelectedAppointmentForCancel(appt);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelAppointment = async (voucherCode: string) => {
    try {
      await api.cancelAppointment(tenant.slug, voucherCode);
      setSuccessMessage(`Atendimento (${voucherCode}) cancelado com sucesso. O cliente pode ser estornado em 100% ou reagendado.`);
      loadAppointments();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Collaborator Switcher */}
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
              Painel do Profissional & Atendimentos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Gerencie seus agendamentos, notifique imprevistos com modelos WhatsApp/E-mail e configure sua jornada.
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
            <span>Agenda & Atendimentos ({appointments.length})</span>
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
            <span>Dados & Apresentação</span>
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
            <span>Jornada & Bloqueios</span>
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

      {/* TAB 1: AGENDA & ATENDIMENTOS (Com cancelamento de imprevisto) */}
      {activeTab === 'appointments' && (
        <div className="glass-panel rounded-3xl p-4 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                <span>Atendimentos Agendados para {currentStaff.name}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Caso ocorra qualquer imprevisto, clique em "Imprevisto / Cancelar" para notificar o cliente via WhatsApp/E-mail com opções de estorno 100% ou reagendamento.
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
                    <th className="pb-3 font-semibold">Serviço / Valor</th>
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
                        <td className="py-3.5">
                          <p className="font-medium text-slate-900 dark:text-white">{appt.appointment_date}</p>
                          <p className="text-[11px] text-slate-500">{appt.start_time} às {appt.end_time || '---'}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="text-slate-900 dark:text-white font-medium">R$ {appt.price ? appt.price.toFixed(2) : '30.00'}</p>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isConfirmed
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isConfirmed ? 'Confirmado' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {isConfirmed ? (
                            <button
                              onClick={() => handleOpenCancelEmergency(appt)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold text-[11px] flex items-center gap-1 ml-auto cursor-pointer transition-colors touch-target"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Imprevisto / Cancelar</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Cancelado</span>
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
      )}

      {/* TAB 2: DADOS & APRESENTAÇÃO */}
      {activeTab === 'profile' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-brand-primary" />
              <span>Dados Cadastrais e Apresentação</span>
            </h3>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{currentStaff.rating.toFixed(1)} ({currentStaff.total_reviews} avaliações)</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Foto e URL */}
            <div className="flex items-center space-x-4 pb-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-black/10 dark:border-white/15 bg-zinc-200 dark:bg-zinc-900 shrink-0 shadow-inner">
                <img
                  src={avatarUrl || currentStaff.avatar_url}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/200x200/18181b/f59e0b?text=${encodeURIComponent(name.charAt(0))}`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  URL da Foto de Perfil ou Logo
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs placeholder:text-slate-400"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">Cargo / Especialidade *</label>
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
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-brand-primary" />
                  <span>WhatsApp Profissional</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-brand-primary" />
                  <span>E-mail Corporativo</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Biografia / Apresentação Profissional
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full glass-input p-3 rounded-xl text-xs leading-relaxed"
                placeholder="Breve resumo da sua experiência e estilo de atendimento..."
              />
            </div>

            {/* Especialidades */}
            {services.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center space-x-1.5">
                  <Scissors className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Serviços que este Profissional Realiza:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {services.map(srv => {
                    const isChecked = selectedServices.includes(srv.id);
                    return (
                      <label
                        key={srv.id}
                        className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-brand-primary/10 border-brand-primary/40 text-slate-900 dark:text-white'
                            : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 hover:border-black/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleService(srv.id)}
                          className="rounded border-slate-400 text-brand-primary focus:ring-brand-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{srv.name}</p>
                          <p className="text-[10px] text-slate-500">R$ {srv.price.toFixed(2)} • {srv.duration_minutes} min</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer touch-target"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar e Atualizar Perfil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: JORNADA & BLOQUEIOS */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Working Shifts Summary */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 pb-2 border-b border-black/10 dark:border-white/10">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              <span>Jornada de Atendimento</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="font-semibold text-slate-900 dark:text-white">Segunda a Sábado</span>
                <span className="font-mono text-brand-primary font-bold">{startTime} às {endTime}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="font-semibold text-slate-900 dark:text-white">Intervalo de Almoço</span>
                <span className="font-mono text-slate-500">{lunchStart} às {lunchEnd}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="font-semibold text-slate-900 dark:text-white">Domingo</span>
                <span className="text-rose-500 font-semibold">Folga Semanal</span>
              </div>
            </div>
          </div>

          {/* Block Slot Card */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-7 space-y-4 border border-brand-primary/20">
            <div className="pb-3 border-b border-black/10 dark:border-white/10">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                <Ban className="w-4 h-4 text-rose-500" />
                <span>Bloquear Horário na Agenda</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Impeça novos agendamentos para compromissos internos ou intervalos pessoais.
              </p>
            </div>

            <form onSubmit={handleBlockSlot} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">Data</label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">De</label>
                  <input
                    type="time"
                    required
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">Até</label>
                  <input
                    type="time"
                    required
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1 font-medium">Motivo</label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Treinamento ou Consulta Médica"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md touch-target"
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Registrar Bloqueio</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Cancellation Modal with WhatsApp and Email Templates */}
      <StaffEmergencyCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        appointment={selectedAppointmentForCancel}
        tenant={tenant}
        staffName={currentStaff.name}
        onConfirmCancel={handleConfirmCancelAppointment}
      />
    </div>
  );
};
