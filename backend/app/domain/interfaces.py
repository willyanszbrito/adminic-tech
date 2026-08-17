from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities import Tenant, Service, ServiceCategory, Staff, Appointment, BlockedSlot, Payment

class ITenantRepository(ABC):
    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Tenant]:
        """Recupera um parceiro através do seu identificador de URL (slug)."""
        pass

    @abstractmethod
    def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        """Recupera um parceiro através do seu ID único."""
        pass

    @abstractmethod
    def list_all(self) -> List[Tenant]:
        """Lista todos os parceiros cadastrados no ecossistema."""
        pass

    @abstractmethod
    def save(self, tenant: Tenant) -> Tenant:
        """Salva ou atualiza os dados de um parceiro."""
        pass


class ICatalogRepository(ABC):
    @abstractmethod
    def get_categories_by_tenant(self, tenant_id: str) -> List[ServiceCategory]:
        """Retorna todas as categorias de serviços cadastradas para o parceiro."""
        pass

    @abstractmethod
    def save_category(self, category: ServiceCategory) -> ServiceCategory:
        """Cria ou atualiza uma categoria no catálogo."""
        pass

    @abstractmethod
    def delete_category(self, tenant_id: str, category_id: str) -> bool:
        """Remove uma categoria do catálogo."""
        pass

    @abstractmethod
    def get_services_by_tenant(self, tenant_id: str) -> List[Service]:
        """Retorna todos os serviços cadastrados para o parceiro."""
        pass

    @abstractmethod
    def get_service_by_id(self, tenant_id: str, service_id: str) -> Optional[Service]:
        """Recupera um serviço específico pelo ID."""
        pass

    @abstractmethod
    def save_service(self, service: Service) -> Service:
        """Cria ou atualiza um serviço no catálogo."""
        pass

    @abstractmethod
    def delete_service(self, tenant_id: str, service_id: str) -> bool:
        """Remove um serviço do catálogo."""
        pass


class IStaffRepository(ABC):
    @abstractmethod
    def get_staff_by_tenant(self, tenant_id: str) -> List[Staff]:
        """Lista os colaboradores de um parceiro."""
        pass

    @abstractmethod
    def get_staff_for_service(self, tenant_id: str, service_id: str) -> List[Staff]:
        """Lista colaboradores habilitados para executar determinado serviço."""
        pass

    @abstractmethod
    def get_staff_by_id(self, tenant_id: str, staff_id: str) -> Optional[Staff]:
        """Recupera o cadastro de um profissional pelo ID."""
        pass

    @abstractmethod
    def save(self, staff: Staff) -> Staff:
        """Salva ou atualiza os dados de um profissional."""
        pass

    @abstractmethod
    def delete_staff(self, tenant_id: str, staff_id: str) -> bool:
        """Remove ou desativa um colaborador."""
        pass

    @abstractmethod
    def add_blocked_slot(self, tenant_id: str, staff_id: str, blocked_slot: BlockedSlot) -> Staff:
        """Registra um bloqueio de agenda para o profissional."""
        pass


class IAppointmentRepository(ABC):
    @abstractmethod
    def get_appointments_for_staff_and_date(self, tenant_id: str, staff_id: str, appointment_date: str) -> List[Appointment]:
        """Retorna agendamentos de um profissional em determinada data."""
        pass

    @abstractmethod
    def get_appointments_by_tenant(self, tenant_id: str) -> List[Appointment]:
        """Retorna todos os agendamentos registrados para um parceiro."""
        pass

    @abstractmethod
    def get_appointments_by_customer_email(self, tenant_id: str, email: str) -> List[Appointment]:
        """Retorna os agendamentos realizados por determinado e-mail de cliente."""
        pass

    @abstractmethod
    def create_appointment(self, appointment: Appointment) -> Appointment:
        """Persiste um novo agendamento."""
        pass

    @abstractmethod
    def get_by_voucher_code(self, tenant_id: str, code: str) -> Optional[Appointment]:
        """Busca agendamento pelo código único do voucher."""
        pass

    @abstractmethod
    def cancel_appointment(self, tenant_id: str, code: str) -> Optional[Appointment]:
        """Cancela um agendamento e libera o horário."""
        pass

    @abstractmethod
    def update_appointment(self, appointment: Appointment) -> Appointment:
        """Atualiza informações e status de um agendamento."""
        pass


class IPaymentRepository(ABC):
    @abstractmethod
    def create_payment(self, payment: Payment) -> Payment:
        """Registra uma nova transação de pagamento."""
        pass

    @abstractmethod
    def get_payment_by_id(self, payment_id: str) -> Optional[Payment]:
        """Busca transação pelo ID."""
        pass

    @abstractmethod
    def get_payment_by_appointment_id(self, appointment_id: str) -> Optional[Payment]:
        """Busca transação vinculada a um agendamento."""
        pass

    @abstractmethod
    def update_payment(self, payment: Payment) -> Payment:
        """Atualiza status e dados da transação."""
        pass


class IPaymentGateway(ABC):
    @abstractmethod
    def generate_pix_payment(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        payer_email: str,
        payer_name: str
    ) -> Payment:
        """Gera cobrança PIX via Mercado Pago com QR Code e Copia e Cola."""
        pass

    @abstractmethod
    def check_payment_status(self, mp_payment_id: str) -> str:
        """Consulta o status atual da cobrança no Mercado Pago."""
        pass


class IWhatsAppService(ABC):
    @abstractmethod
    def send_customer_booking_confirmation(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Envia mensagem de confirmação de agendamento para o WhatsApp do cliente."""
        pass

    @abstractmethod
    def send_staff_booking_alert(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Envia alerta de novo agendamento para o WhatsApp do profissional."""
        pass


class IEmailService(ABC):
    @abstractmethod
    def send_booking_voucher_email(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Dispara e-mail corporativo formatado com voucher e confirmação via Gmail SMTP para o cliente."""
        pass

    @abstractmethod
    def send_staff_booking_alert_email(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Dispara e-mail de alerta de novo agendamento para o profissional/barbeiro."""
        pass

    @abstractmethod
    def send_partner_welcome_email(
        self,
        tenant: Tenant
    ) -> bool:
        """Dispara e-mail de boas-vindas com instruções de login via Google para o parceiro recém-credenciado."""
        pass


