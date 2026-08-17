import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import yaml
from app.core.config import settings
from app.core.auditoria import registrar_auditoria
from app.core.rate_limit import RateLimitMiddleware
from app.interfaces.api.v1.routes import router as api_v1_router
from app.domain.exceptions import DomainException

app = FastAPI(
    title="Adminic Smart Booking API (Multi-Tenant)",
    description="""
# Ecossistema Adminic - Plataforma de Agendamento Multi-Tenant

API Central de Agendamento para parceiros, prestadores de serviços, clínicas e serviços especializados.

## Recursos Principais:
- Isolamento Lógico Multi-Tenant via rota base (/api/v1/tenants/:slug/...).
- Zero Hardcode: Identidade visual, cores, tipografia, catálogo e profissionais dinâmicos.
- Cálculo de Disponibilidade em Tempo Real com bloqueio de sobreposições.
- Trilha de Auditoria com Hash Criptográfico SHA-256 e RBAC Rigoroso.
- Rate Limiting e Defesa Ativa OWASP Top 10.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 1. Rate Limiting Middleware (OWASP Protection)
app.add_middleware(RateLimitMiddleware)

# 2. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de Segurança e Auditoria Criptográfica
@app.middleware("http")
async def security_and_audit_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Processa requisição
    response: Response = await call_next(request)
    
    process_time = time.time() - start_time
    
    # 1. Ocultação de Stack Tecnológica & Headers de Segurança Enterprise (OWASP)
    response.headers["Server"] = "Adminic-Shield-Gateway/2026"
    if "X-Powered-By" in response.headers:
        del response.headers["X-Powered-By"]
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self' https://ia.adminic.com.br https://adminic.com.br; "
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https: blob:; "
        "connect-src 'self' https://ia.adminic.com.br https://adminic-tech.onrender.com https://api.adminic.com.br https://accounts.google.com http://localhost:8000; "
        "frame-src https://accounts.google.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
    response.headers["X-Response-Time-Ms"] = f"{process_time * 1000:.2f}"
    
    # 2. Trilha de Auditoria Automática (ignora endpoints estáticos de documentação)
    path = request.url.path
    if not path.startswith("/docs") and not path.startswith("/redoc") and path != "/favicon.ico":
        ip = (
            request.headers.get("CF-Connecting-IP") or
            request.headers.get("X-Forwarded-For") or
            (request.client.host if request.client else "0.0.0.0")
        )
        if ip and "," in ip:
            ip = ip.split(",")[0].strip()
            
        user_agent = request.headers.get("User-Agent", "Desconhecido")
        method = request.method
        status_code = response.status_code
        
        # Extrai autorização se houver
        auth_header = request.headers.get("Authorization", "")
        usuario_id = "Anonimo"
        if auth_header.startswith("Bearer "):
            usuario_id = f"Token-{auth_header[7:15]}..."
            
        # Classifica tipo de ação
        tipo_acao = "READ_API"
        if method in ["POST", "PUT", "PATCH", "DELETE"]:
            tipo_acao = "WRITE_MUTATION"
        if "/super-admin" in path:
            tipo_acao = "SUPER_ADMIN_OPS"
        elif "/admin" in path or "/gestao" in path:
            tipo_acao = "TENANT_MANAGEMENT"
        elif "/auth" in path:
            tipo_acao = "AUTHENTICATION"
        elif "/payments" in path:
            tipo_acao = "PAYMENT_TRANSACTION"
            
        registrar_auditoria(
            acao=f"{method} {path}",
            tipo=tipo_acao,
            usuario=usuario_id,
            detalhes={"tempo_ms": round(process_time * 1000, 2), "status": status_code},
            canal="API_REST",
            ip_origem=ip,
            user_agent=user_agent,
            status_code=status_code,
            request=request
        )

    return response

# Include v1 API router
app.include_router(api_v1_router, prefix="/api/v1", tags=["Agendamento Multi-Tenant"])

@app.get("/openapi.yaml", tags=["Documentacao"], summary="Exportacao do Esquema OpenAPI em formato YAML", include_in_schema=True)
def get_openapi_yaml():
    openapi_schema = app.openapi()
    yaml_content = yaml.dump(openapi_schema, sort_keys=False, allow_unicode=True)
    return Response(content=yaml_content, media_type="application/x-yaml")

@app.get("/health", tags=["Health e Status"], summary="Health Check do Sistema")
def health_check():
    return {
        "status": "healthy",
        "service": "Adminic Smart Booking API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "api_domain": settings.API_DOMAIN,
        "app_domain": settings.APP_DOMAIN
    }

@app.get("/", tags=["Health e Status"], summary="Status e Redirecionamento da API")
def root():
    return {
        "message": "Adminic Smart Booking API is running.",
        "documentation": "/docs",
        "redoc": "/redoc",
        "openapi_json": "/openapi.json",
        "openapi_yaml": "/openapi.yaml",
        "health": "/health"
    }

@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "type": exc.__class__.__name__}
    )
