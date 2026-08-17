import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tenant, Staff, Service } from '../../types';
import { api } from '../../services/api';
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
  Scissors
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Collaborator Switcher */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                Área do Colaborador
              </span>
              <span className="text-xs text-slate-500">• {tenant.name}</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
              Painel do Profissional e Gestão de Perfil
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Configure todos os seus dados cadastrais, horários de atendimento, especialidades e bloqueios de agenda.
            </p>
          </div>

          {/* Switch Collaborator Selector */}
          <div className="flex items-center space-x-2 bg-black/5 dark:bg-white/5 p-2 rounded-2xl border border-black/10 dark:border-white/10">
            <User className="w-4 h-4 text-brand-primary" />
            <select
              value={selectedStaffId}
              onChange={(e) => handleStaffChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {staffList.map((s: Staff) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {s.name} ({s.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
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

      {/* Main Grid: Profile Form & Block Slot Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Edit Profile */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
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
                  placeholder="/logos/logo_campelo.jpg ou link https://..."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Nome e Cargo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nome Profissional Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Cargo / Especialidade Principal *
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

            {/* Contato (WhatsApp & Email) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span>WhatsApp / Telefone</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(92) 99104-4930"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-sky-500" />
                  <span>E-mail Profissional</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="profissional@barbearia.com"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Biografia */}
            <div>
              <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Biografia e Apresentação
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte sobre sua experiência, técnicas preferidas e atendimento..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs resize-none"
              />
            </div>

            {/* Escala e Horários de Trabalho */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                <span>Horário de Atendimento e Intervalo de Almoço</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Entrada</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Saída</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Início Almoço</label>
                  <input
                    type="time"
                    value={lunchStart}
                    onChange={(e) => setLunchStart(e.target.value)}
                    className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Fim Almoço</label>
                  <input
                    type="time"
                    value={lunchEnd}
                    onChange={(e) => setLunchEnd(e.target.value)}
                    className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Especialidades / Serviços Habilitados */}
            {services.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center space-x-1">
                  <Scissors className="w-3 h-3 text-brand-primary" />
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
                className="w-full py-3 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Salvar e Atualizar Perfil</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Block Slot & Schedule Overview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Block Slot Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4 border border-brand-primary/20">
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
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Registrar Bloqueio</span>
              </button>
            </form>
          </div>

          {/* Working Shifts Summary */}
          <div className="glass-panel rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              <span>Jornada de Atendimento</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                <span className="font-semibold text-slate-900 dark:text-white">Segunda a Sábado</span>
                <span className="font-mono text-brand-primary font-bold">{startTime} às {endTime}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                <span className="font-semibold text-slate-900 dark:text-white">Intervalo de Almoço</span>
                <span className="font-mono text-slate-500">{lunchStart} às {lunchEnd}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                <span className="font-semibold text-slate-900 dark:text-white">Domingo</span>
                <span className="text-rose-500 font-semibold">Folga Semanal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
