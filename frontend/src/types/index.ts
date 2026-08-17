export interface TenantTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_mode: 'dark' | 'light';
  surface_glass_opacity: number;
  glow_color: string;
  font_heading: string;
  font_body: string;
  badge_text: string;
}

export interface BusinessHours {
  days_open: number[]; // 0=Segunda, 6=Domingo
  open_time: string;
  close_time: string;
  slot_interval_minutes: number;
  lunch_break_start?: string;
  lunch_break_end?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  description: string;
  category: string;
  logo_url: string;
  favicon_url?: string;
  banner_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram?: string;
  theme: TenantTheme;
  business_hours: BusinessHours;
  is_active: boolean;
  features: string[];
  pix_enabled?: boolean;
  pix_mode?: 'production' | 'test_penny';
  pix_penny_price?: number;
  mercadopago_public_key?: string;
  mercadopago_access_token?: string;
  mercadopago_pix_key?: string;
  whatsapp_custom_message?: string;
  plan_name: string;
  trial_days_remaining: number;
  trial_status: 'active' | 'expiring_soon' | 'expired' | 'subscribed';
  trial_ends_at: string;
  monthly_revenue: number;
}

export interface ServiceCategory {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  icon: string;
  display_order: number;
}

export interface Service {
  id: string;
  tenant_id: string;
  category_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface CatalogResponse {
  tenant_slug: string;
  categories: ServiceCategory[];
  services: Service[];
  total_services: number;
}

export interface BlockedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface StaffShift {
  day_of_week: number;
  start_time: string;
  end_time: string;
  lunch_start?: string;
  lunch_end?: string;
}

export interface Staff {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string;
  phone?: string;
  email?: string;
  rating: number;
  total_reviews: number;
  specialty_service_ids: string[];
  shifts?: StaffShift[];
  is_active: boolean;
  blocked_slots: BlockedSlot[];
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  reason?: string;
}

export interface AvailabilityResponse {
  tenant_slug: string;
  staff_id: string;
  staff_name: string;
  service_id?: string;
  service_name?: string;
  service_duration_minutes: number;
  date: string;
  day_name: string;
  slots: TimeSlot[];
  total_slots: number;
  available_slots: number;
}

export interface PixPayment {
  payment_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'cancelled' | 'expired';
  qr_code: string;
  qr_code_base64: string;
  ticket_url?: string;
  expires_at?: string;
  paid_at?: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  appointment_id: string;
  voucher_code: string;
  status: string;
  amount: number;
  is_paid: boolean;
  paid_at?: string;
}

export interface CreateAppointmentPayload {
  service_id: string;
  staff_id?: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  customer_name: string;
  customer_phone: string;
  customer_email: string; // Obrigatório
  notes?: string;
  payment_method?: 'pix' | 'venue';
}

export interface ReschedulePayload {
  appointment_date: string;
  start_time: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  tenant_slug: string;
  voucher_code: string;
  service_id?: string;
  service: Service;
  staff_id?: string;
  staff: Staff;
  appointment_date: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  price: number;
  payment_method?: 'pix' | 'venue';
  payment_status?: 'pending' | 'paid' | 'venue';
  payment_id?: string;
  pix?: PixPayment;
  created_at: string;
  google_calendar_url: string;
  whatsapp_direct_link: string;
  whatsapp_notification_message?: string;
  cancellation_policy?: string;
  qr_payload?: string;
  qr_code_payload?: string;
}

export interface DashboardMetrics {
  tenant_slug: string;
  tenant_name: string;
  total_appointments: number;
  confirmed_appointments: number;
  cancelled_appointments: number;
  monthly_revenue: number;
  average_ticket: number;
  occupancy_rate_percent: number;
  trial_days_remaining: number;
  trial_status: string;
  recent_appointments: Appointment[];
}

export interface TenantOverviewItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  plan_name: string;
  trial_status: string;
  trial_days_remaining: number;
  trial_ends_at: string;
  monthly_revenue: number;
  total_appointments: number;
  is_active: boolean;
  owner_email: string;
  phone: string;
}

export interface SuperAdminOverview {
  total_tenants: number;
  active_trials: number;
  expiring_soon_trials: number;
  total_ecosystem_appointments: number;
  total_monthly_volume: number;
  tenants: TenantOverviewItem[];
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;
export type PortalView = 'booking' | 'customer' | 'staff' | 'admin' | 'super-admin';
export type UserRole = 'customer' | 'staff' | 'partner_admin' | 'super_admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  tenant_slug?: string;
  staff_id?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  message: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  targetRoleForLogin: UserRole | null;
  openLoginModal: (targetRole?: UserRole) => void;
  closeLoginModal: () => void;
  loginWithGoogle: (credential: string, targetRole?: string, targetTenantSlug?: string) => Promise<boolean>;
  loginDemo: (email: string, role: string, name?: string, tenantSlug?: string, staffId?: string) => Promise<boolean>;
  logout: () => void;
  triggerGoogleOneTap: () => void;
}

