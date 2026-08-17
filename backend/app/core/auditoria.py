import os
import sqlite3
import json
import uuid
import hashlib
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, Union
from fastapi import Request

try:
    from zoneinfo import ZoneInfo
    TZ_MANAUS = ZoneInfo("America/Manaus")
except Exception:
    TZ_MANAUS = timezone.utc

logger = logging.getLogger("AdminicAudit")

DB_DIR = Path(__file__).resolve().parents[2] / "data"
DB_PATH = DB_DIR / "auditoria.db"

def get_audit_db() -> sqlite3.Connection:
    """Obtém conexão com o banco de auditoria SQLite isolado."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_audit_db():
    """Inicializa a tabela de auditoria com encadeamento de hash SHA-256 (Blockchain-style)."""
    with get_audit_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS trilha_auditoria (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            usuario TEXT NOT NULL,
            acao TEXT NOT NULL,
            tipo TEXT NOT NULL,
            detalhes TEXT,
            tenant_slug TEXT,
            recurso_id TEXT,
            canal TEXT NOT NULL DEFAULT 'API_REST',
            ip_origem TEXT,
            user_agent TEXT,
            status_code INTEGER,
            hash_integridade TEXT NOT NULL
        )
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON trilha_auditoria(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_usuario ON trilha_auditoria(usuario)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_tenant ON trilha_auditoria(tenant_slug)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_acao ON trilha_auditoria(acao)")
        conn.commit()

# Inicializa tabela na importação
try:
    init_audit_db()
except Exception as e:
    logger.error(f"[AUDITORIA INIT ERROR] {e}")

def registrar_auditoria(
    acao: str,
    tipo: str,
    usuario: str = "Anonimo",
    detalhes: Union[str, Dict[str, Any], list] = "",
    tenant_slug: Optional[str] = None,
    recurso_id: Optional[str] = None,
    canal: str = "API_REST",
    ip_origem: Optional[str] = None,
    user_agent: Optional[str] = None,
    status_code: Optional[int] = 200,
    request: Optional[Request] = None
) -> Optional[str]:
    """
    Registra um evento com integridade criptográfica SHA-256 encadeada.
    Fail-safe: Nunca derruba a requisição principal se houver falha de log.
    """
    try:
        # Extração de IP e User-Agent caso request seja fornecido
        if request is not None:
            if not ip_origem:
                ip_origem = (
                    request.headers.get("CF-Connecting-IP") or
                    request.headers.get("X-Forwarded-For") or
                    (request.client.host if request.client else None)
                )
                if ip_origem and "," in ip_origem:
                    ip_origem = ip_origem.split(",")[0].strip()

            if not user_agent:
                user_agent = request.headers.get("User-Agent", "Desconhecido")

        # Timezone Manaus / Brasil
        agora = datetime.now(TZ_MANAUS)
        
        rec_id = str(uuid.uuid4())
        ts = agora.isoformat()
        
        if isinstance(detalhes, (dict, list)):
            detalhes_str = json.dumps(detalhes, ensure_ascii=False)
        else:
            detalhes_str = str(detalhes)

        conn = get_audit_db()
        try:
            cursor = conn.cursor()
            
            # Obtém o hash do registro anterior para manter o encadeamento imutável
            cursor.execute("SELECT hash_integridade FROM trilha_auditoria ORDER BY timestamp DESC, rowid DESC LIMIT 1")
            row = cursor.fetchone()
            hash_anterior = row[0] if (row and row[0]) else "ADMINIC_GENESIS_SECURITY_HASH_2026"
            
            # Calcula novo SHA-256 encadeado
            data_to_hash = (
                str(hash_anterior) +
                str(rec_id) +
                str(ts) +
                str(usuario) +
                str(acao) +
                str(tipo) +
                str(detalhes_str) +
                str(tenant_slug or "") +
                str(recurso_id or "") +
                str(canal) +
                str(ip_origem or "") +
                str(user_agent or "") +
                str(status_code or "")
            )
            novo_hash = hashlib.sha256(data_to_hash.encode("utf-8")).hexdigest()
            
            cursor.execute("""
                INSERT INTO trilha_auditoria (
                    id, timestamp, usuario, acao, tipo, detalhes,
                    tenant_slug, recurso_id, canal, ip_origem, user_agent, status_code, hash_integridade
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rec_id, ts, str(usuario), str(acao), str(tipo), detalhes_str,
                str(tenant_slug) if tenant_slug else None,
                str(recurso_id) if recurso_id else None,
                str(canal),
                str(ip_origem) if ip_origem else None,
                str(user_agent) if user_agent else None,
                status_code,
                novo_hash
            ))
            conn.commit()
            return novo_hash
        finally:
            conn.close()
    except Exception as e:
        logger.error(f"[AUDITORIA ERROR] Falha ao registrar log de auditoria: {e}")
        return None
