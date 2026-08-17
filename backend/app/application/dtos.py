from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

# ==============================================================================
# Modelos Compartilhados e Temas
# ==============================================================================

class TenantThemeDTO(BaseModel):
    primary_color: str = Field(..., description="Cor primária da marca no formato HEX", examples=["#f59e0b"])
    secondary_color: str = Field(..., description="Cor secundária da marca no formato HEX", examples=["#18181b"])
    accent_color: str = Field(..., description="Cor de destaque da marca no formato HEX", examples=["#d97706"])
    background_mode: str = Field("dark", description="Modo de fundo padrão: dark ou light", examples=["dark"])
    surface_glass_opacity: float = Field(0.65, description="Opacidade da superfície em glassmorphism (0.0 a 1.0)", examples=[0.70])
    glow_color: str = Field("rgba(245, 158, 11, 0.25)", description="Cor do brilho ambiente", examples=["rgba(245, 158, 11, 0.25)"])
    font_heading: str = Field("Outfit", description="Tipografia para títulos e destaques", examples=["Outfit"])
    font_body: str = Field("Inter", description="Tipografia para corpo do texto", examples=["Inter"])
    badge_text: str = Field("Parceiro Oficial Adminic", description="Selo de certificação oficial", examples=["Parceiro Oficial Adminic"])

    model_config = ConfigDict(from_attributes=True)


class BusinessHoursDTO(BaseModel):
    days_open: List[int] = Field(..., description="Dias da semana abertos (0=Segunda, 6=Domingo)", examples=[[0, 1, 2, 3, 4, 5]])
    open_time: str = Field(..., description="Horário de abertura no formato HH:MM", examples=["09:00"])
    close_time: str = Field(..., description="Horário de fechamento no formato HH:MM", examples=["20:00"])
    slot_interval_minutes: int = Field(30, description="Intervalo padrão entre slots em minutos", examples=[30])
    lunch_break_start: Optional[str] = Field(None, description="Início do intervalo de almoço", examples=["12:00"])
    lunch_break_end: Optional[str] = Field(None, description="Término do intervalo de almoço", examples=["13:00"])

    model_config = ConfigDict(from_attributes=True)


class TenantResponseDTO(BaseModel):
    id: str = Field(..., description="Identificador único do parceiro", examples=["tnt-aura-barber"])
    slug: str = Field(..., description="Slug identificador de URL do parceiro", examples=["barbearia-vintage"])
    name: str = Field(..., description="Nome comercial da empresa", examples=["Aura Barber Club"])
    slogan: str = Field(..., description="Slogan ou frase de impacto", examples=["Excelência em Visagismo, Barbearia Clássica e Estilo Masculino"])
    description: str = Field(..., description="Descrição detalhada do estabelecimento")
    category: str = Field(..., description="Segmento de atuação", examples=["barbearia"])
    logo_url: str = Field(..., description="URL do logotipo oficial")
    favicon_url: Optional[str] = Field(None, description="URL do favicon oficial do estabelecimento")
    banner_url: str = Field(..., description="URL do banner ou imagem de capa")
    phone: str = Field(..., description="Telefone fixo para contato", examples=["(11) 3456-7890"])
    whatsapp: str = Field(..., description="Número de WhatsApp com código do país", examples=["5511999998888"])
    email: str = Field(..., description="E-mail de atendimento da empresa", examples=["contato@aurabarber.com.br"])
    address: str = Field(..., description="Endereço físico completo com cidade e estado")
    instagram: Optional[str] = Field(None, description="Perfil no Instagram", examples=["@aurabarberclub"])
    theme: TenantThemeDTO
    business_hours: BusinessHoursDTO
    is_active: bool = Field(True, description="Indica se o estabelecimento está ativo no ecossistema")
    features: List[str] = Field(default_factory=list, description="Lista de diferenciais e comodidades")
    # Configurações de Pagamento e PIX
    pix_enabled: bool = Field(True, description="Habilita cobrança via PIX instantâneo")
    pix_mode: str = Field("production", description="Modo PIX: production (valor integral) ou test_penny (R$ 0,01 para testes reais em produção)")
    pix_penny_price: float = Field(0.01, description="Valor simbólico para testes reais de PIX")
    mercadopago_public_key: Optional[str] = Field(None, description="Chave pública do Mercado Pago")
    mercadopago_access_token: Optional[str] = Field(None, description="Token de acesso privado do Mercado Pago")
    mercadopago_pix_key: Optional[str] = Field(None, description="Chave PIX customizada")
    whatsapp_custom_message: Optional[str] = Field(None, description="Mensagem personalizada para notificações via WhatsApp")
    plan_name: str = Field("Plano Enterprise Pro", description="Plano de licenciamento contratado")
    trial_days_remaining: int = Field(26, description="Dias restantes de período de teste gratuito")
    trial_status: str = Field("active", description="Status do trial: active, expiring_soon, expired, subscribed")
    trial_ends_at: str = Field("2026-09-11", description="Data de término do período de teste")
    monthly_revenue: float = Field(18450.00, description="Faturamento mensal consolidado")

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# Catálogo de Serviços
# ==============================================================================

class ServiceCategoryDTO(BaseModel):
    id: str
    tenant_id: str
    name: str = Field(..., examples=["Cabelo e Visagismo"])
    description: Optional[str] = None
    icon: str = "sparkles"
    display_order: int = 0

    model_config = ConfigDict(from_attributes=True)


class ServiceDTO(BaseModel):
    id: str
    tenant_id: str
    category_id: str
    name: str = Field(..., examples=["Corte Executivo e Consultoria de Visagismo"])
    description: str = Field(..., examples=["Alinhamento geométrico conforme formato do rosto e finalização com balm premium"])
    duration_minutes: int = Field(..., examples=[45])
    price: float = Field(..., examples=[85.00])
    image_url: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class CatalogResponseDTO(BaseModel):
    tenant_id: Optional[str] = None
    tenant_slug: str
    tenant_name: str
    tenant_slogan: Optional[str] = None
    categories: List[ServiceCategoryDTO]
    services: List[ServiceDTO]


# ==============================================================================
# Equipe e Disponibilidade
# ==============================================================================

class StaffShiftDTO(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    lunch_start: Optional[str] = None
    lunch_end: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BlockedSlotDTO(BaseModel):
    id: str
    date: str
    start_time: str
    end_time: str
    reason: str

    model_config = ConfigDict(from_attributes=True)


class StaffDTO(BaseModel):
    id: str
    tenant_id: str
    name: str = Field(..., examples=["Marcus Aurelius Silva Jr"])
    role: str = Field(..., examples=["Master Barber e Consultor de Visagismo"])
    bio: str
    avatar_url: str
    rating: float = Field(..., examples=[4.9])
    total_reviews: int = Field(..., examples=[218])
    specialty_service_ids: List[str] = Field(default_factory=list)
    shifts: List[StaffShiftDTO] = Field(default_factory=list)
    blocked_slots: List[BlockedSlotDTO] = Field(default_factory=list)
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


class TimeSlotDTO(BaseModel):
    start_time: str = Field(..., description="Horário de início (HH:MM)", examples=["14:00"])
    end_time: str = Field(..., description="Horário previsto de término (HH:MM)", examples=["14:45"])
    is_available: bool = True
    reason: Optional[str] = None


class AvailabilityResponseDTO(BaseModel):
    tenant_slug: str
    date: str
    day_name: Optional[str] = None
    staff_id: Optional[str] = None
    staff_name: Optional[str] = None
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    service_duration_minutes: int = 30
    duration_minutes: int = 30
    slots: List[TimeSlotDTO]
    total_slots: int = 0
    available_slots: int = 0
    total_available_slots: int = 0


# ==============================================================================
# Agendamentos e Vouchers
# ==============================================================================

class CreateAppointmentRequestDTO(BaseModel):
    service_id: str = Field(..., description="ID do serviço selecionado")
    staff_id: Optional[str] = Field(None, description="ID do colaborador ou nulo para Qualquer Especialista")
    appointment_date: str = Field(..., description="Data do agendamento (YYYY-MM-DD)", examples=["2026-08-17"])
    start_time: str = Field(..., description="Horário de início (HH:MM)", examples=["14:30"])
    customer_name: str = Field(..., min_length=3, description="Nome completo do cliente", examples=["Carlos Eduardo Mendes"])
    customer_phone: str = Field(..., min_length=8, description="Telefone de contato", examples=["(92) 98489-9955"])
    customer_email: EmailStr = Field(..., description="E-mail obrigatório", examples=["cliente@exemplo.com"])
    notes: Optional[str] = Field(None, description="Observações especiais")
    payment_method: Optional[str] = Field("venue", description="Forma de pagamento: 'pix' para pagamento online instantâneo ou 'venue' para pagar no local")


class PixPaymentResponseDTO(BaseModel):
    payment_id: str
    amount: float
    status: str = Field(..., description="Status do pagamento: pending | approved | cancelled | expired")
    qr_code: str = Field(..., description="Payload EMV / Linha digitável Copia e Cola do PIX")
    qr_code_base64: str = Field(..., description="Imagem do QR Code em Base64 para renderização direta")
    ticket_url: Optional[str] = None
    expires_at: Optional[str] = None
    paid_at: Optional[str] = None


class AppointmentResponseDTO(BaseModel):
    id: str
    voucher_code: str = Field(..., examples=["AURA-774921"])
    tenant_id: Optional[str] = None
    tenant_slug: str
    tenant_name: Optional[str] = None
    service: Optional[ServiceDTO] = None
    staff: Optional[StaffDTO] = None
    appointment_date: str
    start_time: str
    end_time: str
    customer_name: str
    customer_phone: str
    customer_email: str
    notes: Optional[str] = None
    status: str = Field(..., examples=["confirmed"])
    price: float
    payment_method: str = "venue"
    payment_status: str = "pending"
    payment_id: Optional[str] = None
    pix: Optional[PixPaymentResponseDTO] = None
    created_at: datetime
    google_calendar_url: str
    whatsapp_direct_link: str
    whatsapp_notification_message: Optional[str] = None
    cancellation_policy: Optional[str] = "Cancelamento gratuito com antecedência mínima de 2 horas."
    qr_payload: Optional[str] = None
    qr_code_payload: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CreatePixPaymentRequestDTO(BaseModel):
    voucher_code: str = Field(..., description="Código do voucher do agendamento")
    payer_email: Optional[str] = None
    payer_name: Optional[str] = None


class PaymentStatusResponseDTO(BaseModel):
    payment_id: str
    appointment_id: str
    voucher_code: str
    status: str
    amount: float
    is_paid: bool
    paid_at: Optional[str] = None


class SimulatePaymentConfirmationRequestDTO(BaseModel):
    payment_id: str


class CancelAppointmentResponseDTO(BaseModel):
    voucher_code: str
    status: str = "cancelled"
    message: str = "Agendamento cancelado com sucesso."


class RescheduleAppointmentRequestDTO(BaseModel):
    appointment_date: str = Field(..., description="Nova data desejada (YYYY-MM-DD)")
    start_time: str = Field(..., description="Novo horário desejado (HH:MM)")
    reason: Optional[str] = Field("Reagendamento solicitado pelo cliente", description="Motivo")


class UpdateServiceRequestDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

# ==============================================================================
# Portais RBAC: Colaborador, Gestor e Super Admin
# ==============================================================================

class UpdateStaffProfileDTO(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    specialty_service_ids: Optional[List[str]] = None
    shifts: Optional[List[StaffShiftDTO]] = None
    is_active: Optional[bool] = None


class CreateStaffRequestDTO(BaseModel):
    name: str = Field(..., min_length=2, description="Nome completo do colaborador")
    role: str = Field(..., min_length=2, description="Cargo ou função")
    bio: Optional[str] = "Especialista qualificado e certificado."
    avatar_url: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    phone: Optional[str] = None
    email: Optional[str] = None
    specialty_service_ids: List[str] = Field(default_factory=list)
    shifts: Optional[List[StaffShiftDTO]] = None


class BlockSlotRequestDTO(BaseModel):
    date: str = Field(..., description="Data do bloqueio (YYYY-MM-DD)")
    start_time: str = Field(..., description="Horário de início (HH:MM)")
    end_time: str = Field(..., description="Horário de término (HH:MM)")
    reason: str = Field("Compromisso Interno", description="Motivo do bloqueio")


class CreateServiceRequestDTO(BaseModel):
    category_id: str = Field(..., description="ID da categoria")
    name: str = Field(..., min_length=2, description="Nome do procedimento")
    description: str = Field(..., description="Descrição detalhada")
    duration_minutes: int = Field(..., ge=15, description="Duração em minutos")
    price: float = Field(..., ge=0.01, description="Valor cobrado em Reais (BRL)")
    image_url: Optional[str] = None
    is_featured: bool = False


class UpdateServiceRequestDTO(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class CreateCategoryRequestDTO(BaseModel):
    name: str = Field(..., min_length=2, description="Nome da categoria")
    description: Optional[str] = None
    icon: str = "sparkles"
    display_order: int = 0


class UpdateCategoryRequestDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None


class UpdateTenantSettingsDTO(BaseModel):
    name: Optional[str] = None
    slogan: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    instagram: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    banner_url: Optional[str] = None
    pix_enabled: Optional[bool] = None
    pix_mode: Optional[str] = None # "production" | "test_penny"
    pix_penny_price: Optional[float] = None
    mercadopago_public_key: Optional[str] = None
    mercadopago_access_token: Optional[str] = None
    mercadopago_pix_key: Optional[str] = None
    whatsapp_custom_message: Optional[str] = None
    features: Optional[List[str]] = None
    business_hours: Optional[BusinessHoursDTO] = None
    theme: Optional[TenantThemeDTO] = None


class DashboardMetricsDTO(BaseModel):
    tenant_slug: str
    tenant_name: str
    total_appointments: int
    confirmed_appointments: int
    cancelled_appointments: int
    monthly_revenue: float
    average_ticket: float
    occupancy_rate_percent: float
    trial_days_remaining: int
    trial_status: str
    recent_appointments: List[AppointmentResponseDTO]


class UpdateThemeRequestDTO(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_mode: Optional[str] = None
    font_heading: Optional[str] = None
    font_body: Optional[str] = None
    badge_text: Optional[str] = None


class TenantOverviewItemDTO(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    plan_name: str
    trial_status: str
    trial_days_remaining: int
    trial_ends_at: str
    monthly_revenue: float
    total_appointments: int
    is_active: bool
    owner_email: str
    phone: str


class SuperAdminOverviewDTO(BaseModel):
    total_tenants: int
    active_trials: int
    expiring_soon_trials: int
    total_ecosystem_appointments: int
    total_monthly_volume: float
    tenants: List[TenantOverviewItemDTO]


class CreateTenantRequestDTO(BaseModel):
    slug: str = Field(..., min_length=3, description="Identificador de URL único (ex: nova-clinica)")
    name: str = Field(..., min_length=2, description="Nome da empresa parceira")
    slogan: str = Field(..., description="Slogan ou subtítulo")
    category: str = Field("barbearia", description="Segmento de atuação")
    email: EmailStr = Field(..., description="E-mail oficial do responsável")
    phone: str = Field(..., description="Telefone de contato")
    whatsapp: str = Field(..., description="WhatsApp com DDD")
    address: str = Field(..., description="Endereço da sede física")
    primary_color: str = Field("#f59e0b", description="Cor primária da marca em HEX")
    secondary_color: str = Field("#18181b", description="Cor secundária da marca em HEX")


# ==============================================================================
# Autenticação e Google One Tap / OAuth
# ==============================================================================

class GoogleAuthRequestDTO(BaseModel):
    credential: str = Field(..., description="JWT ID Token emitido pelo Google Identity Services")
    target_role: Optional[str] = Field("customer", description="Papel desejado: customer, staff, partner_admin, super_admin")
    target_tenant_slug: Optional[str] = Field(None, description="Slug do parceiro quando aplicável")


class DemoLoginRequestDTO(BaseModel):
    email: EmailStr = Field(..., description="E-mail do usuário")
    role: str = Field("customer", description="Papel: super_admin, partner_admin, staff, customer")
    tenant_slug: Optional[str] = Field(None, description="Slug do parceiro")
    staff_id: Optional[str] = Field(None, description="ID do colaborador se aplicável")
    name: Optional[str] = Field(None, description="Nome do usuário")
    access_key: Optional[str] = Field(None, description="Chave de acesso corporativa / PIN")


class UserDTO(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str = Field("customer", description="super_admin, partner_admin, staff, customer")
    tenant_slug: Optional[str] = None
    staff_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AuthResponseDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserDTO
    message: str = "Autenticação realizada com sucesso."
