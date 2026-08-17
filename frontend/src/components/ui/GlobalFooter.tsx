import React, { useState } from 'react';
import { ShieldCheck, FileText, Lock } from 'lucide-react';
import { TermsOfServiceModal } from '../legal/TermsOfServiceModal';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';

export const GlobalFooter: React.FC = () => {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="mt-16 py-8 border-t border-black/10 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">© 2026 Adminic Tecnologia • Plataforma de Agendamento Inteligente</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer underline-offset-4 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Termos de Uso</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer underline-offset-4 hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Política de Privacidade (LGPD)</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Criptografia Ponta a Ponta</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modais Legais */}
      <TermsOfServiceModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
};
