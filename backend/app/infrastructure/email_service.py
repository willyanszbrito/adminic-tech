import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.domain.entities import Appointment, Tenant, Service, Staff
from app.domain.interfaces import IEmailService
from app.infrastructure.notification_service import generate_google_calendar_url, generate_whatsapp_direct_link
from app.core.config import settings

logger = logging.getLogger(__name__)

class GmailSmtpEmailService(IEmailService):
    """
    Serviço de Envio de E-mails Transacionais via Gmail SMTP (adminicbr@gmail.com).
    Envia vouchers corporativos formatados em HTML com informações da reserva,
    botão de integração com Google Agenda e link direto para atendimento WhatsApp.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        from_name: Optional[str] = None,
        enabled: Optional[bool] = None
    ):
        self.host = host or settings.SMTP_HOST
        self.port = port or settings.SMTP_PORT
        self.user = user or settings.SMTP_USER
        self.password = (password or settings.SMTP_PASSWORD).replace(" ", "")
        self.from_name = from_name or settings.SMTP_FROM_NAME
        self.enabled = enabled if enabled is not None else settings.SMTP_ENABLED

    def send_booking_voucher_email(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Dispara e-mail corporativo formatado com voucher e confirmação via Gmail SMTP."""
        recipient = appointment.customer_email
        subject = f"Confirmação de Agendamento - {tenant.name} [Voucher: {appointment.voucher_code}]"

        google_calendar_link = generate_google_calendar_url(appointment, tenant, service, staff)
        whatsapp_link = generate_whatsapp_direct_link(appointment, tenant, service, staff)
        portal_link = f"https://{settings.APP_DOMAIN}/meus-agendamentos?code={appointment.voucher_code}"

        html_content = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{subject}</title>
          <style>
            body {{
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f8fafc;
              margin: 0;
              padding: 24px;
              color: #0f172a;
            }}
            .container {{
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 20px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
              overflow: hidden;
            }}
            .header {{
              background-color: #18181b;
              color: #ffffff;
              padding: 32px 24px;
              text-align: center;
              border-bottom: 3px solid #f59e0b;
            }}
            .header h1 {{
              margin: 0;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }}
            .header p {{
              margin: 6px 0 0 0;
              color: #a1a1aa;
              font-size: 13px;
            }}
            .content {{
              padding: 32px 24px;
            }}
            .voucher-box {{
              background-color: #fffbeb;
              border: 1px dashed #f59e0b;
              border-radius: 14px;
              padding: 20px;
              text-align: center;
              margin-bottom: 24px;
            }}
            .voucher-label {{
              font-size: 11px;
              font-weight: 700;
              color: #b45309;
              text-transform: uppercase;
              letter-spacing: 1px;
            }}
            .voucher-code {{
              font-size: 26px;
              font-weight: 800;
              color: #18181b;
              font-family: monospace;
              margin: 6px 0;
            }}
            .details-table {{
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }}
            .details-table td {{
              padding: 12px 0;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }}
            .details-label {{
              color: #64748b;
              font-weight: 500;
              width: 35%;
            }}
            .details-value {{
              color: #0f172a;
              font-weight: 600;
              text-align: right;
            }}
            .btn-group {{
              margin: 28px 0 12px 0;
              text-align: center;
            }}
            .btn-primary {{
              display: inline-block;
              background-color: #f59e0b;
              color: #000000 !important;
              font-weight: 700;
              font-size: 13px;
              padding: 12px 24px;
              border-radius: 10px;
              text-decoration: none;
              margin: 6px;
            }}
            .btn-secondary {{
              display: inline-block;
              background-color: #f1f5f9;
              color: #0f172a !important;
              font-weight: 600;
              font-size: 13px;
              padding: 12px 24px;
              border-radius: 10px;
              text-decoration: none;
              margin: 6px;
              border: 1px solid #e2e8f0;
            }}
            .footer {{
              background-color: #f8fafc;
              padding: 20px 24px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              color: #64748b;
            }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>{tenant.name}</h1>
              <p>{tenant.slogan}</p>
            </div>
            <div class="content">
              <p style="font-size: 15px; margin-top: 0;">Olá, <strong>{appointment.customer_name}</strong>!</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                Seu agendamento foi registrado com sucesso na <strong>{tenant.name}</strong>. Apresente seu código de voucher ao comparecer na recepção.
              </p>

              <div class="voucher-box">
                <div class="voucher-label">Código Único do Voucher</div>
                <div class="voucher-code">{appointment.voucher_code}</div>
                <div style="font-size: 11px; color: #78350f;">Apresente no atendimento</div>
              </div>

              <table class="details-table">
                <tr>
                  <td class="details-label">Procedimento</td>
                  <td class="details-value">{service.name}</td>
                </tr>
                <tr>
                  <td class="details-label">Profissional</td>
                  <td class="details-value">{staff.name}</td>
                </tr>
                <tr>
                  <td class="details-label">Data</td>
                  <td class="details-value">{appointment.appointment_date}</td>
                </tr>
                <tr>
                  <td class="details-label">Horário</td>
                  <td class="details-value">{appointment.start_time} às {appointment.end_time}</td>
                </tr>
                <tr>
                  <td class="details-label">Valor Total</td>
                  <td class="details-value">R$ {appointment.price:.2f}</td>
                </tr>
                <tr>
                  <td class="details-label">Endereço</td>
                  <td class="details-value">{tenant.address}</td>
                </tr>
              </table>

              <div class="btn-group">
                <a href="{google_calendar_link}" class="btn-primary" target="_blank">Adicionar ao Google Agenda</a>
                <a href="{portal_link}" class="btn-secondary" target="_blank">Gerenciar Agendamento</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 6px 0;"><strong>Adminic Smart Booking</strong> • Plataforma Multi-Tenant</p>
              <p style="margin: 0;">Em caso de dúvidas, contate o estabelecimento pelo telefone {tenant.phone}.</p>
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = (
            f"Confirmação de Agendamento - {tenant.name}\n\n"
            f"Olá, {appointment.customer_name}!\n"
            f"Seu voucher: {appointment.voucher_code}\n\n"
            f"Serviço: {service.name}\n"
            f"Profissional: {staff.name}\n"
            f"Data: {appointment.appointment_date} às {appointment.start_time}\n"
            f"Endereço: {tenant.address}\n\n"
            f"Gerenciar reserva: {portal_link}\n"
        )

        return self._send_smtp_email(recipient, subject, html_content, plain_text)

    def send_staff_booking_alert_email(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Dispara e-mail de alerta de novo agendamento diretamente para a caixa de entrada do profissional."""
        recipient = getattr(staff, 'email', None) or tenant.email
        if not recipient:
            return True

        subject = f"🔔 Novo Agendamento: {service.name} com {appointment.customer_name} [{appointment.appointment_date} {appointment.start_time}]"

        html_content = f"""
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>{subject}</title>
          <style>
            body {{ font-family: -apple-system, sans-serif; background-color: #f8fafc; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; }}
            .badge {{ display: inline-block; background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }}
            h2 {{ color: #0f172a; margin-top: 12px; }}
            .table {{ width: 100%; border-collapse: collapse; margin: 16px 0; }}
            .table td {{ padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }}
            .label {{ color: #64748b; font-weight: 600; width: 120px; }}
            .value {{ color: #0f172a; font-weight: 700; }}
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">Novo Agendamento Confirmado</span>
            <h2>Olá, {staff.name}!</h2>
            <p style="color: #475569; font-size: 14px;">Você tem um novo atendimento agendado na <strong>{tenant.name}</strong>.</p>
            <table class="table">
              <tr><td class="label">Cliente</td><td class="value">{appointment.customer_name} ({appointment.customer_phone})</td></tr>
              <tr><td class="label">E-mail Cliente</td><td class="value">{appointment.customer_email}</td></tr>
              <tr><td class="label">Serviço</td><td class="value">{service.name}</td></tr>
              <tr><td class="label">Data</td><td class="value">{appointment.appointment_date}</td></tr>
              <tr><td class="label">Horário</td><td class="value">{appointment.start_time} às {appointment.end_time}</td></tr>
              <tr><td class="label">Valor</td><td class="value">R$ {appointment.price:.2f}</td></tr>
              <tr><td class="label">Voucher</td><td class="value">{appointment.voucher_code}</td></tr>
            </table>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Adminic Smart Booking • Notificação Automática para o Colaborador</p>
          </div>
        </body>
        </html>
        """

        plain_text = (
            f"Novo Agendamento Confirmado - {tenant.name}\n\n"
            f"Olá, {staff.name}!\n"
            f"Cliente: {appointment.customer_name} ({appointment.customer_phone})\n"
            f"Serviço: {service.name}\n"
            f"Data: {appointment.appointment_date} às {appointment.start_time}\n"
            f"Voucher: {appointment.voucher_code}\n"
        )

        return self._send_smtp_email(recipient, subject, html_content, plain_text)


    def _send_smtp_email(self, recipient: str, subject: str, html_body: str, plain_body: str) -> bool:
        logger.info(f"[Gmail SMTP] Preparando envio para: {recipient} | Assunto: {subject}")

        if not self.enabled:
            logger.info("[Gmail SMTP] Envio desativado via configuração SMTP_ENABLED=false")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.user}>"
            msg["To"] = recipient

            part1 = MIMEText(plain_body, "plain", "utf-8")
            part2 = MIMEText(html_body, "html", "utf-8")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.user, [recipient], msg.as_string())
                logger.info(f"[Gmail SMTP] E-mail enviado com sucesso para {recipient}")
                return True
        except Exception as e:
            logger.warning(f"[Gmail SMTP] Falha no disparo de e-mail (registrado em log): {str(e)}")
            return False
