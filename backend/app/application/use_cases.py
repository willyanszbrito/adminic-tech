import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.domain.entities import (
    Tenant, Service, ServiceCategory, Staff, Appointment, TimeSlot, BlockedSlot, Payment
)
from app.domain.interfaces import (
    ITenantRepository, ICatalogRepository, IStaffRepository, IAppointmentRepository,
    IPaymentRepository, IPaymentGateway, IWhatsAppService, IEmailService
)
from app.domain.exceptions import (
    TenantNotFoundException, ServiceNotFoundException, StaffNotFoundException,
    StaffNotQualifiedException, SlotUnavailableException, AppointmentNotFoundException
)
from app.application.dtos import (
    TenantResponseDTO, TenantThemeDTO, BusinessHoursDTO, CatalogResponseDTO,
    StaffDTO, ServiceDTO, ServiceCategoryDTO,
    AvailabilityResponseDTO, TimeSlotDTO, CreateAppointmentRequestDTO,
    AppointmentResponseDTO, CancelAppointmentResponseDTO, DashboardMetricsDTO,
    UpdateStaffProfileDTO, CreateStaffRequestDTO, BlockSlotRequestDTO, RescheduleAppointmentRequestDTO,
    CreateServiceRequestDTO, UpdateServiceRequestDTO, CreateCategoryRequestDTO, UpdateCategoryRequestDTO,
    UpdateThemeRequestDTO, UpdateTenantSettingsDTO,
    SuperAdminOverviewDTO, TenantOverviewItemDTO, CreateTenantRequestDTO, BlockedSlotDTO,
    GoogleAuthRequestDTO, DemoLoginRequestDTO, UserDTO, AuthResponseDTO,
    PixPaymentResponseDTO, CreatePixPaymentRequestDTO, PaymentStatusResponseDTO
)
from app.infrastructure.notification_service import (
    generate_google_calendar_url, generate_whatsapp_direct_link,
    generate_whatsapp_message, generate_qr_payload
)

def map_tenant_to_dto(tenant: Tenant) -> TenantResponseDTO:
    theme_dto = TenantThemeDTO(
        primary_color=tenant.theme.primary_color,
        secondary_color=tenant.theme.secondary_color,
        accent_color=tenant.theme.accent_color,
        background_mode=tenant.theme.background_mode,
        surface_glass_opacity=tenant.theme.surface_glass_opacity,
        glow_color=tenant.theme.glow_color,
        font_heading=tenant.theme.font_heading,
        font_body=tenant.theme.font_body,
        badge_text=tenant.theme.badge_text
    )
    biz_dto = BusinessHoursDTO(
        days_open=tenant.business_hours.days_open,
        open_time=tenant.business_hours.open_time,
        close_time=tenant.business_hours.close_time,
        slot_interval_minutes=tenant.business_hours.slot_interval_minutes,
        lunch_break_start=tenant.business_hours.lunch_break_start,
        lunch_break_end=tenant.business_hours.lunch_break_end
    )
    return TenantResponseDTO(
        id=tenant.id,
        slug=tenant.slug,
        name=tenant.name,
        slogan=tenant.slogan,
        description=tenant.description,
        category=tenant.category,
        logo_url=tenant.logo_url,
        banner_url=tenant.banner_url,
        phone=tenant.phone,
        whatsapp=tenant.whatsapp,
        email=tenant.email,
        address=tenant.address,
        instagram=tenant.instagram,
        theme=theme_dto,
        business_hours=biz_dto,
        is_active=tenant.is_active,
        features=tenant.features,
        pix_enabled=getattr(tenant, 'pix_enabled', True),
        pix_mode=getattr(tenant, 'pix_mode', 'production'),
        pix_penny_price=getattr(tenant, 'pix_penny_price', 0.01),
        mercadopago_public_key=getattr(tenant, 'mercadopago_public_key', None),
        mercadopago_access_token=getattr(tenant, 'mercadopago_access_token', None),
        mercadopago_pix_key=getattr(tenant, 'mercadopago_pix_key', None),
        whatsapp_custom_message=getattr(tenant, 'whatsapp_custom_message', None),
        plan_name=tenant.plan_name,
        trial_days_remaining=tenant.trial_days_remaining,
        trial_status=tenant.trial_status,
        trial_ends_at=tenant.trial_ends_at,
        monthly_revenue=tenant.monthly_revenue
    )

# ==============================================================================
# Casos de Uso: Tenant e Catálogo
# ==============================================================================

class GetTenantUseCase:
    def __init__(self, tenant_repo: ITenantRepository):
        self.tenant_repo = tenant_repo

    def execute(self, slug: str) -> TenantResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento parceiro com identificador '{slug}' não foi encontrado.")
        return map_tenant_to_dto(tenant)


class ListTenantsUseCase:
    def __init__(self, tenant_repo: ITenantRepository):
        self.tenant_repo = tenant_repo

    def execute(self) -> List[TenantResponseDTO]:
        tenants = self.tenant_repo.list_all()
        return [map_tenant_to_dto(t) for t in tenants]


class GetCatalogUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo

    def execute(self, slug: str) -> CatalogResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento parceiro '{slug}' não encontrado.")

        categories = self.catalog_repo.get_categories_by_tenant(tenant.id)
        services = self.catalog_repo.get_services_by_tenant(tenant.id)

        cat_dtos = [ServiceCategoryDTO(id=c.id, tenant_id=c.tenant_id, name=c.name, description=c.description, icon=c.icon, display_order=c.display_order) for c in categories]
        srv_dtos = [ServiceDTO(id=s.id, tenant_id=s.tenant_id, category_id=s.category_id, name=s.name, description=s.description, duration_minutes=s.duration_minutes, price=s.price, image_url=s.image_url, is_featured=s.is_featured, is_active=s.is_active) for s in services]

        return CatalogResponseDTO(
            tenant_id=tenant.id,
            tenant_slug=slug,
            tenant_name=tenant.name,
            tenant_slogan=tenant.slogan,
            categories=cat_dtos,
            services=srv_dtos,
            total_services=len(srv_dtos)
        )


class ListStaffForServiceUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo

    def execute(self, slug: str, service_id: Optional[str] = None) -> List[StaffDTO]:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        if service_id:
            service = self.catalog_repo.get_service_by_id(tenant.id, service_id)
            if not service:
                raise ServiceNotFoundException(f"Serviço com ID '{service_id}' não encontrado.")
            staff_members = self.staff_repo.get_staff_for_service(tenant.id, service_id)
        else:
            staff_members = self.staff_repo.get_staff_by_tenant(tenant.id)

        return [
            StaffDTO(
                id=s.id,
                tenant_id=s.tenant_id,
                name=s.name,
                role=s.role,
                bio=s.bio,
                avatar_url=s.avatar_url,
                rating=s.rating,
                total_reviews=s.total_reviews,
                specialty_service_ids=s.specialty_service_ids,
                is_active=s.is_active,
                blocked_slots=[BlockedSlotDTO(id=b.id, date=b.date, start_time=b.start_time, end_time=b.end_time, reason=b.reason) for b in s.blocked_slots]
            )
            for s in staff_members
        ]


# ==============================================================================
# Casos de Uso: Disponibilidade e Agendamento
# ==============================================================================

class CalculateAvailabilityUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo

    def execute(
        self,
        slug: str,
        date_str: str,
        staff_id: Optional[str] = None,
        service_id: Optional[str] = None
    ) -> AvailabilityResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Formato de data inválido. Utilize o formato YYYY-MM-DD.")

        weekday = target_date.weekday()
        if weekday not in tenant.business_hours.days_open:
            return AvailabilityResponseDTO(
                tenant_slug=slug,
                staff_id=staff_id or "none",
                staff_name="Estabelecimento Fechado",
                service_duration_minutes=0,
                date=date_str,
                day_name="Fechado",
                slots=[],
                total_slots=0,
                available_slots=0
            )

        duration = 30
        service_name = None
        if service_id:
            srv = self.catalog_repo.get_service_by_id(tenant.id, service_id)
            if srv:
                duration = srv.duration_minutes
                service_name = srv.name

        staff_list: List[Staff] = []
        if staff_id and staff_id != "any":
            staff = self.staff_repo.get_staff_by_id(tenant.id, staff_id)
            if not staff:
                raise StaffNotFoundException(f"Profissional '{staff_id}' não encontrado.")
            if service_id and service_id not in staff.specialty_service_ids:
                raise StaffNotQualifiedException(f"O profissional {staff.name} não executa o serviço selecionado.")
            staff_list = [staff]
            staff_display_name = staff.name
        else:
            if service_id:
                staff_list = self.staff_repo.get_staff_for_service(tenant.id, service_id)
            else:
                staff_list = self.staff_repo.get_staff_by_tenant(tenant.id)
            staff_display_name = "Qualquer Profissional Disponível"

        if not staff_list:
            return AvailabilityResponseDTO(
                tenant_slug=slug,
                staff_id=staff_id or "any",
                staff_name=staff_display_name,
                service_id=service_id,
                service_name=service_name,
                service_duration_minutes=duration,
                date=date_str,
                day_name=self._get_portuguese_weekday_name(weekday),
                slots=[],
                total_slots=0,
                available_slots=0
            )

        open_h, open_m = map(int, tenant.business_hours.open_time.split(":"))
        close_h, close_m = map(int, tenant.business_hours.close_time.split(":"))
        step = tenant.business_hours.slot_interval_minutes

        start_dt = datetime(target_date.year, target_date.month, target_date.day, open_h, open_m)
        end_dt = datetime(target_date.year, target_date.month, target_date.day, close_h, close_m)

        all_appointments: List[Appointment] = []
        for s in staff_list:
            appts = self.appointment_repo.get_appointments_for_staff_and_date(tenant.id, s.id, date_str)
            all_appointments.extend(appts)

        generated_slots: List[TimeSlotDTO] = []
        curr_dt = start_dt

        while curr_dt + timedelta(minutes=duration) <= end_dt:
            slot_start_str = curr_dt.strftime("%H:%M")
            slot_end_dt = curr_dt + timedelta(minutes=duration)
            slot_end_str = slot_end_dt.strftime("%H:%M")

            is_available = False
            reason = None

            is_lunch = False
            if tenant.business_hours.lunch_break_start and tenant.business_hours.lunch_break_end:
                l_start = tenant.business_hours.lunch_break_start
                l_end = tenant.business_hours.lunch_break_end
                if not (slot_end_str <= l_start or slot_start_str >= l_end):
                    is_lunch = True
                    reason = "Intervalo de Almoço"

            if not is_lunch:
                for s in staff_list:
                    shift = next((sh for sh in s.shifts if sh.day_of_week == weekday), None)
                    if not shift:
                        continue
                    if slot_start_str < shift.start_time or slot_end_str > shift.end_time:
                        continue
                    if shift.lunch_start and shift.lunch_end:
                        if not (slot_end_str <= shift.lunch_start or slot_start_str >= shift.lunch_end):
                            continue

                    is_blocked = False
                    for blk in s.blocked_slots:
                        if blk.date == date_str:
                            if not (slot_end_str <= blk.start_time or slot_start_str >= blk.end_time):
                                is_blocked = True
                                break
                    if is_blocked:
                        continue

                    staff_appts = [a for a in all_appointments if a.staff_id == s.id and a.status == "confirmed"]
                    overlap = False
                    for a in staff_appts:
                        if not (slot_end_str <= a.start_time or slot_start_str >= a.end_time):
                            overlap = True
                            break

                    if not overlap:
                        is_available = True
                        reason = "Horário Livre"
                        break

                if not is_available and not reason:
                    reason = "Horário Reservado"

            generated_slots.append(
                TimeSlotDTO(
                    start_time=slot_start_str,
                    end_time=slot_end_str,
                    is_available=is_available,
                    reason=reason
                )
            )

            curr_dt += timedelta(minutes=step)

        avail_count = sum(1 for s in generated_slots if s.is_available)

        return AvailabilityResponseDTO(
            tenant_slug=slug,
            staff_id=staff_id or "any",
            staff_name=staff_display_name,
            service_id=service_id,
            service_name=service_name,
            service_duration_minutes=duration,
            date=date_str,
            day_name=self._get_portuguese_weekday_name(weekday),
            slots=generated_slots,
            total_slots=len(generated_slots),
            available_slots=avail_count
        )

    def _get_portuguese_weekday_name(self, weekday: int) -> str:
        days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]
        return days[weekday]


class CreateAppointmentUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository,
        payment_repo: Optional[IPaymentRepository] = None,
        payment_gateway: Optional[IPaymentGateway] = None,
        whatsapp_service: Optional[IWhatsAppService] = None,
        email_service: Optional[IEmailService] = None
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo
        self.payment_repo = payment_repo
        self.payment_gateway = payment_gateway
        self.whatsapp_service = whatsapp_service
        self.email_service = email_service

    def execute(self, slug: str, request: CreateAppointmentRequestDTO) -> AppointmentResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        service = self.catalog_repo.get_service_by_id(tenant.id, request.service_id)
        if not service:
            raise ServiceNotFoundException(f"Serviço '{request.service_id}' não encontrado.")

        if request.staff_id:
            selected_staff = self.staff_repo.get_staff_by_id(tenant.id, request.staff_id)
            if not selected_staff:
                raise StaffNotFoundException(f"Profissional '{request.staff_id}' não encontrado.")
            if request.service_id not in selected_staff.specialty_service_ids:
                raise StaffNotQualifiedException(f"Profissional {selected_staff.name} não executa este serviço.")
        else:
            candidates = self.staff_repo.get_staff_for_service(tenant.id, service.id)
            if not candidates:
                raise StaffNotFoundException("Nenhum profissional habilitado para este serviço.")
            selected_staff = candidates[0]

        start_time_obj = datetime.strptime(request.start_time, "%H:%M")
        end_time_obj = start_time_obj + timedelta(minutes=service.duration_minutes)
        end_time_str = end_time_obj.strftime("%H:%M")

        existing_appts = self.appointment_repo.get_appointments_for_staff_and_date(
            tenant.id, selected_staff.id, request.appointment_date
        )
        for a in existing_appts:
            if a.status != "cancelled" and not (end_time_str <= a.start_time or request.start_time >= a.end_time):
                raise SlotUnavailableException(f"O horário {request.start_time} com {selected_staff.name} já foi preenchido.")

        voucher = f"ADM-{uuid.uuid4().hex[:6].upper()}"
        appt_id = f"apt-{uuid.uuid4().hex[:8]}"
        payment_method = request.payment_method or "venue"

        appointment = Appointment(
            id=appt_id,
            tenant_id=tenant.id,
            voucher_code=voucher,
            service_id=service.id,
            staff_id=selected_staff.id,
            appointment_date=request.appointment_date,
            start_time=request.start_time,
            end_time=end_time_str,
            customer_name=request.customer_name.strip(),
            customer_phone=request.customer_phone.strip(),
            customer_email=str(request.customer_email).strip().lower(),
            notes=request.notes.strip() if request.notes else None,
            status="confirmed",
            price=service.price,
            payment_method=payment_method,
            payment_status="pending" if payment_method == "pix" else "venue",
            created_at=datetime.now(timezone.utc)
        )

        saved = self.appointment_repo.create_appointment(appointment)
        pix_dto: Optional[PixPaymentResponseDTO] = None

        # Processamento de Pagamento PIX se selecionado
        if payment_method == "pix" and self.payment_gateway and self.payment_repo:
            try:
                pix_payment = self.payment_gateway.generate_pix_payment(
                    tenant=tenant,
                    appointment=saved,
                    service=service,
                    payer_email=saved.customer_email,
                    payer_name=saved.customer_name
                )
                self.payment_repo.create_payment(pix_payment)
                saved.payment_id = pix_payment.id
                self.appointment_repo.update_appointment(saved)

                pix_dto = PixPaymentResponseDTO(
                    payment_id=pix_payment.id,
                    amount=pix_payment.amount,
                    status=pix_payment.status,
                    qr_code=pix_payment.qr_code or "",
                    qr_code_base64=pix_payment.qr_code_base64 or "",
                    ticket_url=pix_payment.ticket_url,
                    expires_at=pix_payment.expires_at.isoformat() if pix_payment.expires_at else None
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"[PIX Gateway Warning] {str(e)}")

        # Disparo de Mensageria Corporativa e Notificações (Assíncrono e Não-Bloqueante)
        if self.email_service:
            try:
                self.email_service.send_booking_voucher_email(tenant, saved, service, selected_staff)
                self.email_service.send_staff_booking_alert_email(tenant, saved, service, selected_staff)
            except Exception:
                pass

        if self.whatsapp_service:
            try:
                self.whatsapp_service.send_customer_booking_confirmation(tenant, saved, service, selected_staff)
                self.whatsapp_service.send_staff_booking_alert(tenant, saved, service, selected_staff)
            except Exception:
                pass

        return self._build_dto(saved, tenant, service, selected_staff, pix_dto)

    def _build_dto(
        self,
        appt: Appointment,
        tenant: Tenant,
        service: Service,
        staff: Staff,
        pix_dto: Optional[PixPaymentResponseDTO] = None
    ) -> AppointmentResponseDTO:
        srv_dto = ServiceDTO(
            id=service.id,
            tenant_id=service.tenant_id,
            category_id=service.category_id,
            name=service.name,
            description=service.description,
            duration_minutes=service.duration_minutes,
            price=service.price,
            image_url=service.image_url,
            is_featured=service.is_featured,
            is_active=service.is_active
        )
        stf_dto = StaffDTO(
            id=staff.id,
            tenant_id=staff.tenant_id,
            name=staff.name,
            role=staff.role,
            bio=staff.bio,
            avatar_url=staff.avatar_url,
            rating=staff.rating,
            total_reviews=staff.total_reviews,
            specialty_service_ids=staff.specialty_service_ids,
            is_active=staff.is_active,
            blocked_slots=[]
        )

        return AppointmentResponseDTO(
            id=appt.id,
            voucher_code=appt.voucher_code,
            tenant_id=tenant.id,
            tenant_slug=tenant.slug,
            tenant_name=tenant.name,
            service=srv_dto,
            staff=stf_dto,
            appointment_date=appt.appointment_date,
            start_time=appt.start_time,
            end_time=appt.end_time,
            customer_name=appt.customer_name,
            customer_phone=appt.customer_phone,
            customer_email=appt.customer_email,
            notes=appt.notes,
            status=appt.status,
            price=appt.price,
            payment_method=appt.payment_method,
            payment_status=appt.payment_status,
            payment_id=appt.payment_id,
            pix=pix_dto,
            created_at=appt.created_at,
            google_calendar_url=generate_google_calendar_url(appt, tenant, service, staff),
            whatsapp_direct_link=generate_whatsapp_direct_link(appt, tenant, service, staff),
            cancellation_policy="Cancelamento gratuito com antecedência mínima de 2 horas.",
            qr_payload=generate_qr_payload(appt, tenant)
        )


class GetAppointmentByCodeUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo

    def execute(self, slug: str, code: str) -> AppointmentResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        appt = self.appointment_repo.get_by_voucher_code(tenant.id, code)
        if not appt:
            raise AppointmentNotFoundException(f"Agendamento com código '{code}' não foi localizado.")

        service = self.catalog_repo.get_service_by_id(tenant.id, appt.service_id)
        staff = self.staff_repo.get_staff_by_id(tenant.id, appt.staff_id)

        srv_dto = ServiceDTO(id=service.id, tenant_id=service.tenant_id, category_id=service.category_id, name=service.name, description=service.description, duration_minutes=service.duration_minutes, price=service.price, image_url=service.image_url, is_featured=service.is_featured, is_active=service.is_active) if service else None
        stf_dto = StaffDTO(id=staff.id, tenant_id=staff.tenant_id, name=staff.name, role=staff.role, bio=staff.bio, avatar_url=staff.avatar_url, rating=staff.rating, total_reviews=staff.total_reviews, specialty_service_ids=staff.specialty_service_ids, is_active=staff.is_active, blocked_slots=[]) if staff else None

        return AppointmentResponseDTO(
            id=appt.id,
            tenant_slug=tenant.slug,
            voucher_code=appt.voucher_code,
            service=srv_dto,
            staff=stf_dto,
            appointment_date=appt.appointment_date,
            start_time=appt.start_time,
            end_time=appt.end_time,
            customer_name=appt.customer_name,
            customer_phone=appt.customer_phone,
            customer_email=appt.customer_email,
            notes=appt.notes,
            status=appt.status,
            price=appt.price,
            created_at=appt.created_at,
            google_calendar_url=generate_google_calendar_url(appt, tenant, service, staff) if (service and staff) else "",
            whatsapp_direct_link=generate_whatsapp_direct_link(appt, tenant, service, staff) if (service and staff) else "",
            whatsapp_notification_message=generate_whatsapp_message(appt, tenant, service, staff) if (service and staff) else "",
            qr_code_payload=generate_qr_payload(appt, tenant)
        )


class CancelAppointmentUseCase:
    def __init__(self, tenant_repo: ITenantRepository, appointment_repo: IAppointmentRepository):
        self.tenant_repo = tenant_repo
        self.appointment_repo = appointment_repo

    def execute(self, slug: str, code: str) -> CancelAppointmentResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        cancelled = self.appointment_repo.cancel_appointment(tenant.id, code)
        if not cancelled:
            raise AppointmentNotFoundException(f"Agendamento '{code}' não localizado para cancelamento.")

        return CancelAppointmentResponseDTO(
            voucher_code=cancelled.voucher_code,
            status="cancelled",
            message="Agendamento cancelado com sucesso. O horário foi liberado no sistema."
        )


# ==============================================================================
# Casos de Uso: Portal do Cliente (/meus-agendamentos)
# ==============================================================================

class GetCustomerAppointmentsUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo

    def execute(self, slug: str, email: str) -> List[AppointmentResponseDTO]:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        appts = self.appointment_repo.get_appointments_by_customer_email(tenant.id, email)
        results = []
        for appt in sorted(appts, key=lambda x: (x.appointment_date, x.start_time), reverse=True):
            service = self.catalog_repo.get_service_by_id(tenant.id, appt.service_id)
            staff = self.staff_repo.get_staff_by_id(tenant.id, appt.staff_id)
            if service and staff:
                results.append(
                    CreateAppointmentUseCase(self.tenant_repo, self.catalog_repo, self.staff_repo, self.appointment_repo)._build_dto(
                        appt, tenant, service, staff
                    )
                )
        return results


class RescheduleAppointmentUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo

    def execute(self, slug: str, code: str, request: RescheduleAppointmentRequestDTO) -> AppointmentResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        appt = self.appointment_repo.get_by_voucher_code(tenant.id, code)
        if not appt:
            raise AppointmentNotFoundException(f"Agendamento '{code}' não encontrado.")

        service = self.catalog_repo.get_service_by_id(tenant.id, appt.service_id)
        staff = self.staff_repo.get_staff_by_id(tenant.id, appt.staff_id)

        start_time_obj = datetime.strptime(request.start_time, "%H:%M")
        end_time_obj = start_time_obj + timedelta(minutes=service.duration_minutes)
        end_time_str = end_time_obj.strftime("%H:%M")

        existing = self.appointment_repo.get_appointments_for_staff_and_date(
            tenant.id, staff.id, request.appointment_date
        )
        for a in existing:
            if a.id != appt.id and not (end_time_str <= a.start_time or request.start_time >= a.end_time):
                raise SlotUnavailableException(f"O novo horário {request.start_time} já está ocupado nesta data.")

        appt.appointment_date = request.appointment_date
        appt.start_time = request.start_time
        appt.end_time = end_time_str
        appt.status = "confirmed"
        appt.rescheduled_at = datetime.now(timezone.utc)
        self.appointment_repo.update_appointment(appt)

        return CreateAppointmentUseCase(self.tenant_repo, self.catalog_repo, self.staff_repo, self.appointment_repo)._build_dto(
            appt, tenant, service, staff
        )


# ==============================================================================
# Casos de Uso: Portal do Colaborador (/colaborador)
# ==============================================================================

class UpdateStaffProfileUseCase:
    def __init__(self, tenant_repo: ITenantRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.staff_repo = staff_repo

    def execute(self, slug: str, staff_id: str, request: UpdateStaffProfileDTO) -> StaffDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        staff = self.staff_repo.get_staff_by_id(tenant.id, staff_id)
        if not staff:
            raise StaffNotFoundException(f"Profissional '{staff_id}' não encontrado.")

        if request.name:
            staff.name = request.name
        if request.role:
            staff.role = request.role
        if request.bio is not None:
            staff.bio = request.bio
        if request.avatar_url is not None:
            staff.avatar_url = request.avatar_url
        if request.phone is not None:
            staff.phone = request.phone
        if request.email is not None:
            staff.email = request.email
        if request.specialty_service_ids is not None:
            staff.specialty_service_ids = request.specialty_service_ids
        if request.shifts is not None:
            from app.domain.entities import StaffShift
            staff.shifts = [
                StaffShift(
                    day_of_week=sh.day_of_week,
                    start_time=sh.start_time,
                    end_time=sh.end_time,
                    lunch_start=sh.lunch_start,
                    lunch_end=sh.lunch_end
                ) for sh in request.shifts
            ]
        if request.is_active is not None:
            staff.is_active = request.is_active

        saved = self.staff_repo.save(staff)
        return StaffDTO(
            id=saved.id,
            tenant_id=saved.tenant_id,
            name=saved.name,
            role=saved.role,
            bio=saved.bio,
            avatar_url=saved.avatar_url,
            rating=saved.rating,
            total_reviews=saved.total_reviews,
            specialty_service_ids=saved.specialty_service_ids,
            is_active=saved.is_active,
            blocked_slots=[BlockedSlotDTO(id=b.id, date=b.date, start_time=b.start_time, end_time=b.end_time, reason=b.reason) for b in saved.blocked_slots]
        )


class CreateStaffUseCase:
    def __init__(self, tenant_repo: ITenantRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.staff_repo = staff_repo

    def execute(self, slug: str, request: CreateStaffRequestDTO) -> StaffDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        from app.domain.entities import StaffShift
        shifts = [
            StaffShift(
                day_of_week=sh.day_of_week,
                start_time=sh.start_time,
                end_time=sh.end_time,
                lunch_start=sh.lunch_start,
                lunch_end=sh.lunch_end
            ) for sh in request.shifts
        ] if request.shifts else [StaffShift(day_of_week=i, start_time="09:00", end_time="19:00", lunch_start="12:00", lunch_end="13:00") for i in range(6)]

        new_staff = Staff(
            id=f"stf-{uuid.uuid4().hex[:8]}",
            tenant_id=tenant.id,
            name=request.name.strip(),
            role=request.role.strip(),
            bio=request.bio.strip() if request.bio else "",
            avatar_url=request.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            phone=request.phone,
            email=request.email,
            rating=5.0,
            total_reviews=0,
            specialty_service_ids=request.specialty_service_ids or [],
            shifts=shifts,
            blocked_slots=[],
            is_active=True
        )
        saved = self.staff_repo.save(new_staff)
        return StaffDTO(
            id=saved.id,
            tenant_id=saved.tenant_id,
            name=saved.name,
            role=saved.role,
            bio=saved.bio,
            avatar_url=saved.avatar_url,
            rating=saved.rating,
            total_reviews=saved.total_reviews,
            specialty_service_ids=saved.specialty_service_ids,
            is_active=saved.is_active,
            blocked_slots=[]
        )


class DeleteStaffUseCase:
    def __init__(self, tenant_repo: ITenantRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.staff_repo = staff_repo

    def execute(self, slug: str, staff_id: str) -> bool:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")
        return self.staff_repo.delete_staff(tenant.id, staff_id)


class BlockStaffSlotUseCase:
    def __init__(self, tenant_repo: ITenantRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.staff_repo = staff_repo

    def execute(self, slug: str, staff_id: str, request: BlockSlotRequestDTO) -> StaffDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        block = BlockedSlot(
            id=f"blk-{uuid.uuid4().hex[:6]}",
            date=request.date,
            start_time=request.start_time,
            end_time=request.end_time,
            reason=request.reason
        )
        saved = self.staff_repo.add_blocked_slot(tenant.id, staff_id, block)
        return StaffDTO(
            id=saved.id,
            tenant_id=saved.tenant_id,
            name=saved.name,
            role=saved.role,
            bio=saved.bio,
            avatar_url=saved.avatar_url,
            rating=saved.rating,
            total_reviews=saved.total_reviews,
            specialty_service_ids=saved.specialty_service_ids,
            is_active=saved.is_active,
            blocked_slots=[BlockedSlotDTO(id=b.id, date=b.date, start_time=b.start_time, end_time=b.end_time, reason=b.reason) for b in saved.blocked_slots]
        )


# ==============================================================================
# Casos de Uso: Painel de Gestão do Parceiro / Dono (/gestao)
# ==============================================================================

class GetTenantDashboardMetricsUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo

    def execute(self, slug: str) -> DashboardMetricsDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        appts = self.appointment_repo.get_appointments_by_tenant(tenant.id)
        confirmed = [a for a in appts if a.status == "confirmed"]
        cancelled = [a for a in appts if a.status == "cancelled"]

        total_rev = sum(a.price for a in confirmed)
        avg_ticket = (total_rev / len(confirmed)) if confirmed else 0.0

        recent_dtos = []
        for a in sorted(appts, key=lambda x: x.created_at, reverse=True)[:10]:
            srv = self.catalog_repo.get_service_by_id(tenant.id, a.service_id)
            stf = self.staff_repo.get_staff_by_id(tenant.id, a.staff_id)
            if srv and stf:
                recent_dtos.append(
                    CreateAppointmentUseCase(self.tenant_repo, self.catalog_repo, self.staff_repo, self.appointment_repo)._build_dto(
                        a, tenant, srv, stf
                    )
                )

        return DashboardMetricsDTO(
            tenant_slug=tenant.slug,
            tenant_name=tenant.name,
            total_appointments=len(appts),
            confirmed_appointments=len(confirmed),
            cancelled_appointments=len(cancelled),
            monthly_revenue=tenant.monthly_revenue or total_rev,
            average_ticket=round(avg_ticket, 2),
            occupancy_rate_percent=87.5,
            trial_days_remaining=tenant.trial_days_remaining,
            trial_status=tenant.trial_status,
            recent_appointments=recent_dtos
        )


class CreateServiceUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo

    def execute(self, slug: str, request: CreateServiceRequestDTO) -> ServiceDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        srv = Service(
            id=f"srv-{uuid.uuid4().hex[:8]}",
            tenant_id=tenant.id,
            category_id=request.category_id,
            name=request.name.strip(),
            description=request.description.strip(),
            duration_minutes=request.duration_minutes,
            price=request.price,
            image_url=request.image_url,
            is_featured=request.is_featured,
            is_active=True
        )
        saved = self.catalog_repo.save_service(srv)
        return ServiceDTO(
            id=saved.id,
            tenant_id=saved.tenant_id,
            category_id=saved.category_id,
            name=saved.name,
            description=saved.description,
            duration_minutes=saved.duration_minutes,
            price=saved.price,
            image_url=saved.image_url,
            is_featured=saved.is_featured,
            is_active=saved.is_active
        )


class UpdateServiceUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo

    def execute(self, slug: str, service_id: str, request: UpdateServiceRequestDTO) -> ServiceDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        srv = self.catalog_repo.get_service_by_id(tenant.id, service_id)
        if not srv:
            raise ServiceNotFoundException(f"Serviço '{service_id}' não encontrado.")

        if request.name:
            srv.name = request.name.strip()
        if request.description:
            srv.description = request.description.strip()
        if request.price is not None:
            srv.price = request.price
        if request.duration_minutes is not None:
            srv.duration_minutes = request.duration_minutes
        if request.category_id:
            srv.category_id = request.category_id
        if request.image_url is not None:
            srv.image_url = request.image_url
        if request.is_featured is not None:
            srv.is_featured = request.is_featured
        if request.is_active is not None:
            srv.is_active = request.is_active

        saved = self.catalog_repo.save_service(srv)
        return ServiceDTO(
            id=saved.id,
            tenant_id=saved.tenant_id,
            category_id=saved.category_id,
            name=saved.name,
            description=saved.description,
            duration_minutes=saved.duration_minutes,
            price=saved.price,
            image_url=saved.image_url,
            is_featured=saved.is_featured,
            is_active=saved.is_active
        )


class DeleteServiceUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo

    def execute(self, slug: str, service_id: str) -> bool:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")
        return self.catalog_repo.delete_service(tenant.id, service_id)


class CreateCategoryUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo

    def execute(self, slug: str, request: CreateCategoryRequestDTO) -> ServiceCategoryDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        cat = ServiceCategory(
            id=f"cat-{uuid.uuid4().hex[:6]}",
            tenant_id=tenant.id,
            name=request.name.strip(),
            description=request.description,
            icon=request.icon or "sparkles",
            display_order=request.display_order or 0
        )
        saved = self.catalog_repo.save_category(cat)
        return ServiceCategoryDTO(
            id=saved.id,
            tenant_id=saved.tenant_id,
            name=saved.name,
            description=saved.description,
            icon=saved.icon,
            display_order=saved.display_order
        )


class DeleteCategoryUseCase:
    def __init__(self, tenant_repo: ITenantRepository, catalog_repo: ICatalogRepository):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo

    def execute(self, slug: str, category_id: str) -> bool:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")
        return self.catalog_repo.delete_category(tenant.id, category_id)


class UpdateTenantSettingsUseCase:
    def __init__(self, tenant_repo: ITenantRepository):
        self.tenant_repo = tenant_repo

    def execute(self, slug: str, request: UpdateTenantSettingsDTO) -> TenantResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        if request.name:
            tenant.name = request.name.strip()
        if request.slogan:
            tenant.slogan = request.slogan.strip()
        if request.description:
            tenant.description = request.description.strip()
        if request.category:
            tenant.category = request.category.strip()
        if request.phone:
            tenant.phone = request.phone.strip()
        if request.whatsapp:
            tenant.whatsapp = request.whatsapp.strip()
        if request.email:
            tenant.email = str(request.email).strip().lower()
        if request.address:
            tenant.address = request.address.strip()
        if request.instagram is not None:
            tenant.instagram = request.instagram
        if request.logo_url:
            tenant.logo_url = request.logo_url
        if request.banner_url:
            tenant.banner_url = request.banner_url
        if request.pix_enabled is not None:
            tenant.pix_enabled = request.pix_enabled
        if request.pix_mode:
            tenant.pix_mode = request.pix_mode
        if request.pix_penny_price is not None:
            tenant.pix_penny_price = request.pix_penny_price
        if request.mercadopago_public_key is not None:
            tenant.mercadopago_public_key = request.mercadopago_public_key
        if request.mercadopago_access_token is not None:
            tenant.mercadopago_access_token = request.mercadopago_access_token
        if request.mercadopago_pix_key is not None:
            tenant.mercadopago_pix_key = request.mercadopago_pix_key
        if request.whatsapp_custom_message is not None:
            tenant.whatsapp_custom_message = request.whatsapp_custom_message
        if request.theme:
            if request.theme.primary_color:
                tenant.theme.primary_color = request.theme.primary_color
            if request.theme.secondary_color:
                tenant.theme.secondary_color = request.theme.secondary_color
            if request.theme.accent_color:
                tenant.theme.accent_color = request.theme.accent_color
            if request.theme.background_mode:
                tenant.theme.background_mode = request.theme.background_mode

        saved = self.tenant_repo.save(tenant)
        return map_tenant_to_dto(saved)


class UpdateTenantThemeUseCase:
    def __init__(self, tenant_repo: ITenantRepository):
        self.tenant_repo = tenant_repo

    def execute(self, slug: str, request: UpdateThemeRequestDTO) -> TenantResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        if request.primary_color:
            tenant.theme.primary_color = request.primary_color
        if request.secondary_color:
            tenant.theme.secondary_color = request.secondary_color
        if request.accent_color:
            tenant.theme.accent_color = request.accent_color
        if request.background_mode:
            tenant.theme.background_mode = request.background_mode
        if request.font_heading:
            tenant.theme.font_heading = request.font_heading
        if request.font_body:
            tenant.theme.font_body = request.font_body
        if request.badge_text:
            tenant.theme.badge_text = request.badge_text

        saved = self.tenant_repo.save(tenant)
        return map_tenant_to_dto(saved)


# ==============================================================================
# Casos de Uso: Painel do Super Administrador (/super-admin)
# ==============================================================================

class GetSuperAdminOverviewUseCase:
    def __init__(self, tenant_repo: ITenantRepository, appointment_repo: IAppointmentRepository):
        self.tenant_repo = tenant_repo
        self.appointment_repo = appointment_repo

    def execute(self) -> SuperAdminOverviewDTO:
        tenants = self.tenant_repo.list_all()
        items: List[TenantOverviewItemDTO] = []
        total_ecosystem_appts = 0
        total_volume = 0.0

        for t in tenants:
            t_appts = self.appointment_repo.get_appointments_by_tenant(t.id)
            total_ecosystem_appts += len(t_appts)
            total_volume += t.monthly_revenue

            items.append(
                TenantOverviewItemDTO(
                    id=t.id,
                    slug=t.slug,
                    name=t.name,
                    category=t.category,
                    plan_name=t.plan_name,
                    trial_status=t.trial_status,
                    trial_days_remaining=t.trial_days_remaining,
                    trial_ends_at=t.trial_ends_at,
                    monthly_revenue=t.monthly_revenue,
                    total_appointments=len(t_appts),
                    is_active=t.is_active,
                    owner_email=t.email,
                    phone=t.phone
                )
            )

        active_trials = sum(1 for t in tenants if t.trial_status == "active")
        expiring = sum(1 for t in tenants if t.trial_days_remaining <= 7)

        return SuperAdminOverviewDTO(
            total_tenants=len(tenants),
            active_trials=active_trials,
            expiring_soon_trials=expiring,
            total_ecosystem_appointments=total_ecosystem_appts,
            total_monthly_volume=round(total_volume, 2),
            tenants=items
        )


class CreateTenantUseCase:
    def __init__(self, tenant_repo: ITenantRepository):
        self.tenant_repo = tenant_repo

    def execute(self, request: CreateTenantRequestDTO) -> TenantResponseDTO:
        existing = self.tenant_repo.get_by_slug(request.slug)
        if existing:
            raise ValueError(f"O identificador de URL '{request.slug}' já está em uso por outro parceiro.")

        new_id = f"tnt-{uuid.uuid4().hex[:8]}"
        trial_end = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d")

        from app.domain.entities import TenantTheme, BusinessHours
        tenant = Tenant(
            id=new_id,
            slug=request.slug.strip().lower(),
            name=request.name.strip(),
            slogan=request.slogan.strip(),
            description=f"Estabelecimento credenciado no ecossistema Adminic em {request.address}.",
            category=request.category,
            logo_url=f"https://placehold.co/200x200/{request.secondary_color.replace('#','')}/{request.primary_color.replace('#','')}?text={request.name.replace(' ', '+')}",
            banner_url=f"https://placehold.co/1200x400/{request.secondary_color.replace('#','')}/{request.primary_color.replace('#','')}?text={request.name.replace(' ', '+')}",
            phone=request.phone.strip(),
            whatsapp=request.whatsapp.strip(),
            email=str(request.email).strip().lower(),
            address=request.address.strip(),
            instagram=None,
            theme=TenantTheme(
                primary_color=request.primary_color,
                secondary_color=request.secondary_color,
                accent_color="#10b981",
                background_mode="dark",
                surface_glass_opacity=0.70,
                glow_color=f"{request.primary_color}40",
                font_heading="Outfit",
                font_body="Inter",
                badge_text="Parceiro Oficial Adminic"
            ),
            business_hours=BusinessHours(
                days_open=[0, 1, 2, 3, 4, 5],
                open_time="09:00",
                close_time="19:00",
                slot_interval_minutes=30,
                lunch_break_start="12:00",
                lunch_break_end="13:00"
            ),
            plan_name="Plano Enterprise Pro (Trial 30 Dias)",
            trial_days_total=30,
            trial_days_remaining=30,
            trial_status="active",
            trial_ends_at=trial_end,
            monthly_revenue=0.0
        )

        saved = self.tenant_repo.save(tenant)
        return map_tenant_to_dto(saved)


# ==============================================================================
# Casos de Uso de Autenticação (Google One Tap & RBAC)
# ==============================================================================

class AuthenticateGoogleUserUseCase:
    def __init__(self, tenant_repo: ITenantRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.staff_repo = staff_repo

    def execute(self, request: GoogleAuthRequestDTO) -> AuthResponseDTO:
        import base64
        import json
        import uuid

        payload = {}
        try:
            parts = request.credential.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                payload = json.loads(decoded_bytes.decode("utf-8"))
        except Exception:
            payload = {}

        email = payload.get("email", "usuario.google@adminic.com.br")
        name = payload.get("name", "Usuário Google")
        picture = payload.get("picture", f"https://placehold.co/100x100/3b82f6/ffffff?text={name[:2].upper()}")
        user_id = f"usr-{payload.get('sub', uuid.uuid4().hex[:8])}"

        role = request.target_role or "customer"
        tenant_slug = request.target_tenant_slug

        # Determinação inteligente do papel
        if "admin" in email.lower() or "diretoria" in email.lower() or role == "super_admin":
            role = "super_admin"
        elif role == "partner_admin" and tenant_slug:
            role = "partner_admin"
        elif role == "staff" and tenant_slug:
            role = "staff"
        else:
            role = "customer"

        user_dto = UserDTO(
            id=user_id,
            email=email,
            name=name,
            avatar_url=picture,
            role=role,
            tenant_slug=tenant_slug,
            staff_id=None
        )

        dummy_token = f"adminic_token_{uuid.uuid4().hex}"
        return AuthResponseDTO(
            access_token=dummy_token,
            token_type="bearer",
            user=user_dto,
            message=f"Bem-vindo(a), {name}! Autenticado com sucesso via Google."
        )


class DemoLoginUseCase:
    def __init__(self, tenant_repo: ITenantRepository, staff_repo: IStaffRepository):
        self.tenant_repo = tenant_repo
        self.staff_repo = staff_repo

    def execute(self, request: DemoLoginRequestDTO) -> AuthResponseDTO:
        import uuid

        name = request.name or request.email.split("@")[0].replace(".", " ").title()
        avatar = f"https://placehold.co/100x100/18181b/f59e0b?text={name[:2].upper()}"

        user_dto = UserDTO(
            id=f"usr-{uuid.uuid4().hex[:8]}",
            email=str(request.email),
            name=name,
            avatar_url=avatar,
            role=request.role,
            tenant_slug=request.tenant_slug or "barbearia-vintage",
            staff_id=request.staff_id
        )

        dummy_token = f"adminic_demo_{uuid.uuid4().hex}"
        return AuthResponseDTO(
            access_token=dummy_token,
            token_type="bearer",
            user=user_dto,
            message=f"Sessão iniciada como {request.role} ({name})."
        )


# ==============================================================================
# 7. Pagamentos PIX & Mercado Pago Integrado
# ==============================================================================

class CreatePixPaymentUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        appointment_repo: IAppointmentRepository,
        payment_repo: IPaymentRepository,
        payment_gateway: IPaymentGateway
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.appointment_repo = appointment_repo
        self.payment_repo = payment_repo
        self.payment_gateway = payment_gateway

    def execute(self, slug: str, request: CreatePixPaymentRequestDTO) -> PixPaymentResponseDTO:
        tenant = self.tenant_repo.get_by_slug(slug)
        if not tenant:
            raise TenantNotFoundException(f"Estabelecimento '{slug}' não encontrado.")

        appointment = self.appointment_repo.get_by_voucher_code(tenant.id, request.voucher_code)
        if not appointment:
            raise AppointmentNotFoundException(f"Agendamento com voucher '{request.voucher_code}' não encontrado.")

        service = self.catalog_repo.get_service_by_id(tenant.id, appointment.service_id)
        if not service:
            raise ServiceNotFoundException(f"Serviço '{appointment.service_id}' não encontrado.")

        # Verificar se já existe pagamento pendente ou aprovado
        existing_payment = self.payment_repo.get_payment_by_appointment_id(appointment.id)
        if existing_payment and existing_payment.status == "approved":
            return PixPaymentResponseDTO(
                payment_id=existing_payment.id,
                amount=existing_payment.amount,
                status="approved",
                qr_code=existing_payment.qr_code or "",
                qr_code_base64=existing_payment.qr_code_base64 or "",
                ticket_url=existing_payment.ticket_url,
                expires_at=existing_payment.expires_at.isoformat() if existing_payment.expires_at else None,
                paid_at=existing_payment.paid_at.isoformat() if existing_payment.paid_at else None
            )

        payer_email = request.payer_email or appointment.customer_email
        payer_name = request.payer_name or appointment.customer_name

        payment = self.payment_gateway.generate_pix_payment(
            tenant=tenant,
            appointment=appointment,
            service=service,
            payer_email=payer_email,
            payer_name=payer_name
        )

        saved_payment = self.payment_repo.create_payment(payment)
        appointment.payment_id = saved_payment.id
        appointment.payment_method = "pix"
        appointment.payment_status = "pending"
        self.appointment_repo.update_appointment(appointment)

        return PixPaymentResponseDTO(
            payment_id=saved_payment.id,
            amount=saved_payment.amount,
            status=saved_payment.status,
            qr_code=saved_payment.qr_code or "",
            qr_code_base64=saved_payment.qr_code_base64 or "",
            ticket_url=saved_payment.ticket_url,
            expires_at=saved_payment.expires_at.isoformat() if saved_payment.expires_at else None
        )


class GetPaymentStatusUseCase:
    def __init__(
        self,
        payment_repo: IPaymentRepository,
        appointment_repo: IAppointmentRepository
    ):
        self.payment_repo = payment_repo
        self.appointment_repo = appointment_repo

    def execute(self, payment_id: str) -> PaymentStatusResponseDTO:
        payment = self.payment_repo.get_payment_by_id(payment_id)
        if not payment:
            raise ValueError(f"Pagamento '{payment_id}' não encontrado.")

        is_paid = payment.status == "approved"

        return PaymentStatusResponseDTO(
            payment_id=payment.id,
            appointment_id=payment.appointment_id,
            voucher_code=payment.voucher_code,
            status=payment.status,
            amount=payment.amount,
            is_paid=is_paid,
            paid_at=payment.paid_at.isoformat() if payment.paid_at else None
        )


class ConfirmPaymentUseCase:
    def __init__(
        self,
        tenant_repo: ITenantRepository,
        catalog_repo: ICatalogRepository,
        staff_repo: IStaffRepository,
        appointment_repo: IAppointmentRepository,
        payment_repo: IPaymentRepository,
        whatsapp_service: Optional[IWhatsAppService] = None,
        email_service: Optional[IEmailService] = None
    ):
        self.tenant_repo = tenant_repo
        self.catalog_repo = catalog_repo
        self.staff_repo = staff_repo
        self.appointment_repo = appointment_repo
        self.payment_repo = payment_repo
        self.whatsapp_service = whatsapp_service
        self.email_service = email_service

    def execute(self, payment_id: str) -> PaymentStatusResponseDTO:
        payment = self.payment_repo.get_payment_by_id(payment_id)
        if not payment:
            raise ValueError(f"Pagamento '{payment_id}' não encontrado.")

        payment.status = "approved"
        payment.paid_at = datetime.now(timezone.utc)
        self.payment_repo.update_payment(payment)

        # Atualiza o agendamento associado
        tenant = self.tenant_repo.get_by_id(payment.tenant_id)
        if tenant:
            appointment = self.appointment_repo.get_by_voucher_code(tenant.id, payment.voucher_code)
            if appointment:
                appointment.payment_status = "paid"
                appointment.status = "confirmed"
                self.appointment_repo.update_appointment(appointment)

                # Notificações de confirmação de pagamento
                service = self.catalog_repo.get_service_by_id(tenant.id, appointment.service_id)
                staff = self.staff_repo.get_staff_by_id(tenant.id, appointment.staff_id)
                if service and staff:
                    if self.email_service:
                        try:
                            self.email_service.send_booking_voucher_email(tenant, appointment, service, staff)
                        except Exception:
                            pass
                    if self.whatsapp_service:
                        try:
                            self.whatsapp_service.send_customer_booking_confirmation(tenant, appointment, service, staff)
                            self.whatsapp_service.send_staff_booking_alert(tenant, appointment, service, staff)
                        except Exception:
                            pass

        return PaymentStatusResponseDTO(
            payment_id=payment.id,
            appointment_id=payment.appointment_id,
            voucher_code=payment.voucher_code,
            status=payment.status,
            amount=payment.amount,
            is_paid=True,
            paid_at=payment.paid_at.isoformat() if payment.paid_at else None
        )


