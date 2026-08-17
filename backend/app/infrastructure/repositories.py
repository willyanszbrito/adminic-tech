from typing import List, Optional, Dict
from datetime import datetime, timezone
from app.domain.entities import Tenant, Service, ServiceCategory, Staff, Appointment, BlockedSlot, Payment
from app.domain.interfaces import (
    ITenantRepository, ICatalogRepository, IStaffRepository, IAppointmentRepository, IPaymentRepository
)
from app.infrastructure.seed_data import (
    ALL_SEED_TENANTS, ALL_SEED_CATEGORIES, ALL_SEED_SERVICES, ALL_SEED_STAFF
)

class InMemoryTenantRepository(ITenantRepository):
    def __init__(self, initial_tenants: Optional[List[Tenant]] = None):
        self._tenants: Dict[str, Tenant] = {}
        tenants_to_load = initial_tenants if initial_tenants is not None else ALL_SEED_TENANTS
        for t in tenants_to_load:
            self._tenants[t.id] = t

    def get_by_slug(self, slug: str) -> Optional[Tenant]:
        for t in self._tenants.values():
            if t.slug == slug and t.is_active:
                return t
        return None

    def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        return self._tenants.get(tenant_id)

    def list_all(self) -> List[Tenant]:
        return [t for t in self._tenants.values() if t.is_active]

    def save(self, tenant: Tenant) -> Tenant:
        self._tenants[tenant.id] = tenant
        return tenant


class InMemoryCatalogRepository(ICatalogRepository):
    def __init__(
        self,
        initial_categories: Optional[List[ServiceCategory]] = None,
        initial_services: Optional[List[Service]] = None
    ):
        self._categories: Dict[str, ServiceCategory] = {}
        self._services: Dict[str, Service] = {}

        cats = initial_categories if initial_categories is not None else ALL_SEED_CATEGORIES
        for c in cats:
            self._categories[c.id] = c

        srvs = initial_services if initial_services is not None else ALL_SEED_SERVICES
        for s in srvs:
            self._services[s.id] = s

    def get_categories_by_tenant(self, tenant_id: str) -> List[ServiceCategory]:
        cats = [c for c in self._categories.values() if c.tenant_id == tenant_id]
        return sorted(cats, key=lambda x: x.display_order)

    def save_category(self, category: ServiceCategory) -> ServiceCategory:
        self._categories[category.id] = category
        return category

    def delete_category(self, tenant_id: str, category_id: str) -> bool:
        if category_id in self._categories and self._categories[category_id].tenant_id == tenant_id:
            del self._categories[category_id]
            return True
        return False

    def get_services_by_tenant(self, tenant_id: str) -> List[Service]:
        return [s for s in self._services.values() if s.tenant_id == tenant_id and s.is_active]

    def get_service_by_id(self, tenant_id: str, service_id: str) -> Optional[Service]:
        srv = self._services.get(service_id)
        if srv and srv.tenant_id == tenant_id:
            return srv
        return None

    def save_service(self, service: Service) -> Service:
        self._services[service.id] = service
        return service

    def delete_service(self, tenant_id: str, service_id: str) -> bool:
        srv = self._services.get(service_id)
        if srv and srv.tenant_id == tenant_id:
            srv.is_active = False
            return True
        return False


class InMemoryStaffRepository(IStaffRepository):
    def __init__(self, initial_staff: Optional[List[Staff]] = None):
        self._staff: Dict[str, Staff] = {}
        staff_to_load = initial_staff if initial_staff is not None else ALL_SEED_STAFF
        for s in staff_to_load:
            self._staff[s.id] = s

    def get_staff_by_tenant(self, tenant_id: str) -> List[Staff]:
        return [s for s in self._staff.values() if s.tenant_id == tenant_id and s.is_active]

    def get_staff_for_service(self, tenant_id: str, service_id: str) -> List[Staff]:
        return [
            s for s in self._staff.values()
            if s.tenant_id == tenant_id and s.is_active and (service_id in s.specialty_service_ids or len(s.specialty_service_ids) == 0)
        ]

    def get_staff_by_id(self, tenant_id: str, staff_id: str) -> Optional[Staff]:
        s = self._staff.get(staff_id)
        if s and s.tenant_id == tenant_id and s.is_active:
            return s
        return None

    def save(self, staff: Staff) -> Staff:
        self._staff[staff.id] = staff
        return staff

    def delete_staff(self, tenant_id: str, staff_id: str) -> bool:
        s = self._staff.get(staff_id)
        if s and s.tenant_id == tenant_id:
            s.is_active = False
            return True
        return False

    def add_blocked_slot(self, tenant_id: str, staff_id: str, blocked_slot: BlockedSlot) -> Staff:
        s = self._staff.get(staff_id)
        if s and s.tenant_id == tenant_id:
            s.blocked_slots.append(blocked_slot)
            return s
        raise ValueError("Profissional não encontrado para adicionar bloqueio de agenda.")


class InMemoryAppointmentRepository(IAppointmentRepository):
    def __init__(self):
        self._appointments: Dict[str, Appointment] = {}
        # Preload model appointment for demonstration
        demo_appt = Appointment(
            id="apt-demo-seed-1",
            tenant_id="tnt-barbearia-campelo",
            voucher_code="ADM-DEMO1",
            service_id="srv-campelo-corte",
            staff_id="stf-julio-sousa",
            appointment_date="2026-08-18",
            start_time="14:00",
            end_time="14:30",
            customer_name="Valerius Maximus",
            customer_phone="(92) 98888-7777",
            customer_email="valerius.maximus@empresa.com.br",
            notes="Cliente preferencial",
            status="confirmed",
            price=30.00,
            created_at=datetime.now(timezone.utc)
        )
        self._appointments[demo_appt.id] = demo_appt

    def get_appointments_for_staff_and_date(self, tenant_id: str, staff_id: str, appointment_date: str) -> List[Appointment]:
        return [
            a for a in self._appointments.values()
            if a.tenant_id == tenant_id
            and a.staff_id == staff_id
            and a.appointment_date == appointment_date
            and a.status == "confirmed"
        ]

    def get_appointments_by_tenant(self, tenant_id: str) -> List[Appointment]:
        return [a for a in self._appointments.values() if a.tenant_id == tenant_id]

    def get_appointments_by_customer_email(self, tenant_id: str, email: str) -> List[Appointment]:
        normalized = email.strip().lower()
        return [
            a for a in self._appointments.values()
            if a.tenant_id == tenant_id and a.customer_email.strip().lower() == normalized
        ]

    def create_appointment(self, appointment: Appointment) -> Appointment:
        self._appointments[appointment.id] = appointment
        return appointment

    def get_by_voucher_code(self, tenant_id: str, code: str) -> Optional[Appointment]:
        for a in self._appointments.values():
            if a.tenant_id == tenant_id and (a.voucher_code.upper() == code.upper() or a.id == code):
                return a
        return None

    def cancel_appointment(self, tenant_id: str, code: str) -> Optional[Appointment]:
        for a in self._appointments.values():
            if a.tenant_id == tenant_id and (a.voucher_code.upper() == code.upper() or a.id == code):
                a.status = "cancelled"
                a.cancelled_at = datetime.now(timezone.utc)
                return a
        return None

    def update_appointment(self, appointment: Appointment) -> Appointment:
        self._appointments[appointment.id] = appointment
        return appointment


class InMemoryPaymentRepository(IPaymentRepository):
    def __init__(self):
        self._payments: Dict[str, Payment] = {}

    def create_payment(self, payment: Payment) -> Payment:
        self._payments[payment.id] = payment
        return payment

    def get_payment_by_id(self, payment_id: str) -> Optional[Payment]:
        return self._payments.get(payment_id)

    def get_payment_by_appointment_id(self, appointment_id: str) -> Optional[Payment]:
        for p in self._payments.values():
            if p.appointment_id == appointment_id:
                return p
        return None

    def update_payment(self, payment: Payment) -> Payment:
        self._payments[payment.id] = payment
        return payment


# Singletons for memory storage
_tenant_repo = InMemoryTenantRepository()
_catalog_repo = InMemoryCatalogRepository()
_staff_repo = InMemoryStaffRepository()
_appointment_repo = InMemoryAppointmentRepository()
_payment_repo = InMemoryPaymentRepository()

def get_tenant_repo() -> ITenantRepository:
    return _tenant_repo

def get_catalog_repo() -> ICatalogRepository:
    return _catalog_repo

def get_staff_repo() -> IStaffRepository:
    return _staff_repo

def get_appointment_repo() -> IAppointmentRepository:
    return _appointment_repo

def get_payment_repo() -> IPaymentRepository:
    return _payment_repo

