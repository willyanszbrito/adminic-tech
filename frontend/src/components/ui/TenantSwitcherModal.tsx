import React, { useState } from 'react';
import { Tenant } from '../../types';
import { X, Layers, Check, ArrowRight } from 'lucide-react';

interface TenantSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  currentSlug: string;
  onSelectTenant: (slug: string) => void;
}

export const TenantSwitcherModal: React.FC<TenantSwitcherModalProps> = ({
  isOpen,
  onClose,
  tenants,
  currentSlug,
  onSelectTenant,
}) => {
  const [customSlug, setCustomSlug] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSlug.trim()) {
      onSelectTenant(customSlug.trim().toLowerCase());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15 shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-glow rounded-full blur-3xl pointer-events-none opacity-30" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-black/10 dark:border-white/10 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center border border-brand-primary/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Simulador Multi-Tenant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Alterne entre empresas parceiras cadastradas no ecossistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Partners Grid */}
        <div className="py-5 space-y-3 relative z-10 max-h-[60vh] overflow-y-auto pr-1">
          {tenants.map((t) => {
            const isSelected = t.slug === currentSlug;
            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTenant(t.slug);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary shadow-md ring-1 ring-brand-primary/40'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 p-0.5"
                    style={{ backgroundColor: t.theme.secondary_color }}
                  >
                    <img
                      src={t.logo_url}
                      alt={t.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/100x100/${t.theme.secondary_color.replace('#', '')}/${t.theme.primary_color.replace('#', '')}?text=${t.name.charAt(0)}`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: t.theme.primary_color }}
                        title={`Cor Primaria: ${t.theme.primary_color}`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{t.slogan}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ia.adminic.com.br/{t.slug}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-primary text-black flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Ativo</span>
                    </span>
                  ) : (
                    <span className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Slug Input */}
        <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-black/10 dark:border-white/10 relative z-10">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Ou acesse qualquer slug personalizado:
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-mono">
                /
              </span>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="exemplo: novo-parceiro"
                className="w-full glass-input pl-7 pr-3 py-2 text-xs rounded-xl focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-black hover:opacity-90 transition-opacity cursor-pointer"
            >
              Abrir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
