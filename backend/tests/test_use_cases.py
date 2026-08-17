import pytest
from app.infrastructure.repositories import (
    InMemoryTenantRepository,
    InMemoryCatalogRepository,
    InMemoryStaffRepository,
    InMemoryAppointmentRepository
)
from app.application.use_cases import (
    GetTenantUseCase, GetCatalogUseCase, ListStaffForServiceUseCase,
    CalculateAvailabilityUseCase, CreateAppointmentUseCase,
    GetCustomerAppointmentsUseCase, RescheduleAppointmentUseCase
)
from app.application.dtos import CreateAppointmentRequestDTO, RescheduleAppointmentRequestDTO
from app.domain.exceptions import TenantNotFoundException, SlotUnavailableException

@pytest.fixture
def tenant_repo():
    return InMemoryTenantRepository()

@pytest.fixture
def catalog_repo():
    return InMemoryCatalogRepository()

@pytest.fixture
def staff_repo():
    return InMemoryStaffRepository()

@pytest.fixture
def appointment_repo():
    return InMemoryAppointmentRepository()

def test_get_tenant_profile_success(tenant_repo):
    use_case = GetTenantUseCase(tenant_repo)
    result = use_case.execute("barbearia-vintage")
    assert result.slug == "barbearia-vintage"
    assert result.name == "Aura Barber Club"
    assert result.theme.primary_color == "#f59e0b"

def test_get_tenant_not_found(tenant_repo):
    use_case = GetTenantUseCase(tenant_repo)
    with pytest.raises(TenantNotFoundException):
        use_case.execute("non-existent-tenant")

def test_get_catalog(tenant_repo, catalog_repo):
    use_case = GetCatalogUseCase(tenant_repo, catalog_repo)
    result = use_case.execute("barbearia-vintage")
    assert len(result.categories) > 0
    assert len(result.services) > 0
    assert any("Corte Degradê" in s.name for s in result.services)

def test_list_staff_for_service(tenant_repo, catalog_repo, staff_repo):
    use_case = ListStaffForServiceUseCase(tenant_repo, catalog_repo, staff_repo)
    result = use_case.execute("barbearia-vintage", service_id="srv-corte-degrade")
    assert len(result) >= 2
    assert all("srv-corte-degrade" in s.specialty_service_ids for s in result)

def test_calculate_availability(tenant_repo, catalog_repo, staff_repo, appointment_repo):
    use_case = CalculateAvailabilityUseCase(tenant_repo, catalog_repo, staff_repo, appointment_repo)
    result = use_case.execute(
        slug="barbearia-vintage",
        date_str="2026-08-19",
        staff_id="stf-marcus-barber",
        service_id="srv-corte-degrade"
    )
    assert result.total_slots > 0
    assert result.available_slots > 0
    assert any(s.is_available for s in result.slots)

def test_create_appointment_and_prevent_conflict(tenant_repo, catalog_repo, staff_repo, appointment_repo):
    create_uc = CreateAppointmentUseCase(tenant_repo, catalog_repo, staff_repo, appointment_repo)
    
    req = CreateAppointmentRequestDTO(
        service_id="srv-corte-degrade",
        staff_id="stf-marcus-barber",
        appointment_date="2026-08-19",
        start_time="14:00",
        customer_name="João Carlos Silveira",
        customer_phone="(11) 99999-8888",
        customer_email="joao.carlos@empresa.com.br"
    )
    
    appt = create_uc.execute("barbearia-vintage", req)
    assert appt.voucher_code.startswith("ADM-")
    assert appt.customer_name == "João Carlos Silveira"
    assert appt.customer_email == "joao.carlos@empresa.com.br"
    assert "https://calendar.google.com" in appt.google_calendar_url
    assert "wa.me" in appt.whatsapp_direct_link

    # Attempt double booking for the exact same slot and same staff
    with pytest.raises(SlotUnavailableException):
        create_uc.execute("barbearia-vintage", req)

def test_customer_portal_use_cases(tenant_repo, catalog_repo, staff_repo, appointment_repo):
    cust_uc = GetCustomerAppointmentsUseCase(tenant_repo, catalog_repo, staff_repo, appointment_repo)
    appts = cust_uc.execute("barbearia-vintage", "valerius.maximus@empresa.com.br")
    assert len(appts) >= 1
    assert appts[0].voucher_code == "ADM-DEMO1"

    # Reschedule
    resched_uc = RescheduleAppointmentUseCase(tenant_repo, catalog_repo, staff_repo, appointment_repo)
    resched_req = RescheduleAppointmentRequestDTO(
        appointment_date="2026-08-22",
        start_time="15:00",
        reason="Imprevisto corporativo"
    )
    res = resched_uc.execute("barbearia-vintage", "ADM-DEMO1", resched_req)
    assert res.appointment_date == "2026-08-22"
    assert res.start_time == "15:00"
