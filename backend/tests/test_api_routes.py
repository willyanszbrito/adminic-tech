import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_openapi_yaml_export():
    response = client.get("/openapi.yaml")
    assert response.status_code == 200
    assert "application/x-yaml" in response.headers.get("content-type", "")
    assert "openapi: 3." in response.text or "paths:" in response.text

def test_list_tenants():
    response = client.get("/api/v1/tenants")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    slugs = [t["slug"] for t in data]
    assert "barbearia-vintage" in slugs
    assert "clinica-renova" in slugs

def test_get_tenant_barber():
    response = client.get("/api/v1/tenants/barbearia-vintage")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Aura Barber Club"
    assert data["theme"]["primary_color"] == "#f59e0b"

def test_get_catalog():
    response = client.get("/api/v1/tenants/barbearia-vintage/services")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert "services" in data
    assert len(data["services"]) > 0

def test_get_staff():
    response = client.get("/api/v1/tenants/barbearia-vintage/staff?service_id=srv-corte-degrade")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_availability():
    response = client.get("/api/v1/tenants/barbearia-vintage/availability?date=2026-08-19&staff_id=stf-marcus-barber&service_id=srv-corte-degrade")
    assert response.status_code == 200
    data = response.json()
    assert "slots" in data
    assert data["total_slots"] > 0

def test_booking_flow_api():
    payload = {
        "service_id": "srv-corte-degrade",
        "staff_id": "stf-lucius-barber",
        "appointment_date": "2026-08-20",
        "start_time": "15:00",
        "customer_name": "Valerius Mendes",
        "customer_phone": "(11) 98765-1234",
        "customer_email": "valerius.mendes@corporativo.com.br",
        "notes": "Atendimento corporativo"
    }
    create_res = client.post("/api/v1/tenants/barbearia-vintage/appointments", json=payload)
    assert create_res.status_code == 201
    appt_data = create_res.json()
    voucher = appt_data["voucher_code"]
    assert voucher.startswith("ADM-")
    assert appt_data["customer_email"] == "valerius.mendes@corporativo.com.br"

    # Fetch by voucher
    get_res = client.get(f"/api/v1/tenants/barbearia-vintage/appointments/{voucher}")
    assert get_res.status_code == 200
    assert get_res.json()["customer_name"] == "Valerius Mendes"

    # Customer Portal lookup
    cust_res = client.get("/api/v1/tenants/barbearia-vintage/customer/appointments?email=valerius.mendes@corporativo.com.br")
    assert cust_res.status_code == 200
    assert len(cust_res.json()) >= 1

    # Reschedule
    resched_payload = {
        "appointment_date": "2026-08-21",
        "start_time": "16:00",
        "reason": "Reunião de diretoria"
    }
    resched_res = client.post(f"/api/v1/tenants/barbearia-vintage/appointments/{voucher}/reschedule", json=resched_payload)
    assert resched_res.status_code == 200
    assert resched_res.json()["appointment_date"] == "2026-08-21"
    assert resched_res.json()["start_time"] == "16:00"

    # Cancel
    del_res = client.delete(f"/api/v1/tenants/barbearia-vintage/appointments/{voucher}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "cancelled"

def test_booking_requires_valid_email():
    payload = {
        "service_id": "srv-corte-degrade",
        "staff_id": "stf-lucius-barber",
        "appointment_date": "2026-08-20",
        "start_time": "16:00",
        "customer_name": "Teste Sem Email",
        "customer_phone": "(11) 98765-1234"
    }
    create_res = client.post("/api/v1/tenants/barbearia-vintage/appointments", json=payload)
    assert create_res.status_code == 422

def test_staff_portal_endpoints():
    # Update staff profile
    upd_payload = {
        "name": "Marcus Aurelius Silva Jr.",
        "bio": "Atualização de biografia e especialidades técnicas."
    }
    upd_res = client.put("/api/v1/tenants/barbearia-vintage/staff/stf-marcus-barber/profile", json=upd_payload)
    assert upd_res.status_code == 200
    assert upd_res.json()["name"] == "Marcus Aurelius Silva Jr."

    # Block slot
    block_payload = {
        "date": "2026-08-22",
        "start_time": "10:00",
        "end_time": "11:30",
        "reason": "Alinhamento com Diretoria"
    }
    block_res = client.post("/api/v1/tenants/barbearia-vintage/staff/stf-marcus-barber/block-slot", json=block_payload)
    assert block_res.status_code == 200
    assert len(block_res.json()["blocked_slots"]) >= 1

def test_partner_admin_portal_endpoints():
    # Metrics
    met_res = client.get("/api/v1/tenants/barbearia-vintage/admin/metrics")
    assert met_res.status_code == 200
    data = met_res.json()
    assert "total_appointments" in data
    assert "monthly_revenue" in data
    assert data["trial_status"] == "active"

    # Create service
    srv_payload = {
        "category_id": "cat-cabelo",
        "name": "Hidratação de Ozônio",
        "description": "Tratamento capilar com ozonioterapia.",
        "duration_minutes": 30,
        "price": 90.0,
        "is_featured": True
    }
    srv_res = client.post("/api/v1/tenants/barbearia-vintage/admin/services", json=srv_payload)
    assert srv_res.status_code == 201
    assert srv_res.json()["name"] == "Hidratação de Ozônio"

def test_super_admin_portal_endpoints():
    # Overview
    ov_res = client.get("/api/v1/super-admin/overview")
    assert ov_res.status_code == 200
    ov_data = ov_res.json()
    assert ov_data["total_tenants"] >= 4
    assert "active_trials" in ov_data

    # Create new tenant with 30-day trial
    new_tenant = {
        "slug": "clinica-sorriso-prime",
        "name": "Clínica Odontológica Sorriso Prime",
        "slogan": "Odontologia Estética e Implantes Avançados",
        "category": "clinica",
        "email": "diretoria@sorrisoprime.com.br",
        "phone": "(11) 3210-9876",
        "whatsapp": "5511988881234",
        "address": "Alameda Santos, 1200, Cerqueira César, São Paulo - SP",
        "primary_color": "#0ea5e9",
        "secondary_color": "#0369a1"
    }
    tnt_res = client.post("/api/v1/super-admin/tenants", json=new_tenant)
    assert tnt_res.status_code == 201
    assert tnt_res.json()["slug"] == "clinica-sorriso-prime"
    assert tnt_res.json()["trial_status"] == "active"

def test_auth_endpoints():
    # 1. Google One Tap auth
    google_payload = {
        "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9.eyJlbWFpbCI6ImNsaWVudGUuZ29vZ2xlQGVtcHJlc2EuY29tLmJyIiwibmFtZSI6IkNsaWVudGUgR29vZ2xlIiwicGljdHVyZSI6Imh0dHBzOi8vcGxhY2Vob2xkLmNvLzEwMHgxMDAifQ.signature",
        "target_role": "customer",
        "target_tenant_slug": "barbearia-vintage"
    }
    g_res = client.post("/api/v1/auth/google", json=google_payload)
    assert g_res.status_code == 200
    g_data = g_res.json()
    assert "access_token" in g_data
    assert g_data["user"]["email"] == "cliente.google@empresa.com.br"
    assert g_data["user"]["role"] == "customer"

    # 2. Demo login (Partner Admin)
    demo_payload = {
        "email": "gestor@barbeariacampelo.com.br",
        "role": "partner_admin",
        "name": "Gestor Barbearia Campelo",
        "tenant_slug": "barbearia-campelo"
    }
    d_res = client.post("/api/v1/auth/demo-login", json=demo_payload)
    assert d_res.status_code == 200
    d_data = d_res.json()
    assert d_data["user"]["role"] == "partner_admin"
    assert d_data["user"]["name"] == "Gestor Barbearia Campelo"

    # 3. Demo login para Super Admin deve ser estritamente bloqueado (Security Policy)
    blocked_payload = {
        "email": "diretoria@adminic.com.br",
        "role": "super_admin",
        "name": "Tentativa Não Autorizada"
    }
    b_res = client.post("/api/v1/auth/demo-login", json=blocked_payload)
    assert b_res.status_code == 400


def test_pix_payment_flow():
    # 1. Create appointment with payment_method = "pix"
    booking_payload = {
        "service_id": "srv-corte-degrade",
        "staff_id": "stf-lucius-barber",
        "appointment_date": "2026-08-25",
        "start_time": "14:00",
        "customer_name": "Marcus Aurelius Teste Pix",
        "customer_phone": "(11) 99999-8888",
        "customer_email": "marcus.pix@empresa.com.br",
        "payment_method": "pix"
    }
    b_res = client.post("/api/v1/tenants/barbearia-vintage/appointments", json=booking_payload)
    assert b_res.status_code == 201
    b_data = b_res.json()
    assert b_data["payment_method"] == "pix"
    assert b_data["payment_status"] == "pending"
    assert b_data["pix"] is not None
    assert "qr_code" in b_data["pix"]
    assert "qr_code_base64" in b_data["pix"]
    payment_id = b_data["pix"]["payment_id"]
    voucher = b_data["voucher_code"]

    # 2. Check payment status
    st_res = client.get(f"/api/v1/tenants/barbearia-vintage/payments/{payment_id}/status")
    assert st_res.status_code == 200
    assert st_res.json()["status"] == "pending"
    assert not st_res.json()["is_paid"]

    # 3. Simulate payment confirmation (test endpoint / instant approval)
    conf_res = client.post(f"/api/v1/tenants/barbearia-vintage/payments/{payment_id}/simulate-confirm")
    assert conf_res.status_code == 200
    assert conf_res.json()["status"] == "approved"
    assert conf_res.json()["is_paid"] is True

    # 4. Check appointment is now marked as paid
    app_res = client.get(f"/api/v1/tenants/barbearia-vintage/appointments/{voucher}")
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "confirmed"

    # 5. Test Webhook endpoint
    webhook_res = client.post("/api/v1/payments/webhook", json={"data": {"id": payment_id}})
    assert webhook_res.status_code == 200
    assert webhook_res.json()["status"] == "received"

