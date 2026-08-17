# Adminic Smart Booking (Plataforma de Agendamento Multi-Tenant)

> **Ecossistema Digital Adminic** — Aplicacao web de agendamento ágil, moderna, responsiva e desacoplada para multiplos parceiros e prestadores de servicos.

Repositorio GitHub: [willyanszbrito/adminic-tech](https://github.com/willyanszbrito/adminic-tech)

---

## 1. Visao Geral do Ecossistema

- **Frontend Web:** `ia.adminic.com.br/:slug_parceiro`
- **Central API e Swagger UI:** `api.adminic.com.br` / `api.adminic.com.br/docs`
- **Zero Hardcode:** 100% dos dados (identidade visual, cores, tipografia, banners, catalogo, profissionais, horarios de funcionamento, regras de intervalo) sao consumidos dinamicamente da API por slug.
- **Fallback Visual:** Utilizacao automatica de placeholders via [placehold.co](https://placehold.co/) para qualquer midia ausente.

---

## 2. Arquitetura de Software (Clean Architecture / Domain-Driven Design)

O backend foi construido em **Python / FastAPI + Pydantic v2**, seguindo a separacao de camadas da Clean Architecture:

```
backend/
├── app/
│   ├── core/                  # Configuracoes globais, CORS, variaveis de ambiente
│   ├── domain/                # Camada de Dominio Pura (Entities, Exceptions, Interfaces)
│   │   ├── entities.py        # Entidades (Tenant, Service, Staff, Appointment, TimeSlot)
│   │   ├── exceptions.py      # Excecoes de Dominio (TenantNotFound, SlotUnavailable, etc.)
│   │   └── interfaces.py      # Interfaces de Repositorio (ITenantRepo, ICatalogRepo, etc.)
│   ├── application/           # Camada de Casos de Uso e DTOs
│   │   ├── dtos.py            # DTOs tipados com schemas OpenAPI e validacao estrita
│   │   └── use_cases.py       # Casos de Uso (Calculo de Slots, Reserva, Conflitos)
│   ├── infrastructure/        # Camada de Infraestrutura e Persistencia
│   │   ├── seed_data.py       # Dados modelo com denominacoes corporativas
│   │   ├── repositories.py    # Implementacao dos repositorios (In-Memory e PostgreSQL)
│   │   └── notification_service.py # Despacho de notificacoes e links externos
│   ├── interfaces/            # Camada de Apresentacao / API
│   │   ├── api/deps.py        # Container de Injecao de Dependencias
│   │   └── api/v1/routes.py   # Controladores REST sob /api/v1/tenants/:slug/...
│   └── main.py                # Ponto de entrada FastAPI com Swagger, JSON e YAML
├── tests/                     # Bateria de testes automatizados (Pytest)
├── Dockerfile                 # Dockerfile preparado para deploy no Koyeb
├── requirements.txt           # Dependencias com FastAPI, Pydantic, PyYAML e SQLAlchemy
└── Leia-me.txt                # Documentacao modular com instrucao para IA
```

---

## 3. Endpoints Principais da API (`/api/v1/tenants/...`)

| Metodo | Rota | Descricao |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check do ecossistema e status dos dominios |
| `GET` | `/openapi.json` | Esquema OpenAPI completo em formato JSON |
| `GET` | `/openapi.yaml` | Esquema OpenAPI completo em formato YAML |
| `GET` | `/api/v1/tenants` | Listagem de todos os parceiros ativos cadastrados |
| `GET` | `/api/v1/tenants/{slug}` | Perfil completo, identidade visual, tema (cores, fontes) e horarios |
| `GET` | `/api/v1/tenants/{slug}/services` | Catalogo de servicos e categorias |
| `GET` | `/api/v1/tenants/{slug}/staff` | Lista de profissionais aptos (com filtro opcional `service_id`) |
| `GET` | `/api/v1/tenants/{slug}/availability` | Calculo de slots disponiveis em tempo real (data, staff, servico) |
| `POST` | `/api/v1/tenants/{slug}/appointments` | Criacao e confirmacao de reserva (valida e-mail obrigatorio) |
| `GET` | `/api/v1/tenants/{slug}/appointments/{code}` | Consulta de agendamento por codigo de voucher |
| `DELETE`| `/api/v1/tenants/{slug}/appointments/{code}` | Cancelamento de agendamento e liberacao do slot |

---

## 4. Design System e Frontend (ia.adminic.com.br)

Construido com **React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion**:
- **Glassmorphism Refinado:** Superficies translucidas (`backdrop-blur`), bordas semi-transparentes suaves e iluminacao em camadas.
- **Suporte a Tema Claro e Escuro (Light / Dark Mode):** Alternancia nativa com preservacao de contraste e variaveis CSS de cada empresa parceira.
- **Spotlight Cursor Glow:** Efeito interativo que acompanha o mouse nos cards.
- **Fluxo de 5 Etapas Guiadas:**
  1. **Selecao de Servico:** Busca instantanea e filtros por categoria.
  2. **Profissional:** "Qualquer Profissional" ou escolha individual por perfil e avaliacoes.
  3. **Data e Horario:** Seletor de 14 dias com slots agrupados em Manha, Tarde e Noite em tempo real.
  4. **Identificacao:** Formulario com validacao de telefone e **E-mail obrigatorio** para envio de voucher.
  5. **Comprovante e Voucher:** Ticket digital com **QR Code**, atalho para **Google Agenda** e acionamento no **WhatsApp**.
- **Simulador Multi-Tenant:**
  - `barbearia-vintage` (*Aura Barber Club* — Dark Amber)
  - `clinica-renova` (*Veritas Clinica Dermatologica* — Cyan e Emerald Clean)
  - `studio-elegance` (*Studio Elegance Estetica e Beleza* — Purple e Rose Luxury)
  - `auto-detail-pro` (*Apex Detail Studio Automotivo* — Electric Blue Tech)

---

## 5. Como Executar Localmente

### 1. Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI YAML: `http://localhost:8000/openapi.yaml`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Acesso Web: `http://localhost:3000/?tenant=barbearia-vintage`

### 3. Executando os Testes
```bash
cd backend
pytest tests -v
```

---

## 6. Deploy e Cloudflare DNS

Consulte o guia completo em [docs/DEPLOYMENT_AND_CLOUDFLARE_GUIDE.md](file:///c:/Adminic/docs/DEPLOYMENT_AND_CLOUDFLARE_GUIDE.md).
