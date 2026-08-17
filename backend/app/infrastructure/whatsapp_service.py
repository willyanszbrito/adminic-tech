import logging
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List
from app.domain.entities import Appointment, Tenant, Service, Staff
from app.domain.interfaces import IWhatsAppService
from app.core.config import settings

logger = logging.getLogger(__name__)


class MetaWhatsAppService(IWhatsAppService):
    """
    Serviço de Notificação via WhatsApp integrado à API oficial Meta WhatsApp Business (Graph API v25.0).
    Suporta envio via Template Oficial Aprovado (confirmacao_agendamento_v1) com botões interativos
    e fallback automático para mensagens de texto direto.
    """

    def __init__(
        self,
        access_token: Optional[str] = None,
        phone_id: Optional[str] = None,
        api_version: Optional[str] = None,
        enabled: Optional[bool] = None,
        template_name: str = "confirmacao_agendamento_v1"
    ):
        self.access_token = access_token or settings.META_ACCESS_TOKEN
        self.phone_id = phone_id or settings.META_PHONE_ID
        self.api_version = api_version or getattr(settings, 'META_API_VERSION', 'v25.0')
        self.enabled = enabled if enabled is not None else settings.WHATSAPP_API_ENABLED
        self.template_name = template_name
        self.base_url = f"https://graph.facebook.com/{self.api_version}/{self.phone_id}/messages"

    def _format_phone(self, phone: str) -> str:
        """Formata telefone para padrão internacional (55 + DDD + número)."""
        digits = "".join(ch for ch in phone if ch.isdigit())
        if len(digits) == 10 or len(digits) == 11:
            return f"55{digits}"
        return digits

    def _send_payload(self, payload: Dict[str, Any], to_number: str, mode_desc: str) -> bool:
        """Envia payload JSON para a API Meta WhatsApp."""
        if not self.access_token or not self.phone_id:
            logger.warning("[WhatsApp] META_ACCESS_TOKEN ou META_PHONE_ID não configurados.")
            return False

        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.base_url,
                data=data,
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read())
                msg_id = result.get("messages", [{}])[0].get("id", "N/A")
                logger.info(f"[WhatsApp META - {mode_desc}] Mensagem enviada para {to_number} | ID: {msg_id}")
                return True
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            logger.warning(f"[WhatsApp META WARNING - {mode_desc}] HTTP {e.code} para {to_number}: {body[:300]}")
            return False
        except Exception as e:
            logger.error(f"[WhatsApp META ERROR - {mode_desc}] {type(e).__name__}: {str(e)}")
            return False

    def _send_text(self, to_number: str, text_body: str) -> bool:
        """Envia mensagem de texto direto via API Meta."""
        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "text": {"body": text_body}
        }
        return self._send_payload(payload, to_number, "Texto Direto")

    def _send_template(
        self,
        to_number: str,
        template_name: str,
        named_params: Dict[str, str],
        button_param: Optional[str] = None
    ) -> bool:
        """
        Envia mensagem estruturada através de Template Oficial aprovado na Meta.
        Suporta parâmetros nomeados e botão de URL dinâmica.
        """
        body_parameters = [
            {"type": "text", "parameter_name": k, "text": str(v)}
            for k, v in named_params.items()
        ]

        components: List[Dict[str, Any]] = [
            {
                "type": "body",
                "parameters": body_parameters
            }
        ]

        if button_param:
            components.append({
                "type": "button",
                "sub_type": "url",
                "index": "0",
                "parameters": [
                    {"type": "text", "text": button_param}
                ]
            })

        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": "pt_BR"},
                "components": components
            }
        }

        # Tenta envio nomeado
        if self._send_payload(payload, to_number, f"Template {template_name}"):
            return True

        # Fallback para parâmetros posicionais caso a conta use o formato anterior
        positional_parameters = [
            {"type": "text", "text": str(v)}
            for v in named_params.values()
        ]
        components_pos: List[Dict[str, Any]] = [
            {"type": "body", "parameters": positional_parameters}
        ]
        if button_param:
            components_pos.append({
                "type": "button",
                "sub_type": "url",
                "index": "0",
                "parameters": [{"type": "text", "text": button_param}]
            })

        payload_pos = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": "pt_BR"},
                "components": components_pos
            }
        }
        return self._send_payload(payload_pos, to_number, f"Template Posicional {template_name}")

    def send_customer_booking_confirmation(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """
        Envia mensagem de confirmação para o WhatsApp do cliente.
        Tenta primeiro via Template Oficial (confirmacao_agendamento_v1).
        Se ainda estiver em análise ou falhar, envia texto direto como fallback.
        """
        target_phone = self._format_phone(appointment.customer_phone)
        app_domain = settings.APP_DOMAIN

        if not self.enabled:
            logger.info("[WhatsApp] Serviço desabilitado. Mensagem não enviada.")
            return True

        # 1. Parâmetros para o Template Oficial Meta
        named_params = {
            "nome_cliente": appointment.customer_name,
            "nome_estabelecimento": tenant.name,
            "nome_servico": service.name,
            "nome_profissional": staff.name,
            "data_agendamento": appointment.appointment_date,
            "horario_agendamento": f"{appointment.start_time} às {appointment.end_time}",
            "codigo_voucher": appointment.voucher_code,
            "valor_total": f"{appointment.price:.2f}",
            "endereco_local": tenant.address or "Atendimento no estabelecimento"
        }

        # Tenta disparar o Template Oficial com Botão
        template_success = self._send_template(
            to_number=target_phone,
            template_name=self.template_name,
            named_params=named_params,
            button_param=appointment.voucher_code
        )

        if template_success:
            return True

        # 2. Fallback: Mensagem de Texto Direta Formatada
        logger.info(f"[WhatsApp] Executando fallback de texto para {target_phone}")
        message = (
            f"Olá, {appointment.customer_name}! ✅ Seu agendamento na *{tenant.name}* foi confirmado!\n\n"
            f"📋 *Detalhes da Reserva:*\n"
            f"• *Serviço:* {service.name}\n"
            f"• *Profissional:* {staff.name}\n"
            f"• *Data:* {appointment.appointment_date}\n"
            f"• *Horário:* {appointment.start_time} às {appointment.end_time}\n"
            f"• *Voucher:* `{appointment.voucher_code}`\n"
            f"• *Valor:* R$ {appointment.price:.2f}\n"
            f"• *Endereço:* {tenant.address}\n\n"
            f"📱 Consulte seu agendamento em:\n"
            f"https://{app_domain}/meus-agendamentos?code={appointment.voucher_code}\n\n"
            f"Agradecemos a sua preferência! 💈"
        )
        return self._send_text(target_phone, message)

    def send_staff_booking_alert(
        self,
        tenant: Tenant,
        appointment: Appointment,
        service: Service,
        staff: Staff
    ) -> bool:
        """Envia alerta de novo agendamento para o WhatsApp do profissional/estabelecimento."""
        staff_phone = getattr(staff, 'phone', None)
        if staff_phone:
            target_phone = self._format_phone(staff_phone)
        else:
            target_phone = self._format_phone(tenant.whatsapp)

        app_domain = settings.APP_DOMAIN

        if not self.enabled:
            return True

        # 1. Parâmetros para o Template Oficial de Alerta
        named_params = {
            "nome_profissional": staff.name,
            "nome_estabelecimento": tenant.name,
            "nome_cliente": appointment.customer_name,
            "telefone_cliente": appointment.customer_phone,
            "nome_servico": service.name,
            "valor_total": f"{appointment.price:.2f}",
            "data_agendamento": appointment.appointment_date,
            "horario_agendamento": appointment.start_time,
            "codigo_voucher": appointment.voucher_code
        }

        # Tenta disparar o Template Oficial alerta_novo_agendamento_v1
        template_success = self._send_template(
            to_number=target_phone,
            template_name="alerta_novo_agendamento_v1",
            named_params=named_params
        )

        if template_success:
            return True

        # 2. Fallback de Texto Direto
        message = (
            f"🔔 *Novo Agendamento - {tenant.name}*\n\n"
            f"• *Colaborador:* {staff.name}\n"
            f"• *Cliente:* {appointment.customer_name} ({appointment.customer_phone})\n"
            f"• *Serviço:* {service.name} (R$ {appointment.price:.2f})\n"
            f"• *Data:* {appointment.appointment_date} às {appointment.start_time}\n"
            f"• *Voucher:* `{appointment.voucher_code}`\n\n"
            f"📋 Acesse sua agenda: https://{app_domain}/colaborador"
        )
        return self._send_text(target_phone, message)
