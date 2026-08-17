import React from 'react';
import { Tenant } from '../../types';
import { ShieldCheck, MapPin, MessageCircle, Instagram, Phone, Layers } from 'lucide-react';
import { isDedicatedSubdomain } from '../../services/domainHelper';

interface TenantHeaderProps {
  tenant: Tenant;
  onOpenSwitcher?: () => void;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ tenant, onOpenSwitcher }) => {
  const isDedicated = isDedicatedSubdomain();
  const isOpenToday = () => {
    const today = new Date().getDay();
    const weekday = today === 0 ? 6 : today - 1;
    return tenant.business_hours.days_open.includes(weekday);
  };

  return (
    <header className="relative w-full rounded-3xl overflow-hidden glass-panel mb-8 border border-black/10 dark:border-white/10">
      {/* Dynamic Cover Banner with Gradient Overlay */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-zinc-900">
        <img
          src={tenant.banner_url || `https://placehold.co/1200x400/18181b/${tenant.theme.primary_color.replace('#', '')}?text=${encodeURIComponent(tenant.name)}`}
          alt={tenant.name}
          className="w-full h-full object-cover object-center opacity-60 filter brightness-90 transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/1200x400/18181b/${tenant.theme.primary_color.replace('#', '')}?text=${encodeURIComponent(tenant.name)}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
        
        {/* Floating Top Bar: Only on central portal */}
        {!isDedicated && onOpenSwitcher && (
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={onOpenSwitcher}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold glass-pill text-white hover:bg-white/20 border border-white/20 shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Alternar entre parceiros (Disponível apenas no Portal Central)"
            >
              <Layers className="w-3.5 h-3.5 text-brand-primary" />
              <span>Ver Outros Parceiros</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Details Container */}
      <div className="relative px-6 sm:px-8 pb-7 -mt-16 sm:-mt-20 z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5">
          {/* Logo and Business Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-950 p-1 ring-4 ring-brand-glow">
                <img
                  src={tenant.logo_url || `https://placehold.co/200x200/18181b/${tenant.theme.primary_color.replace('#', '')}?text=${encodeURIComponent(tenant.name)}`}
                  alt={tenant.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/200x200/18181b/${tenant.theme.primary_color.replace('#', '')}?text=${encodeURIComponent(tenant.name)}`;
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{tenant.theme.badge_text || 'Parceiro Oficial Adminic'}</span>
                </span>
                {isOpenToday() ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Aberto Hoje ({tenant.business_hours.open_time} as {tenant.business_hours.close_time})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    <span>Fechado Hoje</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-white">
                {tenant.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl">
                {tenant.slogan}
              </p>
            </div>
          </div>

          {/* Quick Contact Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-black/10 dark:border-white/10">
            <a
              href={`https://wa.me/${tenant.whatsapp}?text=Ola%2C%20gostaria%20de%20informacoes%20sobre%20o%20${encodeURIComponent(tenant.name)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {tenant.instagram && (
              <a
                href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-semibold glass-pill text-pink-600 dark:text-pink-300 hover:bg-pink-600/20 border border-pink-500/30 transition-all"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            <a
              href={`tel:${tenant.phone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center justify-center p-2 rounded-xl text-xs font-semibold glass-pill text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all"
              title="Ligar"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Address and Amenity Badges */}
        <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(tenant.name + ' ' + tenant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-brand-primary transition-colors line-clamp-1"
            >
              {tenant.address}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tenant.features.map((feature, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] text-slate-700 dark:text-slate-300">
                • {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
