# books.py — Versão completa (Google Books + mesclagem com DB SQLite local para ratings / agregados)
import time
import logging
import math
import os
import sqlite3
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from starlette.concurrency import run_in_threadpool

router = APIRouter(prefix="/api/books", tags=["books"])

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1"
GOOGLE_BOOKS_KEY = os.environ.get("GOOGLE_BOOKS_KEY", None)

# caminho para o DB local (ajuste se necessário; pode vir de ENV)
DB_PATH = os.environ.get("LOCAL_DB_PATH", "Banco de dados/data.db")

# caches simples em memória
_CACHE_TTL = 60 * 60  # 1 hora
_search_cache: Dict[str, Dict[str, Any]] = {}
_volume_cache: Dict[str, Dict[str, Any]] = {}

# cache de imagens com LRU (limitado para não explodir memória)
_IMAGE_CACHE_LIMIT = 100
_image_cache: Dict[str, Dict[str, Any]] = {}

# util helpers
def _now() -> float:
    return time.time()

def _is_valid_cache(entry: Dict[str, Any]) -> bool:
    return bool(entry) and ("ts" in entry) and (_now() - entry["ts"] < _CACHE_TTL)

def _cache_set(cache: Dict, key: str, value: Any):
    cache[key] = {"ts": _now(), "value": value}

def _image_cache_set(key: str, value: Any):
    """
    LRU simples: se o cache tiver mais que _IMAGE_CACHE_LIMIT imagens, remove a mais antiga.
    """
    if len(_image_cache) >= _IMAGE_CACHE_LIMIT:
        oldest_key = min(_image_cache, key=lambda k: _image_cache[k]["ts"])
        _image_cache.pop(oldest_key, None)
    _image_cache[key] = {"ts": _now(), "value": value}

async def _http_get_json(client: httpx.AsyncClient, url: str, params: dict = None, timeout: float = 10.0) -> dict:
    resp = await client.get(url, params=params, timeout=timeout)
    resp.raise_for_status()
    return resp.json()

async def _http_get_stream(url: str, timeout: float = 20.0) -> httpx.Response:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp

def _map_volume_item(item: dict) -> dict:
    """Extrai campos relevantes do item retornado pelo Google Books"""
    vol_info = item.get("volumeInfo", {}) or {}
    image_links = vol_info.get("imageLinks", {}) or {}
    thumbnail = image_links.get("thumbnail") or image_links.get("smallThumbnail") or item.get("thumbnail")
    return {
        "id": item.get("id"),
        "title": vol_info.get("title"),
        "subtitle": vol_info.get("subtitle"),
        "authors": vol_info.get("authors") or [],
        "publisher": vol_info.get("publisher"),
        "publishedDate": vol_info.get("publishedDate"),
        "description": vol_info.get("description"),
        "pageCount": vol_info.get("pageCount"),
        "categories": vol_info.get("categories") or [],
        "averageRating": vol_info.get("averageRating"),
        "ratingsCount": vol_info.get("ratingsCount"),
        "language": vol_info.get("language"),
        "previewLink": vol_info.get("previewLink"),
        "infoLink": vol_info.get("infoLink"),
        "thumbnail": thumbnail,
        "volumeInfo": vol_info,  # mantemos para compatibilidade com frontend map
    }

# -----------------
# Local DB helpers (síncronos, usados via run_in_threadpool)
# -----------------
def _fetch_local_book_by_id(volume_id: str) -> Optional[Dict[str, Any]]:
    """
    Retorna campos agregados do banco local para o volume_id.
    Retorna None se não encontrado ou erro.
    Observação: os IDs devem corresponder entre Google volume.id e books.id no DB local
    (ou você deve armazenar o google_id no seu DB para casar).
    """
    if not os.path.exists(DB_PATH):
        return None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("""
            SELECT id,
                   pages AS pageCount,
                   avg_rating AS averageRating,
                   review_count AS ratingsCount,
                   total_copies,
                   available,
                   description
            FROM books
            WHERE id = ?
        """, (volume_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        return {
            "id": row["id"],
            "pageCount": row["pageCount"],
            "averageRating": row["averageRating"],
            "ratingsCount": row["ratingsCount"],
            "total_copies": row["total_copies"],
            "available": row["available"],
            "description": row["description"],
        }
    except Exception:
        logger.exception("Erro lendo banco local")
        return None

def _fetch_locals_batch(ids_list: List[str]) -> Dict[str, Dict[str, Any]]:
    """
    Busca em lote (WHERE id IN (...)) registros locais para acelerar mesclagem em /search.
    Retorna mapa id -> dados.
    """
    out: Dict[str, Dict[str, Any]] = {}
    if not ids_list:
        return out
    if not os.path.exists(DB_PATH):
        return out
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        qmarks = ",".join("?" for _ in ids_list)
        cur.execute(f"""
            SELECT id,
                   pages AS pageCount,
                   avg_rating AS averageRating,
                   review_count AS ratingsCount,
                   total_copies,
                   available,
                   description
            FROM books
            WHERE id IN ({qmarks})
        """, ids_list)
        rows = cur.fetchall()
        conn.close()
        for r in rows:
            out[r["id"]] = {
                "pageCount": r["pageCount"],
                "averageRating": r["averageRating"],
                "ratingsCount": r["ratingsCount"],
                "total_copies": r["total_copies"],
                "available": r["available"],
                "description": r["description"],
            }
    except Exception:
        logger.exception("Erro no batch local")
    return out

# -----------------
# ROUTES
# -----------------

@router.get("/search")
async def search_books(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(40, ge=1, le=1000),
):
    """
    Busca livros via Google Books com paginação.
    Mescla (quando possível) com dados do DB local para trazer averageRating / ratingsCount / available.
    """
    q = q.strip()[:150]

    MAX_PER_REQ = 40
    MAX_ALLOWED = 1000
    per_page = min(int(per_page), MAX_ALLOWED)

    cache_key = f"search::{q}::page={page}::per_page={per_page}"
    if cache_key in _search_cache and _is_valid_cache(_search_cache[cache_key]):
        return JSONResponse(content=_search_cache[cache_key]["value"])

    offset = (page - 1) * per_page
    url = f"{GOOGLE_BOOKS_BASE}/volumes"

    params_first = {"q": q, "startIndex": offset, "maxResults": min(per_page, MAX_PER_REQ)}
    if GOOGLE_BOOKS_KEY:
        params_first["key"] = GOOGLE_BOOKS_KEY

    items_acc: List[dict] = []
    total_items = 0

    async with httpx.AsyncClient() as client:
        try:
            first_data = await _http_get_json(client, url, params=params_first)
        except Exception:
            logger.exception("Erro na primeira requisição ao Google Books")
            raise HTTPException(status_code=500, detail="Erro ao acessar Google Books")

        total_items = int(first_data.get("totalItems", 0) or 0)
        first_items = first_data.get("items") or []
        items_acc.extend([_map_volume_item(it) for it in first_items])

        remaining = per_page - len(first_items)
        next_start = offset + len(first_items)

        while remaining > 0 and next_start < total_items:
            chunk_size = min(remaining, MAX_PER_REQ)
            params_chunk = {"q": q, "startIndex": next_start, "maxResults": chunk_size}
            if GOOGLE_BOOKS_KEY:
                params_chunk["key"] = GOOGLE_BOOKS_KEY

            try:
                chunk_data = await _http_get_json(client, url, params=params_chunk)
            except Exception:
                logger.exception("Erro ao buscar chunk do Google Books")
                break

            chunk_items = chunk_data.get("items") or []
            items_acc.extend([_map_volume_item(it) for it in chunk_items])

            fetched = len(chunk_items)
            if fetched == 0:
                break

            remaining -= fetched
            next_start += fetched

    result_items = items_acc[:per_page]

    # batch merge: busca dados locais para IDs encontrados
    ids = [it["id"] for it in result_items if it.get("id")]
    local_map: Dict[str, Dict[str, Any]] = {}
    if ids:
        try:
            local_map = await run_in_threadpool(_fetch_locals_batch, ids)
        except Exception:
            logger.exception("Erro ao buscar dados locais em batch")

    # mesclagem: preferir dados locais quando presentes
    for it in result_items:
        lid = it.get("id")
        local = local_map.get(lid)
        if local:
            if local.get("pageCount") is not None:
                it["pageCount"] = local.get("pageCount")
            if local.get("averageRating") is not None:
                it["averageRating"] = local.get("averageRating")
            if local.get("ratingsCount") is not None:
                it["ratingsCount"] = local.get("ratingsCount")
            if local.get("available") is not None:
                it["available"] = local.get("available")
            if local.get("description"):
                it["description"] = local.get("description")
            # attach local snapshot for front-end if needed
            it["_local"] = local

    total_pages = max(1, math.ceil(total_items / per_page)) if per_page else 1

    payload = {
        "totalItems": total_items,
        "items": result_items,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

    _cache_set(_search_cache, cache_key, payload)
    return JSONResponse(content=payload)

@router.get("/{volume_id}")
async def get_volume(volume_id: str):
    """
    Retorna detalhe de um volume específico (Google Books + dados locais mesclados).
    """
    cache_key = f"volume::{volume_id}"

    if cache_key in _volume_cache and _is_valid_cache(_volume_cache[cache_key]):
        return JSONResponse(content=_volume_cache[cache_key]["value"])

    url = f"{GOOGLE_BOOKS_BASE}/volumes/{volume_id}"
    params = {}
    if GOOGLE_BOOKS_KEY:
        params["key"] = GOOGLE_BOOKS_KEY

    try:
        async with httpx.AsyncClient() as client:
            data = await _http_get_json(client, url, params=params)
    except Exception:
        logger.exception("Erro ao buscar volume")
        raise HTTPException(status_code=404, detail="Volume não encontrado")

    mapped = _map_volume_item(data)

    try:
        local = await run_in_threadpool(_fetch_local_book_by_id, volume_id)
    except Exception:
        logger.exception("Erro ao buscar dados locais para volume")
        local = None

    if local:
        if local.get("pageCount") is not None:
            mapped["pageCount"] = local.get("pageCount")
        if local.get("averageRating") is not None:
            mapped["averageRating"] = local.get("averageRating")
        if local.get("ratingsCount") is not None:
            mapped["ratingsCount"] = local.get("ratingsCount")
        if local.get("total_copies") is not None:
            mapped["total_copies"] = local.get("total_copies")
        if local.get("available") is not None:
            mapped["available"] = local.get("available")
        if local.get("description"):
            mapped["description"] = local.get("description")
        mapped["_local"] = local

    _cache_set(_volume_cache, cache_key, mapped)
    return JSONResponse(content=mapped)

@router.get("/{volume_id}/local")
async def get_local_only(volume_id: str):
    """
    Retorna apenas os dados do DB local (ou 404 se não existir).
    Endpoint útil para frontend que chama /api/books/{id}/local.
    """
    try:
        local = await run_in_threadpool(_fetch_local_book_by_id, volume_id)
    except Exception:
        logger.exception("Erro ao buscar dados locais para volume (local-only)")
        local = None

    if not local:
        raise HTTPException(status_code=404, detail="Local record not found")

    payload = {
        "id": volume_id,
        "pageCount": local.get("pageCount"),
        "averageRating": local.get("averageRating"),
        "ratingsCount": local.get("ratingsCount"),
        "total_copies": local.get("total_copies"),
        "available": local.get("available"),
        "description": local.get("description"),
    }
    return JSONResponse(content=payload)

@router.get("/thumbnail/{volume_id}")
async def proxy_thumbnail(volume_id: str):
    """
    Proxy da thumbnail: busca informação do volume e retorna a imagem.
    """
    cache_key = f"volume::{volume_id}"
    volume = None

    if cache_key in _volume_cache and _is_valid_cache(_volume_cache[cache_key]):
        volume = _volume_cache[cache_key]["value"]
    else:
        url = f"{GOOGLE_BOOKS_BASE}/volumes/{volume_id}"
        params = {}
        if GOOGLE_BOOKS_KEY:
            params["key"] = GOOGLE_BOOKS_KEY
        try:
            async with httpx.AsyncClient() as client:
                data = await _http_get_json(client, url, params=params)
        except Exception:
            logger.exception("Erro ao consultar volume para thumbnail")
            raise HTTPException(status_code=404, detail="Volume não encontrado")

        volume = _map_volume_item(data)
        _cache_set(_volume_cache, cache_key, volume)

    thumbnail_url = volume.get("thumbnail")
    if not thumbnail_url:
        raise HTTPException(status_code=404, detail="Thumbnail não encontrada")

    img_cache_key = f"img::{thumbnail_url}"

    if img_cache_key in _image_cache and _is_valid_cache(_image_cache[img_cache_key]):
        cached = _image_cache[img_cache_key]["value"]
        return StreamingResponse(
            iter([cached["body"]]),
            media_type=cached["content_type"],
            headers={"Cache-Control": "public, max-age=3600"}
        )

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(thumbnail_url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg")
            body = resp.content
    except Exception:
        logger.exception("Erro ao baixar imagem")
        raise HTTPException(status_code=502, detail="Falha ao recuperar imagem externa")

    _image_cache_set(img_cache_key, {"content_type": content_type, "body": body})

    return StreamingResponse(
        iter([body]),
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=3600"}
    )
