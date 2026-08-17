import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold font-heading text-white truncate">Política de Privacidade (LGPD)</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Conforme Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
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
              <span className="text-emerald-400 font-mono">1.</span> Coleta e Tratamento de Dados Pessoais
            </h3>
            <p>
              Coletamos estritamente os dados essenciais para a realização e confirmação do seu atendimento: <strong>Nome completo, Telefone (WhatsApp) e E-mail</strong>.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">2.</span> Finalidade Específica do Uso dos Dados
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Envio de comprovante de agendamento e voucher digital via WhatsApp e E-mail.</li>
              <li>Alertas de lembrete e pontualidade antes do atendimento.</li>
              <li>Localização do seu histórico de reservas no portal de autoatendimento.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">3.</span> Confidencialidade e Não Compartilhamento
            </h3>
            <p>
              Os seus dados pessoais <strong>jamais são comercializados ou compartilhados com terceiros</strong> para fins de marketing ou publicidade não autorizada. O acesso é restrito ao estabelecimento onde o serviço foi reservado.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">4.</span> Direitos do Titular dos Dados (LGPD)
            </h3>
            <p>
              Você possui total direito de solicitar a consulta, correção, anonimização ou exclusão definitiva dos seus dados de cadastro a qualquer momento, conforme o artigo 18 da Lei Geral de Proteção de Dados.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">5.</span> Segurança e Criptografia
            </h3>
            <p>
              Todas as comunicações são trafegadas sob protocolo seguro HTTPS com criptografia TLS 1.3 e integridade validada por trilha de auditoria digital.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
