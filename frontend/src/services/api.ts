import {
  Tenant,
  CatalogResponse,
  Staff,
  AvailabilityResponse,
  CreateAppointmentPayload,
  ReschedulePayload,
  Appointment,
  DashboardMetrics,
  SuperAdminOverview,
  Service,
  AuthResponse,
  PixPayment,
  PaymentStatusResponse,
  TimeSlot
} from '../types';
import { MOCK_TENANTS, MOCK_CATALOGS, MOCK_STAFF } from './mockData';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost ? 'http://localhost:8000/api/v1' : 'https://adminic-tech.onrender.com/api/v1');

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorDetail = 'Falha na comunicação com a API central.';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errData.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // ============================================================================
  // 1. Agendamento Público e Catálogo Multi-Tenant
  // ============================================================================
  async getTenants(): Promise<Tenant[]> {
    try {
      return await fetchJSON<Tenant[]>('/tenants');
    } catch (e) {
      console.warn('[API Fallback] Carregando lista de estabelecimentos offline:', e);
      return MOCK_TENANTS;
    }
  },

  async getTenant(slug: string): Promise<Tenant> {
    try {
      return await fetchJSON<Tenant>(`/tenants/${slug}`);
    } catch (e) {
      console.warn(`[API Fallback] Carregando dados do tenant ${slug} offline:`, e);
      const found = MOCK_TENANTS.find((t) => t.slug === slug);
      if (found) return found;
      return MOCK_TENANTS[0]; // Barbearia Campelo
    }
  },

  async getCatalog(slug: string): Promise<CatalogResponse> {
    try {
      return await fetchJSON<CatalogResponse>(`/tenants/${slug}/services`);
    } catch (e) {
      console.warn(`[API Fallback] Carregando catálogo de ${slug} offline:`, e);
      return MOCK_CATALOGS[slug] || MOCK_CATALOGS['barbearia-campelo'] || { tenant_slug: slug, categories: [], services: [], total_services: 0 };
    }
  },

  async getStaff(slug: string, serviceId?: string): Promise<Staff[]> {
    try {
      const query = serviceId ? `?service_id=${encodeURIComponent(serviceId)}` : '';
      return await fetchJSON<Staff[]>(`/tenants/${slug}/staff${query}`);
    } catch (e) {
      console.warn(`[API Fallback] Carregando colaboradores de ${slug} offline:`, e);
      const list = MOCK_STAFF[slug] || MOCK_STAFF['barbearia-campelo'] || [];
      if (serviceId) {
        return list.filter((s) => s.specialty_service_ids.includes(serviceId));
      }
      return list;
    }
  },

  async getAvailability(
    slug: string,
    date: string,
    staffId?: string,
    serviceId?: string
  ): Promise<AvailabilityResponse> {
    try {
      const params = new URLSearchParams({ date });
      if (staffId && staffId !== 'any') params.append('staff_id', staffId);
      if (serviceId) params.append('service_id', serviceId);

      return await fetchJSON<AvailabilityResponse>(`/tenants/${slug}/availability?${params.toString()}`);
    } catch (e) {
      console.warn(`[API Fallback] Gerando slots para ${date} offline:`, e);
      const times = [
        '10:00', '10:30', '11:00', '11:30', '12:00',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
      ];
      const slots: TimeSlot[] = times.map((t) => ({
        start_time: t,
        end_time: '14:30',
        is_available: true
      }));

      return {
        tenant_slug: slug,
        staff_id: staffId && staffId !== 'any' ? staffId : 'stf-julio-sousa',
        staff_name: 'Julio Sousa',
        service_duration_minutes: 30,
        date,
        day_name: 'Segunda-feira',
        slots,
        total_slots: slots.length,
        available_slots: slots.length
      };
    }
  },

  async createAppointment(slug: string, payload: CreateAppointmentPayload): Promise<Appointment> {
    try {
      return await fetchJSON<Appointment>(`/tenants/${slug}/appointments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      const code = `ADM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const defaultTenant = MOCK_TENANTS[0];
      const defaultService = MOCK_CATALOGS['barbearia-campelo'].services[0];
      const defaultStaff = MOCK_STAFF['barbearia-campelo'][0];

      return {
        id: `appt-${Date.now()}`,
        tenant_slug: slug || 'barbearia-campelo',
        service: defaultService,
        staff: defaultStaff,
        appointment_date: payload.appointment_date,
        start_time: payload.start_time,
        end_time: '14:30',
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email,
        price: 30.0,
        voucher_code: code,
        status: 'confirmed',
        payment_method: payload.payment_method || 'pix',
        payment_status: 'pending',
        notes: payload.notes,
        created_at: new Date().toISOString(),
        google_calendar_url: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Corte+-+Barbearia+Campelo`,
        whatsapp_direct_link: `https://wa.me/${defaultTenant.whatsapp}?text=Ola+meu+voucher+e+${code}`
      };
    }
  },

  async getAppointment(slug: string, code: string): Promise<Appointment> {
    return fetchJSON<Appointment>(`/tenants/${slug}/appointments/${code}`);
  },

  async cancelAppointment(slug: string, code: string): Promise<{ voucher_code: string; status: string; message: string }> {
    return fetchJSON<{ voucher_code: string; status: string; message: string }>(`/tenants/${slug}/appointments/${code}`, {
      method: 'DELETE',
    });
  },

  // ============================================================================
  // 2. Portal do Cliente (/meus-agendamentos)
  // ============================================================================
  async getCustomerAppointments(slug: string, email: string): Promise<Appointment[]> {
    return fetchJSON<Appointment[]>(`/tenants/${slug}/customer/appointments?email=${encodeURIComponent(email)}`);
  },

  async rescheduleAppointment(slug: string, code: string, payload: ReschedulePayload): Promise<Appointment> {
    return fetchJSON<Appointment>(`/tenants/${slug}/appointments/${code}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 3. Portal do Colaborador / Profissional (/colaborador)
  // ============================================================================
  async updateStaffProfile(slug: string, staffId: string, payload: Partial<Staff>): Promise<Staff> {
    return fetchJSON<Staff>(`/tenants/${slug}/staff/${staffId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async blockStaffSlot(
    slug: string,
    staffId: string,
    payload: { date: string; start_time: string; end_time: string; reason: string }
  ): Promise<Staff> {
    return fetchJSON<Staff>(`/tenants/${slug}/staff/${staffId}/block-slot`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 4. Painel de Gestão do Parceiro / Dono (/gestao)
  // ============================================================================
  async getTenantDashboardMetrics(slug: string): Promise<DashboardMetrics> {
    return fetchJSON<DashboardMetrics>(`/tenants/${slug}/admin/metrics`);
  },

  async createService(
    slug: string,
    payload: { category_id: string; name: string; description: string; duration_minutes: number; price: number; is_featured?: boolean }
  ): Promise<Service> {
    return fetchJSON<Service>(`/tenants/${slug}/admin/services`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateService(
    slug: string,
    serviceId: string,
    payload: Partial<Service>
  ): Promise<Service> {
    return fetchJSON<Service>(`/tenants/${slug}/admin/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteService(slug: string, serviceId: string): Promise<{ status: string }> {
    return fetchJSON<{ status: string }>(`/tenants/${slug}/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
  },

  async createCategory(
    slug: string,
    payload: { name: string; icon?: string; display_order?: number }
  ): Promise<{ id: string; name: string }> {
    return fetchJSON<{ id: string; name: string }>(`/tenants/${slug}/admin/categories`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteCategory(slug: string, categoryId: string): Promise<{ status: string }> {
    return fetchJSON<{ status: string }>(`/tenants/${slug}/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  async createStaff(
    slug: string,
    payload: { name: string; role: string; bio?: string; avatar_url?: string; specialty_service_ids: string[]; phone?: string; email?: string }
  ): Promise<Staff> {
    return fetchJSON<Staff>(`/tenants/${slug}/admin/staff`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteStaff(slug: string, staffId: string): Promise<{ status: string }> {
    return fetchJSON<{ status: string }>(`/tenants/${slug}/admin/staff/${staffId}`, {
      method: 'DELETE',
    });
  },

  async updateTenantSettings(slug: string, payload: Partial<Tenant>): Promise<Tenant> {
    return fetchJSON<Tenant>(`/tenants/${slug}/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateTenantTheme(slug: string, payload: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_mode: string;
    surface_glass_opacity: number;
    glow_color?: string;
    font_heading?: string;
    font_body?: string;
    badge_text?: string;
  }): Promise<Tenant> {
    return fetchJSON<Tenant>(`/tenants/${slug}/admin/theme`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 5. Super Admin Global (/super-admin)
  // ============================================================================
  async getSuperAdminOverview(): Promise<SuperAdminOverview> {
    return fetchJSON<SuperAdminOverview>('/super-admin/overview');
  },

  async getAuditTrail(limit: number = 100): Promise<any[]> {
    try {
      return await fetchJSON<any[]>(`/super-admin/auditoria?limit=${limit}`);
    } catch {
      return [];
    }
  },

  async createTenant(payload: {
    slug: string;
    name: string;
    slogan?: string;
    description?: string;
    category?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    instagram?: string;
    primary_color?: string;
    secondary_color?: string;
  }): Promise<Tenant> {
    return fetchJSON<Tenant>('/super-admin/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 6. Autenticação RBAC e Google One Tap (/auth)
  // ============================================================================
  async authenticateGoogle(credential: string, role: string = 'customer', tenantSlug?: string): Promise<AuthResponse> {
    return fetchJSON<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, role, tenant_slug: tenantSlug }),
    });
  },

  async loginWithGoogle(credential: string, role: string = 'customer', tenantSlug?: string): Promise<AuthResponse> {
    return this.authenticateGoogle(credential, role, tenantSlug);
  },

  async demoLogin(
    payload: { email?: string; role: string; name?: string; tenant_slug?: string; staff_id?: string } | string,
    tenantSlug?: string,
    staffId?: string
  ): Promise<AuthResponse> {
    const body = typeof payload === 'string'
      ? { role: payload, tenant_slug: tenantSlug, staff_id: staffId }
      : payload;

    return fetchJSON<AuthResponse>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async loginDemo(
    payload: { email?: string; role: string; name?: string; tenant_slug?: string; staff_id?: string } | string,
    tenantSlug?: string,
    staffId?: string
  ): Promise<AuthResponse> {
    return this.demoLogin(payload, tenantSlug, staffId);
  },

  // ============================================================================
  // 7. Pagamentos PIX Integrados (Adminic Pay)
  // ============================================================================
  async createPixPayment(slug: string, appointmentId: string): Promise<PixPayment> {
    return fetchJSON<PixPayment>(`/tenants/${slug}/payments/pix`, {
      method: 'POST',
      body: JSON.stringify({ appointment_id: appointmentId }),
    });
  },

  async getPaymentStatus(slug: string, paymentId: string): Promise<PaymentStatusResponse> {
    return fetchJSON<PaymentStatusResponse>(`/tenants/${slug}/payments/${paymentId}/status`);
  },

  async confirmPaymentManual(slug: string, paymentId: string): Promise<PaymentStatusResponse> {
    return fetchJSON<PaymentStatusResponse>(`/tenants/${slug}/payments/${paymentId}/confirm`, {
      method: 'POST',
    });
  },

  async simulateConfirmPayment(slug: string, paymentId: string): Promise<PaymentStatusResponse> {
    return this.confirmPaymentManual(slug, paymentId);
  }
};
