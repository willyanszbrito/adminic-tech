/**
 * Helper utilities for White-Label Multi-Tenant Subdomain resolution
 */

export function normalizeTenantSlug(slug: string | null | undefined): string {
  if (!slug) return 'barbearia-campelo';
  const clean = slug.trim().toLowerCase();
  if (clean === 'campelo' || clean === 'barbearia-campelo' || clean === 'barbeariacampelo') {
    return 'barbearia-campelo';
  }
  if (
    clean === 'segredos' ||
    clean === 'segredosdocorte' ||
    clean === 'segredos-do-corte' ||
    clean === 'segredos_do_corte'
  ) {
    return 'segredos-do-corte';
  }
  return clean;
}

export function isDedicatedSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  
  // If accessing via partner subdomain (e.g. campelo.adminic.com.br or segredosdocorte.adminic.com.br)
  if (hostname.endsWith('.adminic.com.br') || hostname.endsWith('.adminic.tech')) {
    const subdomain = hostname.split('.')[0];
    const systemSubdomains = ['ia', 'api', 'app', 'admin', 'www', 'mail', 'webmail', 'staging', 'dev'];
    return !systemSubdomains.includes(subdomain);
  }
  
  return false;
}

export function getDedicatedSubdomainSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();
  
  if (hostname.endsWith('.adminic.com.br') || hostname.endsWith('.adminic.tech')) {
    const subdomain = hostname.split('.')[0];
    const systemSubdomains = ['ia', 'api', 'app', 'admin', 'www', 'mail', 'webmail', 'staging', 'dev'];
    if (!systemSubdomains.includes(subdomain)) {
      return normalizeTenantSlug(subdomain);
    }
  }
  
  return null;
}

export function getPartnerSubdomainUrl(slug: string): string {
  const norm = normalizeTenantSlug(slug);
  if (norm === 'barbearia-campelo') {
    return 'https://campelo.adminic.com.br';
  }
  if (norm === 'segredos-do-corte') {
    return 'https://segredosdocorte.adminic.com.br';
  }
  return `https://${norm}.adminic.com.br`;
}

