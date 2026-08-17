import * as React from 'react';
import { useState } from 'react';
import { Tenant, Appointment } from '../../types';
import { api } from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle2,
  RotateCcw,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Loader2,
  XCircle
} from 'lucide-react';

export interface CustomerPortalProps {
  tenant: Tenant;
  onNavigateToBooking: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  tenant,
  onNavigateToBooking,
}) => {
  const [emailInput, setEmailInput] = useState('valerius.maximus@empresa.com.br');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reschedule state
  const [reschedulingCode, setReschedulingCode] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('15:00');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const results = await api.getCustomerAppointments(tenant.slug, emailInput.trim());
      setAppointments(results);
      setHasSearched(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao consultar agendamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (code: string) => {
    if (!window.confirm(`Deseja realmente cancelar o agendamento ${code}?`)) return;

    try {
      await api.cancelAppointment(tenant.slug, code);
      setMessage(`Agendamento ${code} cancelado com sucesso.`);
      handleSearch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao cancelar agendamento.');
    }
  };

  const handleRescheduleSubmit = async (code: string) => {
    if (!newDate || !newTime) {
      setErrorMessage('Selecione uma nova data e horário para reagendar.');
      return;
    }

    setIsSubmittingReschedule(true);
    setErrorMessage(null);

    try {
      await api.rescheduleAppointment(tenant.slug, code, {
        appointment_date: newDate,
        start_time: newTime,
        reason: 'Solicitado pelo cliente via portal',
      });
      setMessage(`Agendamento ${code} reagendado com sucesso para ${newDate} às ${newTime}!`);
      setReschedulingCode(null);
      handleSearch();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao reagendar. O horário pode estar indisponível.');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                Portal de Autoatendimento
              </span>
              <span className="text-xs text-slate-500">• {tenant.name}</span>
            </div>
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mt-1">
              Meus Agendamentos e Reservas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Consulte seu histórico, acompanhe confirmações, altere horários ou cancele reservas com total autonomia.
            </p>
          </div>

          <button
            onClick={onNavigateToBooking}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 shadow-md shadow-brand-primary/20 transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            + Agendar Novo Horário
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Informe seu e-mail corporativo cadastrado (ex: seuemail@empresa.com.br)"
                className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Consultar Reservas</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results List */}
      {isLoading ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
          <p className="text-xs font-medium">Buscando seus agendamentos no sistema...</p>
        </div>
      ) : hasSearched && appointments.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500/80 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum agendamento encontrado</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Não localizamos reservas ativas com o e-mail <span className="font-mono text-brand-primary">{emailInput}</span> no {tenant.name}.
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateToBooking}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90 transition-opacity"
            >
              Fazer uma Reserva Agora
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const isConfirmed = appt.status === 'confirmed';
            const isRescheduling = reschedulingCode === appt.voucher_code;

            return (
              <div
                key={appt.id}
                className={`glass-panel rounded-3xl p-6 sm:p-7 border transition-all ${
                  isConfirmed
                    ? 'border-black/10 dark:border-white/10'
                    : 'border-rose-500/20 bg-rose-500/[0.02]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}>
                        {isConfirmed ? 'Confirmado' : 'Cancelado'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        Voucher: <span className="text-brand-primary">{appt.voucher_code}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                      {appt.service.name}
                    </h3>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-medium">Valor Total</span>
                    <span className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                      R$ {appt.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px] flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Data Agendada</span>
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{appt.appointment_date}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px] flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Horário</span>
                    </span>
                    <p className="font-bold text-brand-primary text-sm mt-0.5">
                      {appt.start_time} às {appt.end_time}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px] flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Especialista</span>
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 truncate">{appt.staff.name}</p>
                    <span className="text-[11px] text-slate-500">{appt.staff.role}</span>
                  </div>
                </div>

                {/* Reschedule inline drawer */}
                {isRescheduling && (
                  <div className="my-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-brand-primary/30 space-y-4">
                    <h4 className="text-xs font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-brand-primary" />
                      <span>Escolha a Nova Data e Horário</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Nova Data</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Novo Horário</label>
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setReschedulingCode(null)}
                        className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingReschedule}
                        onClick={() => handleRescheduleSubmit(appt.voucher_code)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-black hover:opacity-90"
                      >
                        {isSubmittingReschedule ? 'Salvando...' : 'Confirmar Reagendamento'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <a
                      href={appt.whatsapp_direct_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/25 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={appt.google_calendar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/15"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Google Agenda</span>
                    </a>
                  </div>

                  {isConfirmed && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReschedulingCode(appt.voucher_code);
                          setNewDate(appt.appointment_date);
                          setNewTime(appt.start_time);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/15 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Reagendar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancel(appt.voucher_code)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security footer */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacidade assegurada. Seus dados cadastrais estão protegidos em conformidade com a LGPD.</span>
        </div>
      </div>
    </div>
  );
};
