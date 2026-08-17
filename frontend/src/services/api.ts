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
  PaymentStatusResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
    return fetchJSON<Tenant[]>('/tenants');
  },

  async getTenant(slug: string): Promise<Tenant> {
    return fetchJSON<Tenant>(`/tenants/${slug}`);
  },

  async getCatalog(slug: string): Promise<CatalogResponse> {
    return fetchJSON<CatalogResponse>(`/tenants/${slug}/services`);
  },

  async getStaff(slug: string, serviceId?: string): Promise<Staff[]> {
    const query = serviceId ? `?service_id=${encodeURIComponent(serviceId)}` : '';
    return fetchJSON<Staff[]>(`/tenants/${slug}/staff${query}`);
  },

  async getAvailability(
    slug: string,
    date: string,
    staffId?: string,
    serviceId?: string
  ): Promise<AvailabilityResponse> {
    const params = new URLSearchParams({ date });
    if (staffId && staffId !== 'any') params.append('staff_id', staffId);
    if (serviceId) params.append('service_id', serviceId);

    return fetchJSON<AvailabilityResponse>(`/tenants/${slug}/availability?${params.toString()}`);
  },

  async createAppointment(slug: string, payload: CreateAppointmentPayload): Promise<Appointment> {
    return fetchJSON<Appointment>(`/tenants/${slug}/appointments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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

  async deleteService(slug: string, serviceId: string): Promise<{ success: boolean; message: string }> {
    return fetchJSON<{ success: boolean; message: string }>(`/tenants/${slug}/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
  },

  async createStaff(
    slug: string,
    payload: {
      name: string;
      role: string;
      bio?: string;
      avatar_url?: string;
      phone?: string;
      email?: string;
      specialty_service_ids?: string[];
      shifts?: any[];
    }
  ): Promise<Staff> {
    return fetchJSON<Staff>(`/tenants/${slug}/admin/staff`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteStaff(slug: string, staffId: string): Promise<{ success: boolean; message: string }> {
    return fetchJSON<{ success: boolean; message: string }>(`/tenants/${slug}/admin/staff/${staffId}`, {
      method: 'DELETE',
    });
  },

  async createCategory(
    slug: string,
    payload: { name: string; description?: string; icon?: string; display_order?: number }
  ): Promise<any> {
    return fetchJSON<any>(`/tenants/${slug}/admin/categories`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteCategory(slug: string, categoryId: string): Promise<{ success: boolean; message: string }> {
    return fetchJSON<{ success: boolean; message: string }>(`/tenants/${slug}/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  async updateTenantSettings(slug: string, payload: Partial<Tenant>): Promise<Tenant> {
    return fetchJSON<Tenant>(`/tenants/${slug}/admin/settings`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async updateTenantTheme(slug: string, payload: Partial<Tenant['theme']>): Promise<Tenant> {
    return fetchJSON<Tenant>(`/tenants/${slug}/admin/theme`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 5. Painel do Super Administrador (/super-admin)
  // ============================================================================
  async getSuperAdminOverview(): Promise<SuperAdminOverview> {
    return fetchJSON<SuperAdminOverview>('/super-admin/overview');
  },

  async createTenant(payload: {
    slug: string;
    name: string;
    slogan: string;
    category: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    primary_color: string;
    secondary_color: string;
  }): Promise<Tenant> {
    return fetchJSON<Tenant>('/super-admin/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 6. Autenticação: Google One Tap e Demonstração
  // ============================================================================
  async loginWithGoogle(
    credential: string,
    target_role?: string,
    target_tenant_slug?: string
  ): Promise<AuthResponse> {
    return fetchJSON<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        credential,
        target_role,
        target_tenant_slug,
      }),
    });
  },

  async loginDemo(payload: {
    email: string;
    role: string;
    name?: string;
    tenant_slug?: string;
    staff_id?: string;
  }): Promise<AuthResponse> {
    return fetchJSON<AuthResponse>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ============================================================================
  // 7. Pagamentos Instantâneos PIX e Mercado Pago
  // ============================================================================
  async createPixPayment(
    slug: string,
    voucherCode: string,
    payerEmail?: string,
    payerName?: string
  ): Promise<PixPayment> {
    return fetchJSON<PixPayment>(`/tenants/${slug}/payments/pix`, {
      method: 'POST',
      body: JSON.stringify({
        voucher_code: voucherCode,
        payer_email: payerEmail,
        payer_name: payerName,
      }),
    });
  },

  async getPaymentStatus(slug: string, paymentId: string): Promise<PaymentStatusResponse> {
    return fetchJSON<PaymentStatusResponse>(`/tenants/${slug}/payments/${paymentId}/status`);
  },

  async simulateConfirmPayment(slug: string, paymentId: string): Promise<PaymentStatusResponse> {
    return fetchJSON<PaymentStatusResponse>(`/tenants/${slug}/payments/${paymentId}/simulate-confirm`, {
      method: 'POST',
    });
  },
};
