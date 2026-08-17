import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold font-heading text-white truncate">Termos de Uso do Serviço</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Adminic Smart Booking • Atualizado em 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors touch-target flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400 font-mono">1.</span> Objeto e Finalidade da Plataforma
            </h3>
            <p>
              A plataforma <strong>Adminic Smart Booking</strong> é um ecossistema tecnológico desenvolvido para intermediação e gestão de agendamentos, emissão de comprovantes digitais (vouchers) e confirmação de horários entre clientes e estabelecimentos parceiros credenciados.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400 font-mono">2.</span> Regras de Agendamento e Pontualidade
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>O agendamento é pessoal, intransferível e vinculado ao código exclusivo do voucher.</li>
              <li>Recomenda-se a chegada com <strong>10 minutos de antecedência</strong> ao horário agendado.</li>
              <li>Tolerância máxima de atraso de 15 minutos, sujeita à disponibilidade da agenda do profissional.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400 font-mono">3.</span> Política de Cancelamento e Reagendamento
            </h3>
            <p>
              Cancelamentos ou reagendamentos podem ser solicitados gratuitamente através do portal <em>Meus Agendamentos</em> com no mínimo <strong>2 horas de antecedência</strong> do horário agendado.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400 font-mono">4.</span> Pagamentos Instantâneos (PIX Seguro)
            </h3>
            <p>
              Transações efetuadas via PIX utilizam processamento criptografado de ponta a ponta com confirmação instantânea e emissão automática de comprovante digital via WhatsApp e E-mail.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-amber-400 font-mono">5.</span> Segurança e Auditoria
            </h3>
            <p>
              Todas as transações, agendamentos e alterações operacionais possuem trilha de auditoria digital com validação criptográfica (SHA-256) para garantia de autenticidade e segurança jurídica.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  );
};
