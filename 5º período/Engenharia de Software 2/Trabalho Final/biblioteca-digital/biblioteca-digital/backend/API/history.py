# backend/API/history.py
import os
import sqlite3
import logging
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api", tags=["history"])

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# path relativo para o DB (assume backend/ como BASE)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # sobe de API/ para backend/
DB = os.path.join(BASE_DIR, "Banco de dados", "data.db")


def db_conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def safe_parse_iso(v):
    if not v:
        return None
    if isinstance(v, str):
        try:
            return datetime.fromisoformat(v)
        except Exception:
            # tenta formatos simples
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    return datetime.strptime(v, fmt)
                except Exception:
                    continue
    return None


@router.get("/history")
def get_history(limit: int = Query(200, ge=1, le=2000), kind: str = Query(None, regex="^(loans|reservations|all)$")) -> List[Dict[str, Any]]:
    """
    Retorna lista combinada de empréstimos + reservas (mais recentes primeiro).
    Query params:
      - limit: máximo de registros (default 200) -> aplicado ao total combinado
      - kind: 'loans' | 'reservations' | 'all' (default all)
    Cada item terá campos: kind ('loan'|'reservation'), id, book_id, book_title, user_id, username, borrowed_at/reserved_at, due_at, returned_at, active, status
    """

    conn = None
    out = []
    try:
        conn = db_conn()
        cur = conn.cursor()

        # ===== loans =====
        if kind in (None, "all", "loans"):
            cur.execute("""
              SELECT l.id as loan_id, l.user_id, u.name as username, l.book_id, b.title as book_title,
                     l.borrowed_at, l.due_at, l.returned_at
              FROM loans l
              LEFT JOIN users u ON l.user_id = u.id
              LEFT JOIN books b ON l.book_id = b.id
              ORDER BY COALESCE(l.borrowed_at, '') DESC
              LIMIT ?
            """, (limit,))
            rows = cur.fetchall()
            for r in rows:
                status = "Concluido" if r["returned_at"] else "Emprestado"
                if not r["returned_at"] and r["due_at"]:
                    try:
                        due_dt = datetime.fromisoformat(r["due_at"])
                        if due_dt < datetime.utcnow():
                            status = "Atrasado"
                    except Exception:
                        pass
                out.append({
                    "kind": "loan",
                    "id": r["loan_id"],
                    "book_id": r["book_id"],
                    "book_title": r["book_title"] or "",
                    "user_id": r["user_id"],
                    "username": r["username"] or "",
                    "borrowed_at": r["borrowed_at"],
                    "due_at": r["due_at"],
                    "returned_at": r["returned_at"],
                    "status": status
                })

        # ===== reservations =====
        if kind in (None, "all", "reservations"):
            cur.execute("""
              SELECT r.id as res_id, r.user_id, u.name as username, r.book_id, b.title as book_title,
                     r.reserved_at, r.active
              FROM reservations r
              LEFT JOIN users u ON r.user_id = u.id
              LEFT JOIN books b ON r.book_id = b.id
              ORDER BY COALESCE(r.reserved_at, '') DESC
              LIMIT ?
            """, (limit,))
            rows = cur.fetchall()
            for r in rows:
                active = r["active"]
                try:
                    active_int = int(active) if active is not None else 0
                except Exception:
                    active_int = 1 if active else 0
                status = "Ativa" if active_int == 1 else "Cancelada"
                out.append({
                    "kind": "reservation",
                    "id": r["res_id"],
                    "book_id": r["book_id"],
                    "book_title": r["book_title"] or "",
                    "user_id": r["user_id"],
                    "username": r["username"] or "",
                    "reserved_at": r["reserved_at"],
                    "active": active_int,
                    "status": status
                })

    except Exception as e:
        logger.exception("Erro ao recuperar histórico")
        raise HTTPException(status_code=500, detail="Erro interno ao consultar histórico")
    finally:
        if conn:
            conn.close()

    # Ordena globalmente por data mais recente (tenta usar borrowed_at / reserved_at)
    def date_for(item):
        for k in ("borrowed_at", "reserved_at"):
            if k in item and item[k]:
                d = safe_parse_iso(item[k])
                if d:
                    return d
        return datetime.min

    out_sorted = sorted(out, key=lambda x: date_for(x), reverse=True)

    # aplica o limite global no resultado combinado
    if isinstance(limit, int) and limit > 0:
        out_sorted = out_sorted[:limit]

    return out_sorted
