import React from 'react';
import { User, Phone, Mail, MessageSquare, ShieldCheck, CheckSquare, Square, QrCode, Store, Sparkles } from 'lucide-react';

interface Step4CustomerFormProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  paymentMethod: 'pix' | 'venue';
  setPaymentMethod: (method: 'pix' | 'venue') => void;
  agreeTerms: boolean;
  setAgreeTerms: (agree: boolean) => void;
  error?: string | null;
}

export const Step4CustomerForm: React.FC<Step4CustomerFormProps> = ({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  notes,
  setNotes,
  paymentMethod,
  setPaymentMethod,
  agreeTerms,
  setAgreeTerms,
  error,
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }
    setCustomerPhone(formatted);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-black/10 dark:border-white/10">
        <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
          Identificação do Cliente e Pagamento
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Informe seus dados de contato para emissão oficial do voucher e envio das confirmações.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-brand-primary" />
            <span>Nome Completo *</span>
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full glass-input px-4 py-3 rounded-2xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* WhatsApp Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WhatsApp e Telefone de Contato *</span>
          </label>
          <input
            type="tel"
            required
            value={customerPhone}
            onChange={handlePhoneChange}
            placeholder="(11) 98765-4321"
            className="w-full glass-input px-4 py-3 rounded-2xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Utilizado para envio do lembrete de atendimento e voucher via WhatsApp.
          </span>
        </div>

        {/* Email Field (Strictly Required) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-primary" />
            <span>E-mail Corporativo ou Pessoal *</span>
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="seuemail@empresa.com.br"
            className="w-full glass-input px-4 py-3 rounded-2xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Obrigatório para emissão do voucher digital e inclusão automática no Google Agenda.
          </span>
        </div>

        {/* Payment Method Selector */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
            <QrCode className="w-3.5 h-3.5 text-brand-primary" />
            <span>Forma de Pagamento *</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PIX Instantâneo Online */}
            <div
              onClick={() => setPaymentMethod('pix')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'pix'
                  ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xs">
                    PIX
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    PIX Instantâneo
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Aprovação Automática
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gera QR Code e chave Copia e Cola para pagamento imediato com confirmação automática.
              </p>
            </div>

            {/* Pagar no Estabelecimento */}
            <div
              onClick={() => setPaymentMethod('venue')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'venue'
                  ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Pagar no Local
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Efetue o pagamento na recepção com dinheiro, cartão de débito/crédito ou PIX da loja.
              </p>
            </div>
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
            <span>Observações e Preferências (opcional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Exemplo: preferência por atendimento pontual, restrições específicas..."
            className="w-full glass-input px-4 py-3 rounded-2xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none"
          />
        </div>

        {/* Terms Consent */}
        <div
          onClick={() => setAgreeTerms(!agreeTerms)}
          className="flex items-start space-x-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all select-none"
        >
          <div className="pt-0.5 text-brand-primary">
            {agreeTerms ? (
              <CheckSquare className="w-5 h-5 fill-brand-primary/20 text-brand-primary" />
            ) : (
              <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Concordo com os termos de agendamento e autorizo o envio do voucher e comunicações de confirmação por e-mail e WhatsApp em conformidade com a LGPD.
          </p>
        </div>
      </div>

      {/* Security Footer */}
      <div className="pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Seus dados cadastrais estão protegidos em conformidade com a LGPD.</span>
        </div>
        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Disparo Instantâneo</span>
        </div>
      </div>
    </div>
  );
};

