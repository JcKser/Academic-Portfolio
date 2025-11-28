# books.py (versão paginada, compatível com Google Books limitações)
import time
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
import httpx
import os
import asyncio
import math

router = APIRouter(prefix="/api/books", tags=["books"])

GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1"
# opcional: você pode definir sua API KEY no env var GOOGLE_BOOKS_KEY
GOOGLE_BOOKS_KEY = os.environ.get("GOOGLE_BOOKS_KEY", None)

# caches simples em memória com TTL
_CACHE_TTL = 60 * 60  # 1 hora
_search_cache: Dict[str, Dict[str, Any]] = {}
_volume_cache: Dict[str, Dict[str, Any]] = {}
_image_cache: Dict[str, Dict[str, Any]] = {}

# util helpers
def _now() -> float:
    return time.time()

def _is_valid_cache(entry: Dict[str, Any]) -> bool:
    return entry and ("ts" in entry) and (_now() - entry["ts"] < _CACHE_TTL)

def _cache_set(cache: Dict, key: str, value: Any):
    cache[key] = {"ts": _now(), "value": value}

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
    thumbnail = image_links.get("thumbnail") or image_links.get("smallThumbnail")
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
    }

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
    Parâmetros:
      - q: termo de busca (título, autor, isbn, etc)
      - page: página (1-based)
      - per_page: quantos itens por página (o backend buscará do Google em chunks de 40 quando necessário)
    Retorna:
      { totalItems, items, page, per_page, total_pages }
    """
    # limites e segurança
    MAX_PER_REQ = 40          # Google Books maxResults por requisição
    MAX_ALLOWED = 1000        # limite global que você aceita servir (evitar abuso)
    per_page = min(int(per_page), MAX_ALLOWED)

    cache_key = f"search::{q}::page={page}::per_page={per_page}"
    if cache_key in _search_cache and _is_valid_cache(_search_cache[cache_key]):
        return JSONResponse(content=_search_cache[cache_key]["value"])

    # calculos de índice
    # página 1 -> offset 0
    offset = (page - 1) * per_page
    # o Google usa startIndex e maxResults (maxResults <= 40)
    # se per_page <= 40 podemos fazer 1 requisição; caso contrário faremos várias (em loop/async)
    url = f"{GOOGLE_BOOKS_BASE}/volumes"

    # primeira requisição para obter totalItems (e possivelmente os primeiros resultados)
    params_first = {"q": q, "startIndex": offset, "maxResults": min(per_page, MAX_PER_REQ)}
    if GOOGLE_BOOKS_KEY:
        params_first["key"] = GOOGLE_BOOKS_KEY

    items_acc: List[dict] = []
    total_items = 0

    async with httpx.AsyncClient() as client:
        try:
            first_data = await _http_get_json(client, url, params=params_first)
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail="Erro ao consultar Google Books")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

        total_items = int(first_data.get("totalItems", 0) or 0)
        first_items = first_data.get("items") or []
        items_acc.extend([_map_volume_item(it) for it in first_items])

        # Se o cliente pediu mais do que veio nesta primeira chamada e per_page > MAX_PER_REQ,
        # vamos buscar mais chunks até completar per_page ou até não haver mais resultados.
        remaining = per_page - len(first_items)
        next_start = offset + len(first_items)

        # while loop para buscar os chunks seguintes (sequencial para simplicidade/evitar rate-limit)
        while remaining > 0 and next_start < total_items:
            chunk_size = min(remaining, MAX_PER_REQ)
            params_chunk = {"q": q, "startIndex": next_start, "maxResults": chunk_size}
            if GOOGLE_BOOKS_KEY:
                params_chunk["key"] = GOOGLE_BOOKS_KEY
            try:
                chunk_data = await _http_get_json(client, url, params=params_chunk)
            except httpx.HTTPStatusError as e:
                # se der erro em chunk, paramos e retornamos o que já temos (mas logamos/raise opcional)
                raise HTTPException(status_code=e.response.status_code, detail="Erro ao consultar Google Books (chunk)")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

            chunk_items = chunk_data.get("items") or []
            items_acc.extend([_map_volume_item(it) for it in chunk_items])
            fetched = len(chunk_items)
            if fetched == 0:
                break
            remaining -= fetched
            next_start += fetched

    # recorta exatamente per_page (caso tenhamos recebido mais por alguma razão)
    result_items = items_acc[:per_page]

    total_pages = math.ceil(total_items / per_page) if per_page else 1
    payload = {
        "totalItems": total_items,
        "items": result_items,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages
    }

    # cache curto por request
    _cache_set(_search_cache, cache_key, payload)
    return JSONResponse(content=payload)


@router.get("/{volume_id}")
async def get_volume(volume_id: str):
    """
    Retorna detalhe de um volume específico.
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
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Volume não encontrado")
        raise HTTPException(status_code=e.response.status_code, detail="Erro ao consultar Google Books")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

    mapped = _map_volume_item(data)
    _cache_set(_volume_cache, cache_key, mapped)
    return JSONResponse(content=mapped)


@router.get("/thumbnail/{volume_id}")
async def proxy_thumbnail(volume_id: str):
    """
    Proxy da thumbnail: busca a informação do volume e faz GET da imagem retornando o conteúdo.
    Se não houver thumbnail, retorna 404.
    """
    # busca o detalhe (usa cache se disponível)
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
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Volume não encontrado")
            raise HTTPException(status_code=e.response.status_code, detail="Erro ao consultar Google Books")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
        volume = _map_volume_item(data)
        _cache_set(_volume_cache, cache_key, volume)

    thumbnail_url = volume.get("thumbnail")
    if not thumbnail_url:
        raise HTTPException(status_code=404, detail="Thumbnail não encontrada para este volume")

    # se já está em cache de imagens e válido, retorna do cache
    img_cache_key = f"img::{thumbnail_url}"
    if img_cache_key in _image_cache and _is_valid_cache(_image_cache[img_cache_key]):
        cached = _image_cache[img_cache_key]["value"]
        return StreamingResponse(iter([cached["body"]]), media_type=cached["content_type"])

    # buscar imagem externa
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(thumbnail_url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg")
            body = resp.content  # bytes
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail="Não foi possível recuperar a imagem externa")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imagem: {str(e)}")

    # armazenar no cache (guardando bytes) - cuidado com memória, TTL curto
    _cache_set(_image_cache, img_cache_key, {"content_type": content_type, "body": body})

    # devolver stream
    return StreamingResponse(iter([body]), media_type=content_type)
