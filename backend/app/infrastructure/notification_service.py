import urllib.parse
from app.domain.entities import Appointment, Tenant, Service, Staff

def generate_google_calendar_url(appt: Appointment, tenant: Tenant, service: Service, staff: Staff) -> str:
    """Gera link direto para adição do agendamento no Google Agenda."""
    title = f"{service.name} - {tenant.name}"
    details = f"Agendamento confirmado no {tenant.name}.\nProfissional: {staff.name}\nCódigo do Voucher: {appt.voucher_code}\nEndereço: {tenant.address}\nTelefone: {tenant.phone}"
    location = tenant.address

    # Format date and time (YYYYMMDDTHHMMSSZ)
    clean_date = appt.appointment_date.replace("-", "")
    start_time_clean = appt.start_time.replace(":", "") + "00"
    end_time_clean = appt.end_time.replace(":", "") + "00"
    dates = f"{clean_date}T{start_time_clean}/{clean_date}T{end_time_clean}"

    base_url = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    params = {
        "text": title,
        "details": details,
        "location": location,
        "dates": dates,
    }
    return f"{base_url}&{urllib.parse.urlencode(params)}"


def generate_whatsapp_direct_link(appt: Appointment, tenant: Tenant, service: Service, staff: Staff) -> str:
    """Gera link para contato direto via WhatsApp com mensagem pré-formatada."""
    msg = generate_whatsapp_message(appt, tenant, service, staff)
    clean_phone = tenant.whatsapp.replace("+", "").replace("-", "").replace(" ", "").replace("(", "").replace(")", "")
    return f"https://wa.me/{clean_phone}?text={urllib.parse.quote(msg)}"


def generate_whatsapp_message(appt: Appointment, tenant: Tenant, service: Service, staff: Staff) -> str:
    """Gera texto de notificação e confirmação para o WhatsApp."""
    return (
        f"Olá! Meu nome é {appt.customer_name} e acabei de confirmar meu agendamento na {tenant.name}.\n\n"
        f"• Serviço: {service.name}\n"
        f"• Profissional: {staff.name}\n"
        f"• Data: {appt.appointment_date}\n"
        f"• Horário: {appt.start_time} às {appt.end_time}\n"
        f"• Voucher: {appt.voucher_code}\n\n"
        f"Agradeço a confirmação!"
    )


def generate_qr_payload(appt: Appointment, tenant: Tenant) -> str:
    """Gera payload estruturado para o QR Code de validação na recepção."""
    return f"ADMINIC-VOUCHER:{appt.voucher_code}|TENANT:{tenant.slug}|DATE:{appt.appointment_date}|TIME:{appt.start_time}|CLIENT:{appt.customer_name}"
