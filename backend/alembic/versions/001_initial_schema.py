"""Initial enterprise schema for Adminic Multi-Tenant Smart Booking

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-17 02:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Tenants Table
    op.create_table(
        'tenants',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('slogan', sa.String(length=255), nullable=True),
        sa.Column('category', sa.String(length=50), server_default='barbearia', nullable=True),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('whatsapp', sa.String(length=30), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('banner_url', sa.Text(), nullable=True),
        sa.Column('primary_color', sa.String(length=30), server_default='#d4af37', nullable=True),
        sa.Column('secondary_color', sa.String(length=30), server_default='#121212', nullable=True),
        sa.Column('accent_color', sa.String(length=30), server_default='#f59e0b', nullable=True),
        sa.Column('font_family', sa.String(length=50), server_default='Plus Jakarta Sans', nullable=True),
        sa.Column('theme_mode', sa.String(length=20), server_default='dark', nullable=True),
        sa.Column('business_hours', sa.JSON(), nullable=True),
        sa.Column('trial_ends_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
        sa.Column('pix_enabled', sa.Boolean(), server_default='1', nullable=True),
        sa.Column('pix_mode', sa.String(length=30), server_default='production', nullable=True),
        sa.Column('mercadopago_public_key', sa.String(length=255), nullable=True),
        sa.Column('mercadopago_access_token', sa.String(length=255), nullable=True),
        sa.Column('mercadopago_pix_key', sa.String(length=100), nullable=True),
        sa.Column('whatsapp_custom_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'], unique=False)
    op.create_index(op.f('ix_tenants_slug'), 'tenants', ['slug'], unique=True)

    # 2. Service Categories Table
    op.create_table(
        'service_categories',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('tenant_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('order', sa.Integer(), server_default='0', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_service_categories_id'), 'service_categories', ['id'], unique=False)
    op.create_index(op.f('ix_service_categories_tenant_id'), 'service_categories', ['tenant_id'], unique=False)

    # 3. Services Table
    op.create_table(
        'services',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('tenant_id', sa.String(length=50), nullable=False),
        sa.Column('category_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), server_default='30', nullable=True),
        sa.Column('price', sa.Float(), server_default='0.0', nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='0', nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_services_id'), 'services', ['id'], unique=False)
    op.create_index(op.f('ix_services_tenant_id'), 'services', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_services_category_id'), 'services', ['category_id'], unique=False)

    # 4. Staff Members Table
    op.create_table(
        'staff_members',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('tenant_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('role', sa.String(length=100), server_default='Profissional', nullable=True),
        sa.Column('email', sa.String(length=150), nullable=True),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('shifts', sa.JSON(), nullable=True),
        sa.Column('specialty_service_ids', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_staff_members_id'), 'staff_members', ['id'], unique=False)
    op.create_index(op.f('ix_staff_members_tenant_id'), 'staff_members', ['tenant_id'], unique=False)

    # 5. Appointments Table
    op.create_table(
        'appointments',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('tenant_id', sa.String(length=50), nullable=False),
        sa.Column('voucher_code', sa.String(length=50), nullable=False),
        sa.Column('service_id', sa.String(length=50), nullable=False),
        sa.Column('staff_id', sa.String(length=50), nullable=False),
        sa.Column('appointment_date', sa.String(length=20), nullable=False),
        sa.Column('start_time', sa.String(length=10), nullable=False),
        sa.Column('end_time', sa.String(length=10), nullable=False),
        sa.Column('customer_name', sa.String(length=150), nullable=False),
        sa.Column('customer_phone', sa.String(length=30), nullable=False),
        sa.Column('customer_email', sa.String(length=150), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=30), server_default='confirmed', nullable=True),
        sa.Column('price', sa.Float(), server_default='0.0', nullable=True),
        sa.Column('payment_method', sa.String(length=30), server_default='venue', nullable=True),
        sa.Column('payment_status', sa.String(length=30), server_default='venue', nullable=True),
        sa.Column('payment_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['staff_id'], ['staff_members.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_appointments_id'), 'appointments', ['id'], unique=False)
    op.create_index(op.f('ix_appointments_tenant_id'), 'appointments', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_appointments_voucher_code'), 'appointments', ['voucher_code'], unique=True)
    op.create_index(op.f('ix_appointments_customer_email'), 'appointments', ['customer_email'], unique=False)
    op.create_index(op.f('ix_appointments_appointment_date'), 'appointments', ['appointment_date'], unique=False)

    # 6. Payment Transactions Table
    op.create_table(
        'payment_transactions',
        sa.Column('id', sa.String(length=100), nullable=False),
        sa.Column('tenant_id', sa.String(length=50), nullable=False),
        sa.Column('appointment_id', sa.String(length=50), nullable=False),
        sa.Column('external_payment_id', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=30), server_default='pending', nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('qr_code_base64', sa.Text(), nullable=True),
        sa.Column('qr_code_copy_paste', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payment_transactions_id'), 'payment_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_payment_transactions_tenant_id'), 'payment_transactions', ['tenant_id'], unique=False)

    # 7. Trilha de Auditoria Digital Imutável
    op.create_table(
        'trilha_auditoria',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.String(length=40), nullable=False),
        sa.Column('hash_integridade', sa.String(length=64), nullable=False),
        sa.Column('hash_anterior', sa.String(length=64), nullable=False),
        sa.Column('usuario', sa.String(length=150), nullable=False),
        sa.Column('acao', sa.String(length=200), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('detalhes', sa.Text(), nullable=True),
        sa.Column('tenant_slug', sa.String(length=100), nullable=True),
        sa.Column('canal', sa.String(length=50), server_default='API_REST', nullable=True),
        sa.Column('ip_origem', sa.String(length=60), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('status_code', sa.Integer(), server_default='200', nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_trilha_auditoria_id'), 'trilha_auditoria', ['id'], unique=False)
    op.create_index(op.f('ix_trilha_auditoria_timestamp'), 'trilha_auditoria', ['timestamp'], unique=False)
    op.create_index(op.f('ix_trilha_auditoria_hash_integridade'), 'trilha_auditoria', ['hash_integridade'], unique=False)

def downgrade() -> None:
    op.drop_table('trilha_auditoria')
    op.drop_table('payment_transactions')
    op.drop_table('appointments')
    op.drop_table('staff_members')
    op.drop_table('services')
    op.drop_table('service_categories')
    op.drop_table('tenants')
