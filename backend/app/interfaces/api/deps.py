from fastapi import Depends
from app.domain.interfaces import (
    ITenantRepository, ICatalogRepository, IStaffRepository, IAppointmentRepository,
    IPaymentRepository, IPaymentGateway, IWhatsAppService, IEmailService
)
from app.infrastructure.repositories import (
    get_tenant_repo, get_catalog_repo, get_staff_repo, get_appointment_repo, get_payment_repo
)
from app.infrastructure.mercadopago_gateway import MercadoPagoPixGateway
from app.infrastructure.whatsapp_service import MetaWhatsAppService
from app.infrastructure.email_service import GmailSmtpEmailService
from app.application.use_cases import (
    GetTenantUseCase, ListTenantsUseCase, GetCatalogUseCase,
    ListStaffForServiceUseCase, CalculateAvailabilityUseCase,
    CreateAppointmentUseCase, GetAppointmentByCodeUseCase, CancelAppointmentUseCase,
    GetCustomerAppointmentsUseCase, RescheduleAppointmentUseCase,
    UpdateStaffProfileUseCase, CreateStaffUseCase, DeleteStaffUseCase, BlockStaffSlotUseCase,
    GetTenantDashboardMetricsUseCase, CreateServiceUseCase, UpdateServiceUseCase, DeleteServiceUseCase,
    CreateCategoryUseCase, DeleteCategoryUseCase, UpdateTenantSettingsUseCase, UpdateTenantThemeUseCase,
    GetSuperAdminOverviewUseCase, CreateTenantUseCase, SendPartnerWelcomeEmailUseCase,
    AuthenticateGoogleUserUseCase, DemoLoginUseCase,
    CreatePixPaymentUseCase, GetPaymentStatusUseCase, ConfirmPaymentUseCase
)

# Services Singletons
_payment_gateway = MercadoPagoPixGateway()
_whatsapp_service = MetaWhatsAppService()
_email_service = GmailSmtpEmailService()

def get_payment_gateway() -> IPaymentGateway:
    return _payment_gateway

def get_whatsapp_service() -> IWhatsAppService:
    return _whatsapp_service

def get_email_service() -> IEmailService:
    return _email_service


def get_tenant_use_case(
    repo: ITenantRepository = Depends(get_tenant_repo)
) -> GetTenantUseCase:
    return GetTenantUseCase(repo)

def list_tenants_use_case(
    repo: ITenantRepository = Depends(get_tenant_repo)
) -> ListTenantsUseCase:
    return ListTenantsUseCase(repo)

def get_catalog_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo)
) -> GetCatalogUseCase:
    return GetCatalogUseCase(t_repo, c_repo)

def list_staff_for_service_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> ListStaffForServiceUseCase:
    return ListStaffForServiceUseCase(t_repo, c_repo, s_repo)

def list_staff_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> ListStaffForServiceUseCase:
    return ListStaffForServiceUseCase(t_repo, c_repo, s_repo)

def calculate_availability_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> CalculateAvailabilityUseCase:
    return CalculateAvailabilityUseCase(t_repo, c_repo, s_repo, a_repo)

def create_appointment_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo),
    p_repo: IPaymentRepository = Depends(get_payment_repo),
    p_gate: IPaymentGateway = Depends(get_payment_gateway),
    w_serv: IWhatsAppService = Depends(get_whatsapp_service),
    e_serv: IEmailService = Depends(get_email_service)
) -> CreateAppointmentUseCase:
    return CreateAppointmentUseCase(t_repo, c_repo, s_repo, a_repo, p_repo, p_gate, w_serv, e_serv)

def get_appointment_by_code_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> GetAppointmentByCodeUseCase:
    return GetAppointmentByCodeUseCase(t_repo, c_repo, s_repo, a_repo)

def cancel_appointment_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> CancelAppointmentUseCase:
    return CancelAppointmentUseCase(t_repo, a_repo)

# ==============================================================================
# Injeção para Portais Especializados
# ==============================================================================

def get_customer_appointments_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> GetCustomerAppointmentsUseCase:
    return GetCustomerAppointmentsUseCase(t_repo, c_repo, s_repo, a_repo)

def reschedule_appointment_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> RescheduleAppointmentUseCase:
    return RescheduleAppointmentUseCase(t_repo, c_repo, s_repo, a_repo)

def update_staff_profile_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> UpdateStaffProfileUseCase:
    return UpdateStaffProfileUseCase(t_repo, s_repo)

def create_staff_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> CreateStaffUseCase:
    return CreateStaffUseCase(t_repo, s_repo)

def delete_staff_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> DeleteStaffUseCase:
    return DeleteStaffUseCase(t_repo, s_repo)

def block_staff_slot_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> BlockStaffSlotUseCase:
    return BlockStaffSlotUseCase(t_repo, s_repo)

def get_tenant_dashboard_metrics_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> GetTenantDashboardMetricsUseCase:
    return GetTenantDashboardMetricsUseCase(t_repo, c_repo, s_repo, a_repo)

def create_service_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> CreateServiceUseCase:
    return CreateServiceUseCase(t_repo, c_repo, s_repo)

def update_service_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo)
) -> UpdateServiceUseCase:
    return UpdateServiceUseCase(t_repo, c_repo)

def delete_service_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo)
) -> DeleteServiceUseCase:
    return DeleteServiceUseCase(t_repo, c_repo)

def create_category_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo)
) -> CreateCategoryUseCase:
    return CreateCategoryUseCase(t_repo, c_repo)

def delete_category_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo)
) -> DeleteCategoryUseCase:
    return DeleteCategoryUseCase(t_repo, c_repo)

def update_tenant_settings_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo)
) -> UpdateTenantSettingsUseCase:
    return UpdateTenantSettingsUseCase(t_repo)

def update_tenant_theme_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo)
) -> UpdateTenantThemeUseCase:
    return UpdateTenantThemeUseCase(t_repo)

def get_super_admin_overview_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> GetSuperAdminOverviewUseCase:
    return GetSuperAdminOverviewUseCase(t_repo, a_repo)

def create_tenant_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    e_serv: IEmailService = Depends(get_email_service)
) -> CreateTenantUseCase:
    return CreateTenantUseCase(t_repo, s_repo, e_serv)

def send_partner_welcome_email_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    e_serv: IEmailService = Depends(get_email_service)
) -> SendPartnerWelcomeEmailUseCase:
    return SendPartnerWelcomeEmailUseCase(t_repo, e_serv)

def authenticate_google_user_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> AuthenticateGoogleUserUseCase:
    return AuthenticateGoogleUserUseCase(t_repo, s_repo)

def demo_login_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo)
) -> DemoLoginUseCase:
    return DemoLoginUseCase(t_repo, s_repo)

# ==============================================================================
# Injeção para Pagamentos PIX
# ==============================================================================

def create_pix_payment_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo),
    p_repo: IPaymentRepository = Depends(get_payment_repo),
    p_gate: IPaymentGateway = Depends(get_payment_gateway)
) -> CreatePixPaymentUseCase:
    return CreatePixPaymentUseCase(t_repo, c_repo, a_repo, p_repo, p_gate)

def get_payment_status_use_case(
    p_repo: IPaymentRepository = Depends(get_payment_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo)
) -> GetPaymentStatusUseCase:
    return GetPaymentStatusUseCase(p_repo, a_repo)

def confirm_payment_use_case(
    t_repo: ITenantRepository = Depends(get_tenant_repo),
    c_repo: ICatalogRepository = Depends(get_catalog_repo),
    s_repo: IStaffRepository = Depends(get_staff_repo),
    a_repo: IAppointmentRepository = Depends(get_appointment_repo),
    p_repo: IPaymentRepository = Depends(get_payment_repo),
    w_serv: IWhatsAppService = Depends(get_whatsapp_service),
    e_serv: IEmailService = Depends(get_email_service)
) -> ConfirmPaymentUseCase:
    return ConfirmPaymentUseCase(t_repo, c_repo, s_repo, a_repo, p_repo, w_serv, e_serv)


