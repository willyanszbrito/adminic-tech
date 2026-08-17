import React, { useState } from 'react';
import { Appointment, Tenant } from '../../types';
import {
  X,
  AlertTriangle,
  MessageSquare,
  Mail,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Loader2
} from 'lucide-react';

export interface StaffEmergencyCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  tenant: Tenant;
  staffName: string;
  onConfirmCancel: (voucherCode: string) => Promise<void>;
}

export const StaffEmergencyCancelModal: React.FC<StaffEmergencyCancelModalProps> = ({
  isOpen,
  onClose,
  appointment,
  tenant,
  staffName,
  onConfirmCancel,
}) => {
  const [copiedType, setCopiedType] = useState<'whatsapp' | 'email' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelReason, setCancelReason] = useState('Imprevisto pessoal/saúde inadiável do profissional');

  if (!isOpen || !appointment) return null;

  const clientName = appointment.customer_name || 'Cliente';
  const clientPhone = appointment.customer_phone || '';
  const cleanPhone = clientPhone.replace(/\D/g, '');
  const dateFormatted = appointment.appointment_date;
  const timeFormatted = appointment.start_time;
  const voucherCode = appointment.voucher_code;
  const barberShopPhone = tenant.phone || tenant.whatsapp || '(92) 98489-9955';

  // Template WhatsApp Oficial
  const whatsappTemplate = `Olá, ${clientName}! Aqui é o ${staffName} da ${tenant.name}. 💈

Escrevo para lhe pedir sinceras desculpas, pois infelizmente tive um imprevisto de força maior (${cancelReason}) e não conseguirei realizar seu atendimento agendado para *${dateFormatted} às ${timeFormatted}* (Voucher: *${voucherCode}*).

Para garantir que você não seja prejudicado, você tem duas opções imediatas:

1️⃣ *Devolução Integral (100% do Valor):* Realizamos o estorno imediato via PIX na sua chave informada.
2️⃣ *Reagendamento Prioritário:* Podemos remarcar para o próximo melhor horário da sua preferência ou transferir seu atendimento para outro barbeiro de confiança da nossa equipe hoje mesmo.

Como você prefere prosseguir? Me responda por aqui para resolvermos agora! Obrigado pela compreensão e desculpe o transtorno. 🙏`;

  // Template E-mail Oficial
  const emailSubject = `Comunicado Importante: Seu agendamento na ${tenant.name} (Voucher ${voucherCode})`;
  const emailBody = `Olá, ${clientName},

Espero que este e-mail o encontre bem.

Entramos em contato para informar que, por motivo de um imprevisto inadiável com o profissional ${staffName} (${cancelReason}), seu atendimento agendado para o dia ${dateFormatted} às ${timeFormatted} na ${tenant.name} precisou ser cancelado.

Pedimos sinceras desculpas pelo inconveniente. Para sua comodidade e segurança, disponibilizamos duas alternativas imediatas:

1. Devolução Total (100% do Valor): Caso tenha realizado o pagamento antecipado, realizaremos a devolução integral via PIX em até poucos minutos.
2. Reagendamento com Prioridade: Você pode reagendar para uma nova data/horário de sua conveniência ou ser atendido por outro especialista da nossa equipe.

Por favor, responda a este e-mail ou entre em contato pelo nosso WhatsApp no número ${barberShopPhone} informando sua preferência e, se aplicável, sua chave PIX para estorno imediato.

Agradecemos imensamente pela compreensão e estamos à disposição para qualquer dúvida.

Atenciosamente,
${staffName} e Equipe ${tenant.name}
Telefone / WhatsApp: ${barberShopPhone}`;

  const handleCopy = (text: string, type: 'whatsapp' | 'email') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappTemplate);
    const targetPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://wa.me/${targetPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleFinalizeCancel = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmCancel(voucherCode);
      onClose();
    } catch (e) {
      // handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-8 text-slate-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold font-heading text-white truncate">
                Gerenciar Cancelamento por Imprevisto
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Notifique o cliente com template cordial (100% estorno ou reagendamento)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors touch-target flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appointment Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
            <span className="font-semibold text-slate-300">Cliente: <strong className="text-white">{clientName}</strong></span>
            <span className="font-mono text-amber-400 font-bold">Voucher: {voucherCode}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-400">
            <div>
              <span>Data/Hora:</span>
              <p className="font-semibold text-white">{dateFormatted} às {timeFormatted}</p>
            </div>
            <div>
              <span>Telefone / Whats:</span>
              <p className="font-semibold text-white">{clientPhone || 'Não informado'}</p>
            </div>
            <div>
              <span>Profissional:</span>
              <p className="font-semibold text-white">{staffName}</p>
            </div>
          </div>
        </div>

        {/* Motivo do Imprevisto */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Motivo do Imprevisto (incluído na mensagem):
          </label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            placeholder="Ex: Imprevisto de saúde / Emergência pessoal / Falha técnica"
          />
        </div>

        {/* Template 1: WhatsApp */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Modelo de Mensagem para WhatsApp</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(whatsappTemplate, 'whatsapp')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedType === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'whatsapp' ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
              {clientPhone && (
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir WhatsApp</span>
                </button>
              )}
            </div>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-36 overflow-y-auto">
            {whatsappTemplate}
          </pre>
        </div>

        {/* Template 2: E-mail */}
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>Modelo de Comunicado por E-mail</span>
            </h4>
            <button
              type="button"
              onClick={() => handleCopy(`Assunto: ${emailSubject}\n\n${emailBody}`, 'email')}
              className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'email' ? 'Copiado!' : 'Copiar E-mail'}</span>
            </button>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-2 max-h-36 overflow-y-auto font-sans leading-relaxed">
            <p><strong className="text-sky-300">Assunto:</strong> {emailSubject}</p>
            <pre className="whitespace-pre-wrap font-sans text-slate-400">{emailBody}</pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Fechar sem Cancelar
          </button>
          <button
            type="button"
            onClick={handleFinalizeCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cancelando...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Confirmar Cancelamento no Sistema</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
