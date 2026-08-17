import { useEffect } from 'react';
import { Tenant } from '../types';

export function useTenantTheme(tenant: Tenant | null, themeMode: 'dark' | 'light') {
  useEffect(() => {
    const html = document.documentElement;
    if (themeMode === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    if (!tenant || !tenant.theme) return;

    const root = document.documentElement;
    const { theme, name, slogan } = tenant;

    // Apply Dynamic Brand Colors
    root.style.setProperty('--brand-primary', theme.primary_color);
    root.style.setProperty('--brand-secondary', theme.secondary_color);
    root.style.setProperty('--brand-accent', theme.accent_color);
    root.style.setProperty('--brand-glow', theme.glow_color || `${theme.primary_color}40`);
    root.style.setProperty('--surface-opacity', String(theme.surface_glass_opacity || 0.7));
    root.style.setProperty('--font-heading', `'${theme.font_heading || 'Outfit'}', sans-serif`);
    root.style.setProperty('--font-body', `'${theme.font_body || 'Inter'}', sans-serif`);

    // Update document title
    document.title = `${name} | Agendamento Inteligente Adminic`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${slogan} - Agende seu horário online em ${name}.`);
    }

    // Update dynamic favicon to match partner logo or custom favicon
    const faviconHref = tenant.favicon_url || tenant.logo_url || '/favicon.ico';
    let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(faviconLink);
    }
    faviconLink.href = faviconHref;
  }, [tenant]);
}
