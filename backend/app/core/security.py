"""
Módulo Central de Segurança, JWT Criptográfico e Defesas OWASP
Conformidade: OWASP Top 10 (A01 Broken Access Control, A03 Injection, A07 Identification and Auth Failures).
"""

import html
import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import jwt
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.domain.entities import UserRole

# Configurações JWT
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
JWT_ISSUER = "adminic.com.br"
SUPER_ADMIN_WHITELIST = {"willyanszbrito@gmail.com"}

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(
    user_id: str,
    email: str,
    role: str,
    name: str = "",
    tenant_slug: Optional[str] = None,
    staff_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Gera um token JWT assinado criptograficamente com HMAC-SHA256 e claims completos.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=JWT_EXPIRATION_HOURS)

    # Força regra estrita: se tentar criar token super_admin para email não autorizado, rebaixa para customer
    normalized_email = email.lower().strip()
    if role == UserRole.SUPER_ADMIN.value and normalized_email not in SUPER_ADMIN_WHITELIST:
        role = UserRole.CUSTOMER.value

    payload: Dict[str, Any] = {
        "sub": user_id,
        "email": normalized_email,
        "name": name,
        "role": role,
        "tenant_slug": tenant_slug,
        "staff_id": staff_id,
        "iss": JWT_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }

    encoded_jwt = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodifica e valida a assinatura e expiração do token JWT.
    Lança HTTPException em caso de token inválido ou expirado.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            issuer=JWT_ISSUER,
            options={"verify_exp": True, "verify_iss": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão expirada. Por favor, autentique-se novamente.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação inválido ou corrompido.",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[Dict[str, Any]]:
    """Extrai o usuário autenticado se o token for fornecido, ou retorna None para rotas públicas."""
    if not auth or not auth.credentials:
        return None
    try:
        return decode_access_token(auth.credentials)
    except HTTPException:
        return None

async def get_current_user_required(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """Exige token JWT válido para prosseguir."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação obrigatória para acessar este recurso.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return decode_access_token(auth.credentials)

def require_roles(allowed_roles: List[str]):
    """Fábrica de dependências para validação de RBAC."""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user_required)):
        user_role = current_user.get("role")
        user_email = current_user.get("email", "").lower().strip()

        # Super admin autorizado passa em qualquer rota
        if user_role == UserRole.SUPER_ADMIN.value and user_email in SUPER_ADMIN_WHITELIST:
            return current_user

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso não autorizado."
            )
        return current_user
    return role_checker

async def require_super_admin(current_user: Dict[str, Any] = Depends(get_current_user_required)):
    """Validação estrita e isolada para o Super Admin Global."""
    user_email = current_user.get("email", "").lower().strip()
    user_role = current_user.get("role")

    if user_role != UserRole.SUPER_ADMIN.value or user_email not in SUPER_ADMIN_WHITELIST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso não autorizado."
        )
    return current_user


# ==============================================================================
# DEFESAS OWASP: Higienização de Entradas contra XSS e Injeções
# ==============================================================================

DANGEROUS_PATTERNS = [
    re.compile(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', re.IGNORECASE),
    re.compile(r'javascript:', re.IGNORECASE),
    re.compile(r'onload\s*=', re.IGNORECASE),
    re.compile(r'onerror\s*=', re.IGNORECASE),
    re.compile(r'onclick\s*=', re.IGNORECASE),
    re.compile(r'<iframe', re.IGNORECASE),
    re.compile(r'<embed', re.IGNORECASE),
    re.compile(r'<object', re.IGNORECASE),
]

def sanitize_input_string(value: str) -> str:
    """
    Higieniza strings removendo tags perigosas, scripts maliciosos e caracteres nulos.
    Previne Cross-Site Scripting (XSS) refletido e armazenado.
    """
    if not isinstance(value, str):
        return value
        
    # Remove caracteres de controle nulos
    cleaned = value.replace("\x00", "")
    
    # Remove scripts e handlers perigosos
    for pattern in DANGEROUS_PATTERNS:
        cleaned = pattern.sub("", cleaned)
        
    # Escapa caracteres HTML críticos
    cleaned = html.escape(cleaned, quote=True)
    return cleaned.strip()

def sanitize_phone_number(phone: str) -> str:
    """Mantém apenas dígitos numéricos no telefone."""
    if not phone:
        return ""
    return re.sub(r'\D', '', phone)
