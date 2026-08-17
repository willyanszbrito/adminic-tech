import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
export const bookingErrors = new Counter('booking_errors');
export const rateLimitHits = new Counter('rate_limit_hits');
export const availabilityTrend = new Trend('availability_duration_ms');

// Test Configuration Options
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 users
    { duration: '1m', target: 50 },   // Normal load at 50 concurrent users
    { duration: '30s', target: 100 }, // Peak stress at 100 concurrent users
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<350', 'p(99)<700'], // 95% of requests must complete below 350ms
    'http_req_failed': ['rate<0.02'],                // Error rate must be under 2%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://ia.adminic.com.br';
const API_URL = __ENV.API_URL || 'https://adminic-tech.onrender.com/api/v1';
const TENANT_SLUG = 'barbearia-campelo';

export default function () {
  // 1. SCENARIO: Get Tenant Catalog & Services
  group('1. Carregar Catálogo e Identidade Visual', function () {
    const resTenant = http.get(`${API_URL}/tenants/${TENANT_SLUG}`);
    check(resTenant, {
      'Tenant carregado (200)': (r) => r.status === 200,
      'Tenant possui nome e cores': (r) => {
        const body = JSON.parse(r.body);
        return body.name && body.primary_color;
      },
    });

    const resCatalog = http.get(`${API_URL}/tenants/${TENANT_SLUG}/catalog`);
    check(resCatalog, {
      'Catálogo carregado (200)': (r) => r.status === 200,
      'Contém categorias e serviços': (r) => {
        const body = JSON.parse(r.body);
        return body.categories.length > 0 && body.services.length > 0;
      },
    });
  });

  sleep(1);

  // 2. SCENARIO: Calculate Availability for Next Friday
  group('2. Consulta de Disponibilidade em Tempo Real', function () {
    const targetDate = '2026-08-21'; // Próxima data útil
    const start = Date.now();
    const resAvail = http.get(
      `${API_URL}/tenants/${TENANT_SLUG}/availability?date=${targetDate}&staff_id=stf-julio-sousa&duration_minutes=45`
    );
    availabilityTrend.add(Date.now() - start);

    if (resAvail.status === 429) {
      rateLimitHits.add(1);
    } else {
      check(resAvail, {
        'Disponibilidade OK (200)': (r) => r.status === 200,
        'Slots retornados com sucesso': (r) => {
          const body = JSON.parse(r.body);
          return Array.isArray(body.slots);
        },
      });
    }
  });

  sleep(1);

  // 3. SCENARIO: Create Appointment (Load Booking Mutation)
  group('3. Criação de Agendamento Simulado', function () {
    const payload = JSON.stringify({
      service_id: 'srv-corte-moderno',
      staff_id: 'stf-julio-sousa',
      appointment_date: '2026-08-21',
      start_time: '14:00',
      customer_name: `Cliente Carga ${__VU}`,
      customer_phone: '92984899955',
      customer_email: `cliente.carga.${__VU}.${__ITER}@teste.com`,
      payment_method: 'venue',
      notes: 'Teste automatizado de carga k6',
    });

    const headers = { 'Content-Type': 'application/json' };
    const resBooking = http.post(`${API_URL}/tenants/${TENANT_SLUG}/appointments`, payload, { headers });

    if (resBooking.status === 429) {
      rateLimitHits.add(1);
    } else if (resBooking.status === 409) {
      // 409 Conflict é esperado quando múltiplos usuários escolhem o mesmo horário exatamente
      check(resBooking, {
        'Conflito de Horário Gerenciado (409)': (r) => r.status === 409,
      });
    } else {
      check(resBooking, {
        'Agendamento Criado (200 ou 201)': (r) => r.status === 200 || r.status === 201,
        'Voucher Emitido': (r) => {
          const body = JSON.parse(r.body);
          return body.voucher_code && body.voucher_code.startsWith('ADM-');
        },
      });
    }
  });

  sleep(2);
}
