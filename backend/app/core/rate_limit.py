"""
Módulo de Rate Limiting Enterprise (Sliding Window Algorithm)
Em conformidade com OWASP Top 10 - Prevenção contra DoS, Brute-Force e Scraping.
"""

import time
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class SlidingWindowRateLimiter:
    """
    Controlador de taxa de requisições baseado em Janela Deslizante (Sliding Window).
    Thread-safe para execuções assíncronas do FastAPI.
    """
    def __init__(self):
        # Estrutura: { "ip:endpoint_tier": [timestamp1, timestamp2, ...] }
        self._history: Dict[str, List[float]] = {}
        self._last_cleanup = time.time()

    def _cleanup_old_records(self, now: float):
        """Remove registros com mais de 5 minutos para evitar vazamento de memória."""
        if now - self._last_cleanup > 60:
            threshold = now - 300
            for key in list(self._history.keys()):
                self._history[key] = [ts for ts in self._history[key] if ts > threshold]
                if not self._history[key]:
                    del self._history[key]
            self._last_cleanup = now

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int = 60) -> Tuple[bool, int, int]:
        """
        Avalia se a chave atingiu o limite na janela de tempo especificada.
        Retorna: (bloqueado: bool, restantes: int, retry_after: int)
        """
        now = time.time()
        self._cleanup_old_records(now)

        window_start = now - window_seconds
        timestamps = self._history.get(key, [])
        # Filtra timestamps válidos na janela
        valid_timestamps = [ts for ts in timestamps if ts > window_start]

        if len(valid_timestamps) >= max_requests:
            oldest_in_window = valid_timestamps[0]
            retry_after = max(1, int(window_seconds - (now - oldest_in_window)))
            self._history[key] = valid_timestamps
            return True, 0, retry_after

        # Registra a requisição atual
        valid_timestamps.append(now)
        self._history[key] = valid_timestamps
        remaining = max_requests - len(valid_timestamps)
        return False, remaining, 0

# Instância Singleton
rate_limiter = SlidingWindowRateLimiter()

def get_client_ip(request: Request) -> str:
    """Extrai o IP real do cliente suportando Cloudflare e proxies reversos."""
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.strip()
    
    xff = request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()
        
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware global de limitação de taxa por camadas (Tiers).
    """
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        method = request.method

        # 1. Isenção de Healthchecks, Documentação e Testes Automatizados
        if (
            path in ["/", "/health", "/favicon.ico"]
            or path.startswith("/docs")
            or path.startswith("/redoc")
            or path.startswith("/openapi")
            or (request.client and request.client.host == "testclient")
        ):
            return await call_next(request)

        ip = get_client_ip(request)

        # 2. Definição do Tier por sensibilidade do endpoint
        if "/auth" in path or "/login" in path:
            tier = "AUTH"
            limit = 15  # 15 tentativas/min (Anti brute-force)
            window = 60
        elif "/payments" in path or (method in ["POST", "PUT", "DELETE"] and "/appointments" in path):
            tier = "MUTATION"
            limit = 40  # 40 operações/min
            window = 60
        elif "/super-admin" in path:
            tier = "ADMIN"
            limit = 60  # 60 requisições/min
            window = 60
        else:
            tier = "PUBLIC_READ"
            limit = 180  # 180 requisições/min (Catálogo, disponibilidade)
            window = 60

        rate_key = f"{ip}:{tier}"
        blocked, remaining, retry_after = rate_limiter.is_rate_limited(rate_key, limit, window)

        if blocked:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Too Many Requests",
                    "detail": f"Limite de requisições excedido para a camada {tier}. Tente novamente em {retry_after} segundos.",
                    "tier": tier,
                    "retry_after_seconds": retry_after
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(retry_after)
                }
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
