import os
import logging
from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
from collections import Counter
import sqlite3
from typing import List, Dict, Any, Optional
from io import BytesIO

# Import FPDF
from fpdf import FPDF
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/reports", tags=["reports"])

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
DB = os.path.join(BASE_DIR, "Banco de dados", "data.db")

# ------------------------------------------------------------
# DB CONNECTION
# ------------------------------------------------------------
def db_conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def _maybe_user_filter_sql(user_id: Optional[str]):
    if user_id:
        return (" AND user_id = ? ", [user_id])
    return ("", [])

# ------------------------------------------------------------
# HELPER: LIMPEZA DE TEXTO (CORREÇÃO DO ERRO UNICODE)
# ------------------------------------------------------------
def clean_text(text: str) -> str:
    """
    Remove caracteres que o FPDF/Latin-1 não suporta (como travessão —)
    e substitui por equivalentes simples.
    """
    if not text:
        return ""
    
    # 1. Substituições manuais de caracteres problemáticos comuns
    text = text.replace('\u2013', '-')  # En-dash
    text = text.replace('\u2014', '-')  # Em-dash (O ERRO ESTAVA AQUI)
    text = text.replace('“', '"').replace('”', '"') # Aspas curvas
    text = text.replace("’", "'") # Apóstrofo curvo
    
    # 2. Força codificação Latin-1 (substitui o resto por '?')
    return text.encode('latin-1', 'replace').decode('latin-1')

# ------------------------------------------------------------
# SUMMARY
# ------------------------------------------------------------
@router.get("/summary")
def summary(user_id: Optional[str] = Query(None)) -> Dict[str, int]:
    conn = db_conn()
    cur = conn.cursor()

    where_clause, params = _maybe_user_filter_sql(user_id)

    q = f"SELECT COUNT(*) FROM loans WHERE returned_at IS NULL {where_clause}"
    cur.execute(q, params)
    loans_current = cur.fetchone()[0] or 0

    q = f"SELECT COUNT(*) FROM loans WHERE returned_at IS NULL AND due_at < ? {where_clause}"
    params_overdue = [datetime.utcnow().isoformat()] + params
    cur.execute(q, params_overdue)
    loans_overdue = cur.fetchone()[0] or 0

    q = f"SELECT COUNT(*) FROM reservations WHERE active = 1 {where_clause}"
    cur.execute(q, params)
    reservations_active = cur.fetchone()[0] or 0

    year_start = datetime(datetime.utcnow().year, 1, 1).isoformat()
    q = f"SELECT COUNT(*) FROM read_history WHERE read_at >= ? {where_clause}"
    cur.execute(q, [year_start] + params)
    books_read_year = cur.fetchone()[0] or 0

    conn.close()
    return {
        "loans_current": loans_current,
        "loans_overdue": loans_overdue,
        "reservations_active": reservations_active,
        "books_read_year": books_read_year
    }

# ------------------------------------------------------------
# MONTHLY LOANS
# ------------------------------------------------------------
@router.get("/monthly-loans")
def monthly_loans(user_id: Optional[str] = Query(None)) -> List[Dict[str, int]]:
    conn = db_conn()
    cur = conn.cursor()

    current_year = datetime.utcnow().year
    start_date = f"{current_year}-01-01"

    where_clause, params = _maybe_user_filter_sql(user_id)
    q = f"SELECT read_at FROM read_history WHERE read_at >= ? {where_clause}"
    cur.execute(q, [start_date] + params)
    rows = cur.fetchall()

    counts = Counter()
    for r in rows:
        try:
            val = r[0]
            if val:
                dt = datetime.fromisoformat(val)
                counts[dt.month] += 1
        except Exception:
            pass

    out = [{"month": m, "count": counts.get(m, 0)} for m in range(1, 13)]
    conn.close()
    return out

# ------------------------------------------------------------
# TOP BOOKS
# ------------------------------------------------------------
@router.get("/top-books")
def top_books(
    limit: int = 5,
    user_id: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    conn = db_conn()
    cur = conn.cursor()

    where_clause, params = _maybe_user_filter_sql(user_id)
    q = f"SELECT book_id FROM loans WHERE 1=1 {where_clause}"
    cur.execute(q, params)

    rows = [r["book_id"] for r in cur.fetchall()]
    cnt = Counter(rows)

    top = cnt.most_common(limit)
    out = []
    for book_id, qty in top:
        cur.execute("SELECT title FROM books WHERE id = ?", (book_id,))
        r = cur.fetchone()
        title = r["title"] if r else book_id
        out.append({"title": title, "count": qty})

    conn.close()
    return out

# ------------------------------------------------------------
# DUE SOON
# ------------------------------------------------------------
@router.get("/due-soon")
def due_soon(
    days: int = 7,
    user_id: Optional[str] = Query(None)
) -> List[Dict[str, str]]:
    conn = db_conn()
    cur = conn.cursor()

    limit_date = (datetime.utcnow() + timedelta(days=days)).isoformat()

    where_clause, params = _maybe_user_filter_sql(user_id)
    q = f"""
      SELECT loans.id as loan_id, loans.user_id, books.title, loans.due_at
      FROM loans
      JOIN books ON loans.book_id = books.id
      WHERE loans.returned_at IS NULL AND loans.due_at <= ? {where_clause}
      ORDER BY loans.due_at ASC
      LIMIT 50
    """

    cur.execute(q, [limit_date] + params)
    rows = cur.fetchall()
    out = [{"title": r["title"], "due_date": r["due_at"]} for r in rows]

    conn.close()
    return out

# ------------------------------------------------------------
# EXPORTAR PDF (CORRIGIDO)
# ------------------------------------------------------------
@router.get("/export/pdf")
def export_pdf(user_id: Optional[str] = Query(None)):
    """
    Gera um PDF robusto tratando caracteres especiais (UTF-8 -> Latin-1)
    """
    try:
        # Busca dados
        summary_data = summary(user_id)
        top_books_data = top_books(limit=5, user_id=user_id)
        due_data = due_soon(days=7, user_id=user_id)

        # Cria PDF
        pdf = FPDF()
        pdf.add_page()
        # Margem automática
        pdf.set_auto_page_break(auto=True, margin=15)

        # Cabeçalho
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, clean_text("Relatório da Biblioteca Digital"), new_x="LMARGIN", new_y="NEXT", align='C')
        
        pdf.set_font("Helvetica", size=10)
        datastr = datetime.utcnow().strftime('%d/%m/%Y %H:%M')
        pdf.cell(0, 10, f"Gerado em: {datastr}", new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(5)

        # 1. Resumo
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 10, clean_text("Resumo Geral"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=11)
        
        labels = {
            "loans_current": "Empréstimos Ativos",
            "loans_overdue": "Em Atraso",
            "reservations_active": "Reservas",
            "books_read_year": "Lidos este ano"
        }

        for k, v in summary_data.items():
            label = labels.get(k, k)
            # Aplica clean_text no label para garantir acentos corretos
            pdf.cell(0, 8, f"- {clean_text(label)}: {v}", new_x="LMARGIN", new_y="NEXT")
        
        pdf.ln(5)

        # 2. Top Livros
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 10, clean_text("Livros Mais Populares"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=11)

        if not top_books_data:
            pdf.cell(0, 8, clean_text("Sem dados."), new_x="LMARGIN", new_y="NEXT")
        else:
            for item in top_books_data:
                # AQUI É ONDE O ERRO OCORRIA -> Agora usamos clean_text
                safe_title = clean_text(item['title'])
                count = item['count']
                pdf.cell(0, 8, f"- {safe_title} ({count}x)", new_x="LMARGIN", new_y="NEXT")
        
        pdf.ln(5)

        # 3. Vencimentos
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 10, clean_text("Próximas Devoluções"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", size=11)

        if not due_data:
            pdf.cell(0, 8, clean_text("Nada próximo do vencimento."), new_x="LMARGIN", new_y="NEXT")
        else:
            for item in due_data:
                safe_title = clean_text(item['title'])
                date_str = clean_text(item['due_date'])
                pdf.cell(0, 8, f"- {safe_title} ({date_str})", new_x="LMARGIN", new_y="NEXT")

        # Output
        pdf_bytes = pdf.output()
        
        filename = f"Relatorio_{datetime.now().strftime('%Y%m%d')}.pdf"

        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )

    except Exception as e:
        logger.exception("Erro ao gerar PDF")
        raise HTTPException(status_code=500, detail=str(e))