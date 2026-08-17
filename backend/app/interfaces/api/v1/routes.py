from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, Body
from app.application.dtos import (
    TenantResponseDTO, CatalogResponseDTO, StaffDTO,
    AvailabilityResponseDTO, CreateAppointmentRequestDTO,
    AppointmentResponseDTO, CancelAppointmentResponseDTO,
    DashboardMetricsDTO, UpdateStaffProfileDTO, CreateStaffRequestDTO, BlockSlotRequestDTO,
    RescheduleAppointmentRequestDTO, CreateServiceRequestDTO, UpdateServiceRequestDTO, ServiceDTO,
    CreateCategoryRequestDTO, ServiceCategoryDTO, UpdateTenantSettingsDTO,
    UpdateThemeRequestDTO, SuperAdminOverviewDTO, CreateTenantRequestDTO,
    GoogleAuthRequestDTO, DemoLoginRequestDTO, AuthResponseDTO,
    PixPaymentResponseDTO, CreatePixPaymentRequestDTO, PaymentStatusResponseDTO,
    SimulatePaymentConfirmationRequestDTO
)
from app.application.use_cases import (
    GetTenantUseCase, ListTenantsUseCase, GetCatalogUseCase,
    ListStaffForServiceUseCase, CalculateAvailabilityUseCase,
    CreateAppointmentUseCase, GetAppointmentByCodeUseCase, CancelAppointmentUseCase,
    GetCustomerAppointmentsUseCase, RescheduleAppointmentUseCase,
    UpdateStaffProfileUseCase, CreateStaffUseCase, DeleteStaffUseCase, BlockStaffSlotUseCase,
    GetTenantDashboardMetricsUseCase, CreateServiceUseCase, UpdateServiceUseCase, DeleteServiceUseCase,
    CreateCategoryUseCase, DeleteCategoryUseCase, UpdateTenantSettingsUseCase, UpdateTenantThemeUseCase,
    GetSuperAdminOverviewUseCase, CreateTenantUseCase,
    AuthenticateGoogleUserUseCase, DemoLoginUseCase,
    CreatePixPaymentUseCase, GetPaymentStatusUseCase, ConfirmPaymentUseCase
)
from app.domain.exceptions import (
    TenantNotFoundException, ServiceNotFoundException,
    StaffNotFoundException, StaffNotQualifiedException,
    SlotUnavailableException, AppointmentNotFoundException
)
from app.interfaces.api.deps import (
    get_tenant_use_case, list_tenants_use_case, get_catalog_use_case,
    list_staff_use_case, calculate_availability_use_case,
    create_appointment_use_case, get_appointment_by_code_use_case,
    cancel_appointment_use_case, get_customer_appointments_use_case,
    reschedule_appointment_use_case, update_staff_profile_use_case,
    create_staff_use_case, delete_staff_use_case, block_staff_slot_use_case,
    get_tenant_dashboard_metrics_use_case,
    create_service_use_case, update_service_use_case, delete_service_use_case,
    create_category_use_case, delete_category_use_case,
    update_tenant_settings_use_case, update_tenant_theme_use_case,
    get_super_admin_overview_use_case, create_tenant_use_case,
    authenticate_google_user_use_case, demo_login_use_case,
    create_pix_payment_use_case, get_payment_status_use_case, confirm_payment_use_case
)
from app.core.security import (
    get_current_user_optional, get_current_user_required,
    require_roles, require_super_admin, sanitize_input_string
)

router = APIRouter()

# ==============================================================================
# 1. Rotas Públicas e Catálogo Multi-Tenant
# ==============================================================================

@router.get(
    "/tenants",
    response_model=List[TenantResponseDTO],
    summary="Listar Parceiros Credenciados",
    description="Retorna a relação de todos os parceiros ativos cadastrados no ecossistema Adminic com métricas de licenciamento e identidade visual."
)
def list_tenants(
    use_case: ListTenantsUseCase = Depends(list_tenants_use_case)
):
    return use_case.execute()


@router.get(
    "/tenants/{slug}",
    response_model=TenantResponseDTO,
    summary="Perfil e Identidade Visual do Parceiro",
    description="Retorna os dados completos do estabelecimento, paleta de cores (primária, secundária, destaque, brilho), tipografia e horários de funcionamento."
)
def get_tenant_profile(
    slug: str = Path(..., description="Identificador único (slug) do parceiro", examples=["barbearia-vintage"]),
    use_case: GetTenantUseCase = Depends(get_tenant_use_case)
):
    try:
        return use_case.execute(slug)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/tenants/{slug}/services",
    response_model=CatalogResponseDTO,
    summary="Catálogo de Serviços e Categorias",
    description="Retorna todas as categorias e serviços ativos com duração estimada, valores em Reais e imagens."
)
def get_tenant_catalog(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    use_case: GetCatalogUseCase = Depends(get_catalog_use_case)
):
    try:
        return use_case.execute(slug)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/tenants/{slug}/staff",
    response_model=List[StaffDTO],
    summary="Profissionais e Especialistas",
    description="Lista os profissionais cadastrados. Se o parâmetro service_id for informado, filtra apenas colaboradores habilitados para aquele serviço."
)
def list_staff(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    service_id: Optional[str] = Query(None, description="ID do serviço para filtro de aptidão", examples=["srv-corte-degrade"]),
    use_case: ListStaffForServiceUseCase = Depends(list_staff_use_case)
):
    try:
        return use_case.execute(slug, service_id=service_id)
    except (TenantNotFoundException, ServiceNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/tenants/{slug}/availability",
    response_model=AvailabilityResponseDTO,
    summary="Cálculo de Horários Disponíveis em Tempo Real",
    description="Calcula em tempo real os slots de horários livres, respeitando turnos de trabalho, intervalos de almoço, bloqueios de agenda e agendamentos existentes."
)
def get_availability(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    date: str = Query(..., description="Data desejada no formato YYYY-MM-DD", examples=["2026-08-18"]),
    staff_id: Optional[str] = Query(None, description="ID do profissional ou 'any' para qualquer disponível", examples=["stf-marcus-barber"]),
    service_id: Optional[str] = Query(None, description="ID do serviço para cálculo preciso da duração", examples=["srv-corte-degrade"]),
    use_case: CalculateAvailabilityUseCase = Depends(calculate_availability_use_case)
):
    try:
        return use_case.execute(slug=slug, date_str=date, staff_id=staff_id, service_id=service_id)
    except (TenantNotFoundException, StaffNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except (StaffNotQualifiedException, ValueError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/tenants/{slug}/appointments",
    response_model=AppointmentResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Criar e Confirmar Agendamento",
    description="Registra a reserva com validação de disponibilidade e e-mail corporativo obrigatório, gerando voucher com QR Code e atalhos de integração."
)
def create_appointment(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    request: CreateAppointmentRequestDTO = Body(...),
    use_case: CreateAppointmentUseCase = Depends(create_appointment_use_case)
):
    try:
        return use_case.execute(slug, request)
    except (TenantNotFoundException, ServiceNotFoundException, StaffNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except (StaffNotQualifiedException, ValueError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except SlotUnavailableException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get(
    "/tenants/{slug}/appointments/{code}",
    response_model=AppointmentResponseDTO,
    summary="Consultar Reserva por Código de Voucher",
    description="Retorna os dados detalhados de um agendamento através do código do voucher."
)
def get_appointment(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    code: str = Path(..., description="Código único do voucher", examples=["ADM-DEMO1"]),
    use_case: GetAppointmentByCodeUseCase = Depends(get_appointment_by_code_use_case)
):
    try:
        return use_case.execute(slug, code)
    except (TenantNotFoundException, AppointmentNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/tenants/{slug}/appointments/{code}",
    response_model=CancelAppointmentResponseDTO,
    summary="Cancelar Agendamento",
    description="Cancela a reserva e libera o slot para novos agendamentos."
)
def cancel_appointment(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    code: str = Path(..., description="Código único do voucher", examples=["ADM-DEMO1"]),
    use_case: CancelAppointmentUseCase = Depends(cancel_appointment_use_case)
):
    try:
        return use_case.execute(slug, code)
    except (TenantNotFoundException, AppointmentNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ==============================================================================
# 2. Portal do Cliente Final (/meus-agendamentos)
# ==============================================================================

@router.get(
    "/tenants/{slug}/customer/appointments",
    response_model=List[AppointmentResponseDTO],
    summary="Histórico de Agendamentos do Cliente",
    description="Retorna todos os agendamentos vinculados ao e-mail informado para acompanhamento, reagendamento ou cancelamento."
)
def get_customer_appointments(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    email: str = Query(..., description="E-mail do titular do agendamento", examples=["valerius.maximus@empresa.com.br"]),
    use_case: GetCustomerAppointmentsUseCase = Depends(get_customer_appointments_use_case)
):
    try:
        clean_email = sanitize_input_string(email).lower()
        return use_case.execute(slug, clean_email)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tenants/{slug}/appointments/{code}/reschedule",
    response_model=AppointmentResponseDTO,
    summary="Reagendar Horário de Atendimento",
    description="Permite que o cliente altere a data e horário de sua reserva mantendo o mesmo voucher."
)
def reschedule_appointment(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-vintage"]),
    code: str = Path(..., description="Código do voucher", examples=["ADM-DEMO1"]),
    request: RescheduleAppointmentRequestDTO = Body(...),
    use_case: RescheduleAppointmentUseCase = Depends(reschedule_appointment_use_case)
):
    try:
        return use_case.execute(slug, code, request)
    except (TenantNotFoundException, AppointmentNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except SlotUnavailableException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


# ==============================================================================
# 3. Portal do Colaborador / Profissional (/colaborador)
# ==============================================================================

@router.put(
    "/tenants/{slug}/staff/{staff_id}/profile",
    response_model=StaffDTO,
    summary="Atualizar Perfil do Colaborador",
    description="Permite que o profissional atualize seu nome, cargo, biografia, telefone, turnos e foto de perfil."
)
def update_staff_profile(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-campelo"]),
    staff_id: str = Path(..., description="ID do colaborador", examples=["stf-julio-sousa"]),
    request: UpdateStaffProfileDTO = Body(...),
    use_case: UpdateStaffProfileUseCase = Depends(update_staff_profile_use_case)
):
    try:
        return use_case.execute(slug, staff_id, request)
    except (TenantNotFoundException, StaffNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tenants/{slug}/staff/{staff_id}/block-slot",
    response_model=StaffDTO,
    summary="Bloquear Horário na Agenda",
    description="Permite que o profissional bloqueie períodos de sua jornada para reuniões internas, intervalos ou compromissos pessoais."
)
def block_staff_slot(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-campelo"]),
    staff_id: str = Path(..., description="ID do colaborador", examples=["stf-julio-sousa"]),
    request: BlockSlotRequestDTO = Body(...),
    use_case: BlockStaffSlotUseCase = Depends(block_staff_slot_use_case)
):
    try:
        return use_case.execute(slug, staff_id, request)
    except (TenantNotFoundException, StaffNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ==============================================================================
# 4. Painel de Gestão do Parceiro / Dono (/gestao)
# ==============================================================================

@router.get(
    "/tenants/{slug}/admin/metrics",
    response_model=DashboardMetricsDTO,
    summary="Métricas Operacionais e Financeiras do Parceiro",
    description="Painel de controle gerencial com faturamento mensal, agendamentos confirmados, taxa de ocupação e status do período de testes."
)
def get_tenant_dashboard_metrics(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-campelo"]),
    use_case: GetTenantDashboardMetricsUseCase = Depends(get_tenant_dashboard_metrics_use_case)
):
    try:
        return use_case.execute(slug)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tenants/{slug}/admin/services",
    response_model=ServiceDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar Novo Serviço no Catálogo",
    description="Adiciona um novo procedimento ao catálogo de serviços do parceiro."
)
def create_service(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-campelo"]),
    request: CreateServiceRequestDTO = Body(...),
    use_case: CreateServiceUseCase = Depends(create_service_use_case)
):
    try:
        return use_case.execute(slug, request)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/tenants/{slug}/admin/services/{service_id}",
    response_model=ServiceDTO,
    summary="Atualizar Serviço do Catálogo",
    description="Edita nome, valor, duração, categoria ou descrição de um serviço existente."
)
def update_service(
    slug: str = Path(..., description="Slug do parceiro"),
    service_id: str = Path(..., description="ID do serviço"),
    request: UpdateServiceRequestDTO = Body(...),
    use_case: UpdateServiceUseCase = Depends(update_service_use_case)
):
    try:
        return use_case.execute(slug, service_id, request)
    except (TenantNotFoundException, ServiceNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/tenants/{slug}/admin/services/{service_id}",
    summary="Excluir Serviço do Catálogo",
    description="Remove um serviço do catálogo do estabelecimento."
)
def delete_service(
    slug: str = Path(..., description="Slug do parceiro"),
    service_id: str = Path(..., description="ID do serviço"),
    use_case: DeleteServiceUseCase = Depends(delete_service_use_case)
):
    try:
        success = use_case.execute(slug, service_id)
        return {"success": success, "message": "Serviço excluído com sucesso."}
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tenants/{slug}/admin/staff",
    response_model=StaffDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar Novo Colaborador / Barbeiro",
    description="Adiciona um novo profissional à equipe do estabelecimento."
)
def create_staff(
    slug: str = Path(..., description="Slug do parceiro"),
    request: CreateStaffRequestDTO = Body(...),
    use_case: CreateStaffUseCase = Depends(create_staff_use_case)
):
    try:
        return use_case.execute(slug, request)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/tenants/{slug}/admin/staff/{staff_id}",
    summary="Excluir Colaborador / Barbeiro",
    description="Remove um profissional da equipe do estabelecimento."
)
def delete_staff(
    slug: str = Path(..., description="Slug do parceiro"),
    staff_id: str = Path(..., description="ID do colaborador"),
    use_case: DeleteStaffUseCase = Depends(delete_staff_use_case)
):
    try:
        success = use_case.execute(slug, staff_id)
        return {"success": success, "message": "Colaborador excluído com sucesso."}
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tenants/{slug}/admin/categories",
    response_model=ServiceCategoryDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Criar Categoria de Serviços",
    description="Adiciona uma nova seção/categoria de serviços."
)
def create_category(
    slug: str = Path(..., description="Slug do parceiro"),
    request: CreateCategoryRequestDTO = Body(...),
    use_case: CreateCategoryUseCase = Depends(create_category_use_case)
):
    try:
        return use_case.execute(slug, request)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/tenants/{slug}/admin/categories/{category_id}",
    summary="Excluir Categoria de Serviços",
    description="Remove uma categoria de serviços."
)
def delete_category(
    slug: str = Path(..., description="Slug do parceiro"),
    category_id: str = Path(..., description="ID da categoria"),
    use_case: DeleteCategoryUseCase = Depends(delete_category_use_case)
):
    try:
        success = use_case.execute(slug, category_id)
        return {"success": success, "message": "Categoria excluída com sucesso."}
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/tenants/{slug}/admin/settings",
    response_model=TenantResponseDTO,
    summary="Atualizar Configurações Gerais do Estabelecimento",
    description="Permite configurar nome, slogan, endereço, telefones, modo PIX (produção vs teste R$ 0,01), chaves do Mercado Pago e mensagens de WhatsApp."
)
def update_tenant_settings(
    slug: str = Path(..., description="Slug do parceiro"),
    request: UpdateTenantSettingsDTO = Body(...),
    use_case: UpdateTenantSettingsUseCase = Depends(update_tenant_settings_use_case)
):
    try:
        return use_case.execute(slug, request)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/tenants/{slug}/admin/theme",
    response_model=TenantResponseDTO,
    summary="Personalizar Identidade Visual e Tema",
    description="Permite que o gestor configure paleta de cores, tipografia, opacidade de vidro e textos de destaque da sua página de agendamento."
)
def update_tenant_theme(
    slug: str = Path(..., description="Slug do parceiro", examples=["barbearia-campelo"]),
    request: UpdateThemeRequestDTO = Body(...),
    use_case: UpdateTenantThemeUseCase = Depends(update_tenant_theme_use_case)
):
    try:
        return use_case.execute(slug, request)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ==============================================================================
# 5. Painel do Super Administrador (/super-admin)
# ==============================================================================

@router.get(
    "/super-admin/overview",
    response_model=SuperAdminOverviewDTO,
    summary="Visão Executiva Global da Adminic",
    description="Dashboard executivo para monitoramento de todos os parceiros cadastrados, controle de trials (30 dias) e faturamento consolidado."
)
def get_super_admin_overview(
    use_case: GetSuperAdminOverviewUseCase = Depends(get_super_admin_overview_use_case)
):
    return use_case.execute()


@router.get(
    "/super-admin/auditoria",
    summary="Consultar Trilha de Auditoria Criptográfica com SHA-256",
    description="Retorna os registros de auditoria com hashes encadeados para compliance e segurança."
)
def get_audit_trail(
    limit: int = 100
):
    from app.core.auditoria import get_audit_db
    conn = get_audit_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trilha_auditoria ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.post(
    "/super-admin/tenants",
    response_model=TenantResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Credenciar Novo Parceiro no Ecossistema",
    description="Cria uma nova empresa parceira com 30 dias de trial gratuito e identidade visual inicial configurada."
)
def create_tenant(
    request: CreateTenantRequestDTO = Body(...),
    use_case: CreateTenantUseCase = Depends(create_tenant_use_case)
):
    try:
        return use_case.execute(request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==============================================================================
# 6. Autenticação Unificada: Google One Tap e Sessão
# ==============================================================================

@router.post(
    "/auth/google",
    response_model=AuthResponseDTO,
    summary="Autenticação com Google One Tap / Google Identity Services",
    description="Valida o JWT ID Token emitido pelo Google, identifica o perfil do usuário e retorna a sessão autenticada."
)
def authenticate_google(
    request: GoogleAuthRequestDTO = Body(...),
    use_case: AuthenticateGoogleUserUseCase = Depends(authenticate_google_user_use_case)
):
    try:
        return use_case.execute(request)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Falha na validação do token Google: {str(e)}")


@router.post(
    "/auth/demo-login",
    response_model=AuthResponseDTO,
    summary="Login de Demonstração Rápido (1 Clique)",
    description="Permite alternar instantaneamente entre os papéis (Cliente, Colaborador, Gestor e Super Admin) para validação."
)
def demo_login(
    request: DemoLoginRequestDTO = Body(...),
    use_case: DemoLoginUseCase = Depends(demo_login_use_case)
):
    return use_case.execute(request)


# ==============================================================================
# 7. Pagamentos Instantâneos PIX e Mercado Pago Integrado
# ==============================================================================

@router.post(
    "/tenants/{slug}/payments/pix",
    response_model=PixPaymentResponseDTO,
    summary="Gerar Cobrança PIX para Agendamento",
    description="Gera um pagamento PIX dinâmico com QR Code em Base64 e chave Copia e Cola padrão Mercado Pago para o voucher informado."
)
def create_pix_payment(
    slug: str = Path(..., description="Identificador único do parceiro"),
    request: CreatePixPaymentRequestDTO = Body(...),
    use_case: CreatePixPaymentUseCase = Depends(create_pix_payment_use_case)
):
    try:
        return use_case.execute(slug, request)
    except TenantNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except (AppointmentNotFoundException, ServiceNotFoundException) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/tenants/{slug}/payments/{payment_id}/status",
    response_model=PaymentStatusResponseDTO,
    summary="Consultar Status do Pagamento PIX",
    description="Verifica se o pagamento PIX foi compensado pelo cliente no Mercado Pago."
)
def get_payment_status(
    slug: str = Path(...),
    payment_id: str = Path(..., description="ID da transação de pagamento"),
    use_case: GetPaymentStatusUseCase = Depends(get_payment_status_use_case)
):
    try:
        return use_case.execute(payment_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/tenants/{slug}/payments/{payment_id}/simulate-confirm",
    response_model=PaymentStatusResponseDTO,
    summary="Simular / Confirmar Pagamento Instantâneo (Ambiente de Teste / Webhook)",
    description="Aprova imediatamente o pagamento PIX, atualiza o agendamento para pago/confirmado e dispara os e-mails e alertas de WhatsApp."
)
def simulate_confirm_payment(
    slug: str = Path(...),
    payment_id: str = Path(...),
    use_case: ConfirmPaymentUseCase = Depends(confirm_payment_use_case)
):
    try:
        return use_case.execute(payment_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/payments/webhook",
    summary="Webhook Oficial do Mercado Pago",
    description="Recebe notificações IPN/Webhook do Mercado Pago e aprova pagamentos compensados automaticamente."
)
def mercadopago_webhook(
    payload: dict = Body(...),
    use_case: ConfirmPaymentUseCase = Depends(confirm_payment_use_case)
):
    # Processa notificação do Mercado Pago
    payment_id = payload.get("data", {}).get("id") or payload.get("id")
    if payment_id:
        try:
            use_case.execute(str(payment_id))
        except Exception:
            pass
    return {"status": "received", "timestamp": "ok"}


