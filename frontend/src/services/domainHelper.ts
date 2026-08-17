/**
 * Helper utilities for White-Label Multi-Tenant Subdomain resolution
 */

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
    const systemSubdomains = ['ia', 'api', 'app', 'admin', 'www', 'mail', 'webmail'];
    if (!systemSubdomains.includes(subdomain)) {
      if (subdomain === 'campelo' || subdomain === 'barbearia-campelo') return 'barbearia-campelo';
      if (subdomain === 'segredos' || subdomain === 'segredosdocorte' || subdomain === 'segredos-do-corte') return 'segredos-do-corte';
      return subdomain;
    }
  }
  
  return null;
}

export function getPartnerSubdomainUrl(slug: string): string {
  if (slug === 'barbearia-campelo' || slug === 'campelo') {
    return 'https://campelo.adminic.com.br';
  }
  if (slug === 'segredos-do-corte' || slug === 'segredosdocorte' || slug === 'segredos') {
    return 'https://segredosdocorte.adminic.com.br';
  }
  return `https://${slug}.adminic.com.br`;
}
