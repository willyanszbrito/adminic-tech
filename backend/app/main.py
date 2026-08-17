from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import yaml
from app.core.config import settings
from app.interfaces.api.v1.routes import router as api_v1_router
from app.domain.exceptions import DomainException

app = FastAPI(
    title="Adminic Smart Booking API (Multi-Tenant)",
    description="""
# Ecossistema Adminic - Plataforma de Agendamento Multi-Tenant

API Central de Agendamento para parceiros, prestadores de servicos, clinicas e servicos especializados.

## Recursos Principais:
- Isolamento Logico Multi-Tenant via rota base (/api/v1/tenants/:slug/...).
- Zero Hardcode: Identidade visual, cores, tipografia, catalogo e profissionais dinamicos.
- Calculo de Disponibilidade em Tempo Real com bloqueio de sobreposicoes.
- Documentacao OpenAPI 3.0 via Swagger UI (/docs), ReDoc (/redoc), JSON (/openapi.json) e YAML (/openapi.yaml).
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "api_domain": settings.API_DOMAIN,
        "app_domain": settings.APP_DOMAIN,
        "database": "postgresql" if settings.DATABASE_URL else "in_memory"
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
