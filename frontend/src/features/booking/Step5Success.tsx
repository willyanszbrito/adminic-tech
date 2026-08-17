import React, { useState, useEffect } from 'react';
import { Appointment, Tenant } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../services/api';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MapPin,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
  Printer,
  Mail,
  Zap,
  Loader2
} from 'lucide-react';

interface Step5SuccessProps {
  appointment: Appointment;
  tenant: Tenant;
  onNewBooking: () => void;
  onAppointmentUpdated?: (updated: Appointment) => void;
}

export const Step5Success: React.FC<Step5SuccessProps> = ({
  appointment: initialAppointment,
  tenant,
  onNewBooking,
  onAppointmentUpdated,
}) => {
  const [appointment, setAppointment] = useState<Appointment>(initialAppointment);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pixStatus, setPixStatus] = useState<string>(
    initialAppointment.payment_status || (initialAppointment.payment_method === 'pix' ? 'pending' : 'venue')
  );

  const pixData = appointment.pix;
  const isPix = appointment.payment_method === 'pix';
  const isPaid = pixStatus === 'paid' || appointment.payment_status === 'paid';

  // Live polling for PIX payment status if pending
  useEffect(() => {
    if (!isPix || isPaid || !pixData?.payment_id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getPaymentStatus(tenant.slug, pixData.payment_id);
        if (res.is_paid || res.status === 'approved') {
          setPixStatus('paid');
          const updatedAppt: Appointment = {
            ...appointment,
            payment_status: 'paid',
            status: 'confirmed',
          };
          setAppointment(updatedAppt);
          if (onAppointmentUpdated) onAppointmentUpdated(updatedAppt);
          clearInterval(interval);
        }
      } catch (err) {
        // Polling silent fallback
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPix, isPaid, pixData, tenant.slug, appointment, onAppointmentUpdated]);

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText(appointment.voucher_code);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  const handleCopyPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    }
  };

  const handleSimulatePayment = async () => {
    if (!pixData?.payment_id) return;
    setIsSimulating(true);
    try {
      const res = await api.simulateConfirmPayment(tenant.slug, pixData.payment_id);
      if (res.is_paid || res.status === 'approved') {
        setPixStatus('paid');
        const updatedAppt: Appointment = {
          ...appointment,
          payment_status: 'paid',
          status: 'confirmed',
        };
        setAppointment(updatedAppt);
        if (onAppointmentUpdated) onAppointmentUpdated(updatedAppt);
      }
    } catch (err) {
      console.error('Erro ao simular aprovação do PIX:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-400">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden border border-emerald-500/30">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">
          Agendamento Confirmado com Sucesso
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
          Agendamento registrado para {appointment.customer_name}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          O comprovante e voucher digital foram gerados. Enviamos as confirmações completas para o e-mail <strong>{appointment.customer_email}</strong> e via WhatsApp.
        </p>
      </div>

      {/* PIX Payment Section (If PIX method chosen) */}
      {isPix && (
        <div className="max-w-2xl mx-auto rounded-3xl glass-panel p-6 sm:p-8 border border-amber-500/30 bg-amber-500/[0.03] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                PIX
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Pagamento Instantâneo via PIX
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Processado com segurança via Mercado Pago
                </span>
              </div>
            </div>

            {isPaid ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
                <span>Pagamento Aprovado</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold animate-pulse border border-amber-500/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Aguardando Pagamento</span>
              </span>
            )}
          </div>

          {!isPaid && pixData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-center shadow-lg">
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  <QRCodeSVG value={pixData.qr_code} size={150} level="M" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-3">
                  Abra o app do seu banco e escaneie o QR Code
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                  Expira em 15 minutos
                </span>
              </div>

              {/* Copia e Cola and Actions */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Chave PIX Copia e Cola
                  </span>
                  <div className="p-3 rounded-xl bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all max-h-20 overflow-y-auto">
                    {pixData.qr_code}
                  </div>
                </div>

                <button
                  onClick={handleCopyPix}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Chave PIX Copiada com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Chave PIX Copia e Cola</span>
                    </>
                  )}
                </button>

                {/* Developer / Test Simulation Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
                >
                  {isSimulating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span>Simular Pagamento Aprovado (Ambiente de Teste)</span>
                </button>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>
                Pagamento confirmado instantaneamente. Seu comprovante oficial com código do voucher já foi emitido e homologado.
              </span>
            </div>
          )}
        </div>
      )}

      {/* High-End Digital Voucher Ticket */}
      <div className="relative max-w-2xl mx-auto rounded-3xl overflow-hidden glass-panel border border-black/10 dark:border-white/15 shadow-2xl bg-white dark:bg-zinc-950/90">
        {/* Top Ticket Header */}
        <div
          className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden border-b border-black/10 dark:border-white/10"
          style={{
            background: `linear-gradient(135deg, ${tenant.theme.primary_color}25 0%, rgba(24, 24, 28, 0.1) 100%)`,
          }}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-black/10 dark:border-white/20 bg-zinc-100 dark:bg-zinc-900 p-1">
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-primary block">
                Comprovante Oficial • {tenant.name}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{appointment.service.name}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-black/5 dark:bg-black/40 px-3.5 py-2 rounded-2xl border border-black/10 dark:border-white/10">
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">Voucher</span>
              <span className="text-sm font-mono font-bold text-brand-primary">{appointment.voucher_code}</span>
            </div>
            <button
              onClick={handleCopyVoucher}
              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copiar Código"
            >
              {copiedVoucher ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Middle Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Details Column */}
          <div className="md:col-span-2 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Data</span>
                </span>
                <p className="font-bold text-slate-900 dark:text-white capitalize text-sm mt-0.5">
                  {formatDateDisplay(appointment.appointment_date)}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Horário</span>
                </span>
                <p className="font-bold text-brand-primary text-sm mt-0.5">
                  {appointment.start_time} às {appointment.end_time}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-black/10 dark:border-white/10">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Profissional</span>
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 truncate">{appointment.staff.name}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{appointment.staff.role}</span>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                  Valor Total
                </span>
                <p className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5 font-heading">
                  R$ {appointment.price.toFixed(2)}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                  {isPaid ? 'Pago via PIX' : isPix ? 'PIX Pendente' : 'Pagamento no local'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-brand-primary" />
                  <span>E-mail do Titular</span>
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-0.5">{appointment.customer_email}</p>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Endereço do Estabelecimento</span>
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{tenant.address}</p>
              </div>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center space-y-2">
            <div className="p-2.5 rounded-xl bg-white shadow-lg">
              <QRCodeSVG
                value={appointment.qr_code_payload || appointment.qr_payload || appointment.voucher_code}
                size={110}
                level="M"
              />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Apresente na Recepção
            </span>
          </div>
        </div>

        {/* Ticket Bottom Divider */}
        <div className="relative h-4 bg-zinc-100 dark:bg-zinc-950 border-t border-dashed border-black/15 dark:border-white/20 flex items-center justify-between px-6">
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#08080a] -ml-9 border-r border-black/10 dark:border-white/15" />
          <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#08080a] -mr-9 border-l border-black/10 dark:border-white/15" />
        </div>

        {/* Action Shortcuts */}
        <div className="p-6 bg-black/[0.01] dark:bg-white/[0.02] flex flex-wrap items-center justify-center gap-3">
          <a
            href={appointment.whatsapp_direct_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/20 dark:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notificar no WhatsApp</span>
          </a>

          <a
            href={appointment.google_calendar_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 transition-all"
          >
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span>Google Agenda</span>
          </a>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comprovante</span>
          </button>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onNewBooking}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-black/10 dark:border-white/15 transition-all hover:scale-105"
        >
          <RotateCcw className="w-4 h-4 text-brand-primary" />
          <span>Realizar Novo Agendamento</span>
        </button>
      </div>
    </div>
  );
};

