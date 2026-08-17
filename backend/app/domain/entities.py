from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    PARTNER_ADMIN = "partner_admin"
    STAFF = "staff"
    CUSTOMER = "customer"

@dataclass
class TenantTheme:
    primary_color: str
    secondary_color: str
    accent_color: str
    background_mode: str = "dark" # "dark" | "light"
    surface_glass_opacity: float = 0.65
    glow_color: str = "rgba(217, 119, 6, 0.25)"
    font_heading: str = "Outfit"
    font_body: str = "Inter"
    badge_text: str = "Parceiro Oficial Adminic"

@dataclass
class BusinessHours:
    days_open: List[int] # 0 = Segunda-feira, 6 = Domingo
    open_time: str # "09:00"
    close_time: str # "20:00"
    slot_interval_minutes: int = 30
    lunch_break_start: Optional[str] = "12:00"
    lunch_break_end: Optional[str] = "13:00"

@dataclass
class Tenant:
    id: str
    slug: str
    name: str
    slogan: str
    description: str
    category: str # "barbearia", "estetica", "clinica", "automotivo", etc.
    logo_url: str
    banner_url: str
    phone: str
    whatsapp: str
    email: str
    address: str
    instagram: Optional[str]
    theme: TenantTheme
    business_hours: BusinessHours
    is_active: bool = True
    features: List[str] = field(default_factory=lambda: ["Wi-Fi Corporativo", "Ar-Condicionado", "Café Cortesia", "Estacionamento Privativo"])
    # Configurações de Pagamento e PIX
    pix_enabled: bool = True
    pix_mode: str = "production" # "production" | "test_penny"
    pix_penny_price: float = 0.01
    mercadopago_public_key: Optional[str] = None
    mercadopago_access_token: Optional[str] = None
    mercadopago_pix_key: Optional[str] = None
    whatsapp_custom_message: Optional[str] = None
    # Gestão de Licenciamento e Assinatura
    plan_name: str = "Plano Enterprise Pro"
    trial_days_total: int = 30
    trial_days_remaining: int = 24
    trial_status: str = "active" # "active" | "expiring_soon" | "expired" | "subscribed"
    trial_ends_at: str = "2026-09-15"
    monthly_revenue: float = 14850.00
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

@dataclass
class ServiceCategory:
    id: str
    tenant_id: str
    name: str
    description: Optional[str] = None
    icon: str = "sparkles"
    display_order: int = 0

@dataclass
class Service:
    id: str
    tenant_id: str
    category_id: str
    name: str
    description: str
    duration_minutes: int
    price: float
    image_url: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True

@dataclass
class StaffShift:
    day_of_week: int # 0-6
    start_time: str # "09:00"
    end_time: str # "19:00"
    lunch_start: Optional[str] = "12:00"
    lunch_end: Optional[str] = "13:00"

@dataclass
class BlockedSlot:
    id: str
    date: str # "YYYY-MM-DD"
    start_time: str # "14:00"
    end_time: str # "16:00"
    reason: str # "Reunião de Alinhamento", "Consulta Médica", etc.

@dataclass
class Staff:
    id: str
    tenant_id: str
    name: str
    role: str
    bio: str
    avatar_url: str
    rating: float
    total_reviews: int
    specialty_service_ids: List[str]
    shifts: List[StaffShift]
    blocked_slots: List[BlockedSlot] = field(default_factory=list)
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True

@dataclass
class TimeSlot:
    start_time: str # "09:00"
    end_time: str # "09:45"
    is_available: bool
    reason: Optional[str] = None

@dataclass
class Appointment:
    id: str
    tenant_id: str
    voucher_code: str
    service_id: str
    staff_id: str
    appointment_date: str # "YYYY-MM-DD"
    start_time: str # "14:30"
    end_time: str # "15:15"
    customer_name: str
    customer_phone: str
    customer_email: str # E-mail corporativo obrigatório
    notes: Optional[str]
    status: str # "confirmed", "cancelled", "completed", "rescheduled"
    price: float
    payment_method: str = "venue" # "pix" | "venue"
    payment_status: str = "pending" # "pending" | "paid" | "venue"
    payment_id: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    cancelled_at: Optional[datetime] = None
    rescheduled_at: Optional[datetime] = None

@dataclass
class Payment:
    id: str
    tenant_id: str
    appointment_id: str
    voucher_code: str
    amount: float
    payment_method: str = "pix" # "pix" | "venue"
    status: str = "pending" # "pending", "approved", "cancelled", "expired"
    mp_payment_id: Optional[str] = None
    qr_code: Optional[str] = None
    qr_code_base64: Optional[str] = None
    ticket_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    paid_at: Optional[datetime] = None

@dataclass
class User:
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str = "customer" # "super_admin" | "partner_admin" | "staff" | "customer"
    tenant_slug: Optional[str] = None # When role is partner_admin or staff
    staff_id: Optional[str] = None # When role is staff
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

