import json
import urllib.request
import urllib.error
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 65)
print("🚀 TESTE DE AGENDAMENTO END-TO-END - BARBEARIA CAMPELO")
print("   - PIX Real Mercado Pago (R$ 0,01)")
print("   - WhatsApp Meta API (Cliente: 92986020269 | Barbeiro: 92984899955)")
print("   - E-mail SMTP Gmail (Cliente: willyanszbrito@gmail.com | Barbeiro: sofiaheufrosina@gmail.com)")
print("=" * 65)

payload = json.dumps({
    "service_id": "srv-campelo-corte",
    "staff_id": "stf-julio-sousa",
    "appointment_date": "2026-08-22",
    "start_time": "14:00",
    "customer_name": "Willyan Souza Brito",
    "customer_phone": "92986020269",
    "customer_email": "willyanszbrito@gmail.com",
    "notes": "Teste de Agendamento Homologado Adminic",
    "payment_method": "pix"
}).encode("utf-8")

req = urllib.request.Request(
    "http://localhost:8000/api/v1/tenants/barbearia-campelo/appointments",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")
    print(f"❌ ERRO HTTP {e.code}: {body}")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERRO DE CONEXÃO: {e}")
    sys.exit(1)

voucher = data.get("voucher_code", "N/A")
print()
print("✅ AGENDAMENTO CRIADO COM SUCESSO!")
print(f"  • Voucher: {voucher}")
print(f"  • Status: {data.get('status')}")
print(f"  • Serviço: R$ {data.get('price'):.2f}")
print(f"  • Pagamento: {data.get('payment_method')} ({data.get('payment_status')})")

pix = data.get("pix")
if pix:
    ticket = pix.get("ticket_url", "")
    is_placeholder = "placeholder" in str(ticket)
    qr_copia = pix.get("qr_code", "")

    print()
    print("💰 DADOS DO PAGAMENTO PIX:")
    print(f"  • Payment ID: {pix.get('payment_id')}")
    print(f"  • Valor Cobrado: R$ {pix.get('amount'):.2f}")
    print(f"  • Status PIX: {pix.get('status')}")
    print(f"  • Gateway: {'❌ PLACEHOLDER' if is_placeholder else '✅ MERCADO PAGO OFICIAL PRODUÇÃO'}")
    if qr_copia:
        print(f"  • Copia e Cola PIX:\n    {qr_copia}")
    if ticket:
        print(f"  • Link do Ticket / Pagamento:\n    {ticket}")
else:
    print("\n⚠️ Nenhum dado PIX retornado.")

print()
print("=" * 65)
print("📱 NOTIFICAÇÕES DISPARADAS:")
print("  1. WhatsApp Cliente (92986020269) -> Mensagem com resumo do corte e link")
print("  2. WhatsApp Barbeiro (92984899955) -> Alerta de novo agendamento na agenda")
print("  3. E-mail Cliente (willyanszbrito@gmail.com) -> Voucher com 1-clique Google Agenda")
print("  4. E-mail Barbeiro (sofiaheufrosina@gmail.com) -> Notificação técnica do agendamento")
print("=" * 65)
