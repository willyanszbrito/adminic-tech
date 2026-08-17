# Guia de Infraestrutura, DNS Cloudflare e Hospedagem em Producao

Este documento apresenta o guia passo a passo para colocar a plataforma de agendamento multi-tenant da **Adminic** em producao sob os subdominios oficiais:
- **Frontend Web:** `ia.adminic.com.br/:slug_parceiro`
- **Central API e Swagger:** `api.adminic.com.br`

Repositorio oficial no GitHub: [willyanszbrito/adminic-tech](https://github.com/willyanszbrito/adminic-tech)

---

## 1. Topologia da Arquitetura

```mermaid
flowchart TD
    User["Cliente / Navegador Web"] -->|HTTPS ia.adminic.com.br/:slug| CF["Cloudflare Edge (WAF + CDN + SSL Full Strict)"]
    CF -->|ia.adminic.com.br| Pages["Cloudflare Pages / Vercel (Frontend React SPA)"]
    CF -->|api.adminic.com.br| BackendHost["Koyeb / Render / Docker Host (FastAPI Central)"]
    BackendHost -->|Persistencia Multi-Tenant| DB[("Neon / Supabase PostgreSQL")]
```

---

## 2. Configuracao de DNS na Cloudflare

No painel de controle da Cloudflare para a zona `adminic.com.br`:

### Tabela de Registros DNS:

| Tipo | Nome (Host) | Destino / Alvo | Status do Proxy | TTL | Finalidade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `ia` | `<seu-projeto>.pages.dev` ou `cname.vercel-dns.com` | Ativado (Nuvem Laranja) | Auto | Frontend Web Multi-Tenant |
| **CNAME** | `api` | `<app>.koyeb.app` ou `<servico>.onrender.com` | Ativado (Nuvem Laranja) | Auto | API Central e Swagger Docs |
| **CNAME** | `app` | `<app-destino>.pages.dev` | Ativado (Nuvem Laranja) | Auto | Modulo de Ferramentas e Automacoes |

### Configuracoes Recomendadas de Seguranca e SSL:
1. **SSL/TLS Encryption Mode:** Definir como **Full (Strict)**.
2. **Always Use HTTPS:** Ativado (**ON**).
3. **Automatic HTTPS Rewrites:** Ativado (**ON**).
4. **Minimum TLS Version:** TLS 1.2 ou superior.
5. **WebSockets:** Habilitado.

---

## 3. Deploy do Frontend no Cloudflare Pages

1. No painel da **Cloudflare Pages**, conecte o repositorio GitHub `willyanszbrito/adminic-tech`.
2. Parametros de Build:
   - **Framework Preset:** `Vite`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Variaveis de Ambiente no Cloudflare Pages:
   ```env
   VITE_API_URL=https://api.adminic.com.br/api/v1
   ```
4. Na aba **Custom Domains**, vincule o subdominio `ia.adminic.com.br`.

---

## 4. Deploy do Backend no Koyeb ou Render

### Opcao A: Koyeb (Recomendado via Docker)
1. Crie uma nova aplicacao no [Koyeb](https://www.koyeb.com).
2. Conecte o repositorio GitHub `willyanszbrito/adminic-tech`.
3. Selecione a pasta `backend/` e o `Dockerfile`.
4. Defina as variaveis de ambiente:
   ```env
   ENVIRONMENT=production
   API_DOMAIN=api.adminic.com.br
   APP_DOMAIN=ia.adminic.com.br
   PORT=8000
   DATABASE_URL=postgresql://user:password@host.aws.neon.tech/adminic_booking?sslmode=require
   CORS_ORIGINS=["https://ia.adminic.com.br","https://adminic.com.br","*"]
   ```
5. No painel de portas, exponha a porta `8000` (HTTP).
6. Vincule o dominio customizado `api.adminic.com.br`.

### Opcao B: Render
1. Crie um **Web Service** no Render apontando para o diretorio `backend`.
2. Configure o comando de build `pip install -r requirements.txt` e start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Configure a variavel `DATABASE_URL` e `CORS_ORIGINS`.

---

## 5. Estrategia de Persistencia e Banco de Dados

- **Ambiente Local / Demonstracao:** Repositorio em memoria com dados enriquecidos e isolamento por tenant.
- **Ambiente em Nuvem:** Leitura automatica da variavel `DATABASE_URL` conectando ao PostgreSQL gerenciado (Neon ou Supabase), mantendo o isolamento logico estrito por `tenant_id`.

---

## 6. Endpoints de Validacao em Producao

Apos o deploy:
- **Health Check:** `https://api.adminic.com.br/health` -> `{"status": "healthy"}`
- **Swagger UI:** `https://api.adminic.com.br/docs`
- **ReDoc:** `https://api.adminic.com.br/redoc`
- **OpenAPI Schema (JSON):** `https://api.adminic.com.br/openapi.json`
- **OpenAPI Schema (YAML):** `https://api.adminic.com.br/openapi.yaml`
- **Frontend SPA:** `https://ia.adminic.com.br/barbearia-vintage`
