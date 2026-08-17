"""
Modelos ORM SQLAlchemy para Persistência e Migrações (Alembic / PostgreSQL / SQLite)
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(String(50), primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    slogan = Column(String(255), nullable=True)
    category = Column(String(50), default="barbearia")
    phone = Column(String(30), nullable=True)
    whatsapp = Column(String(30), nullable=False)
    email = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    logo_url = Column(Text, nullable=True)
    banner_url = Column(Text, nullable=True)
    
    # Identidade Visual e Temas
    primary_color = Column(String(30), default="#d4af37")
    secondary_color = Column(String(30), default="#121212")
    accent_color = Column(String(30), default="#f59e0b")
    font_family = Column(String(50), default="Plus Jakarta Sans")
    theme_mode = Column(String(20), default="dark")
    
    # Horários de Funcionamento
    business_hours = Column(JSON, nullable=True)
    
    # Licenciamento & Trial
    trial_ends_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Configurações de Pagamento e Notificações
    pix_enabled = Column(Boolean, default=True)
    pix_mode = Column(String(30), default="production")
    mercadopago_public_key = Column(String(255), nullable=True)
    mercadopago_access_token = Column(String(255), nullable=True)
    mercadopago_pix_key = Column(String(100), nullable=True)
    whatsapp_custom_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relacionamentos
    categories = relationship("ServiceCategoryModel", back_populates="tenant", cascade="all, delete-orphan")
    services = relationship("ServiceModel", back_populates="tenant", cascade="all, delete-orphan")
    staff_members = relationship("StaffModel", back_populates="tenant", cascade="all, delete-orphan")
    appointments = relationship("AppointmentModel", back_populates="tenant", cascade="all, delete-orphan")


class ServiceCategoryModel(Base):
    __tablename__ = "service_categories"

    id = Column(String(50), primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    tenant = relationship("TenantModel", back_populates="categories")
    services = relationship("ServiceModel", back_populates="category", cascade="all, delete-orphan")


class ServiceModel(Base):
    __tablename__ = "services"

    id = Column(String(50), primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(50), ForeignKey("service_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=30)
    price = Column(Float, default=0.0)
    image_url = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    tenant = relationship("TenantModel", back_populates="services")
    category = relationship("ServiceCategoryModel", back_populates="services")


class StaffModel(Base):
    __tablename__ = "staff_members"

    id = Column(String(50), primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    role = Column(String(100), default="Profissional")
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)
    shifts = Column(JSON, nullable=True)
    specialty_service_ids = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)

    tenant = relationship("TenantModel", back_populates="staff_members")


class AppointmentModel(Base):
    __tablename__ = "appointments"

    id = Column(String(50), primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    voucher_code = Column(String(50), unique=True, nullable=False, index=True)
    service_id = Column(String(50), ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True)
    staff_id = Column(String(50), ForeignKey("staff_members.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    appointment_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    start_time = Column(String(10), nullable=False)  # HH:MM
    end_time = Column(String(10), nullable=False)    # HH:MM
    
    # Dados do Cliente (Higienizados)
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(30), nullable=False, index=True)
    customer_email = Column(String(150), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    
    status = Column(String(30), default="confirmed", index=True)  # confirmed, completed, cancelled
    price = Column(Float, default=0.0)
    payment_method = Column(String(30), default="venue")         # pix, venue
    payment_status = Column(String(30), default="venue")         # venue, pending, approved, refunded
    payment_id = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    tenant = relationship("TenantModel", back_populates="appointments")

    __table_args__ = (
        Index("ix_appt_tenant_staff_date", "tenant_id", "staff_id", "appointment_date"),
    )


class PaymentTransactionModel(Base):
    __tablename__ = "payment_transactions"

    id = Column(String(100), primary_key=True, index=True)
    tenant_id = Column(String(50), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id = Column(String(50), ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, index=True)
    external_payment_id = Column(String(100), nullable=True, index=True)
    status = Column(String(30), default="pending", index=True)
    amount = Column(Float, nullable=False)
    qr_code_base64 = Column(Text, nullable=True)
    qr_code_copy_paste = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AuditoriaModel(Base):
    __tablename__ = "trilha_auditoria"

    id = Column(String(50), primary_key=True, index=True)
    timestamp = Column(String(40), nullable=False, index=True)
    hash_integridade = Column(String(64), nullable=False, index=True)
    hash_anterior = Column(String(64), nullable=False)
    usuario = Column(String(150), nullable=False, index=True)
    acao = Column(String(200), nullable=False, index=True)
    tipo = Column(String(50), nullable=False, index=True)
    detalhes = Column(Text, nullable=True)
    tenant_slug = Column(String(100), nullable=True, index=True)
    canal = Column(String(50), default="API_REST")
    ip_origem = Column(String(60), nullable=True)
    user_agent = Column(Text, nullable=True)
    status_code = Column(Integer, default=200)
