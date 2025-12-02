# backend/main.py
import os
import sqlite3
from sqlite3 import Connection
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.hash import argon2
import jwt
from datetime import datetime, timedelta
import uuid
import uvicorn

# caminho absoluto para o DB: backend/Banco de dados/data.db
BASE_DIR = os.path.dirname(__file__)          # pasta backend
DATABASE = os.path.join(BASE_DIR, "Banco de dados", "data.db")

# imports da API
from API.books import router as books_router

try:
    from API.history import router as history_router
    HAS_HISTORY = True
except Exception:
    HAS_HISTORY = False

try:
    from relatorio.reporters import router as reports_router
    HAS_REPORTS = True
except Exception:
    HAS_REPORTS = False


# ===== CONFIG GERAL =====
SECRET_KEY = os.environ.get("JWT_SECRET", "mudar_essa_chave_em_producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias


# ===== APP =====
app = FastAPI(title="Biblioteca Digital API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== DATABASE =====
def get_db() -> Connection:
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          title TEXT,
          authors TEXT,
          thumbnail TEXT,
          pages INTEGER,
          categories TEXT,
          description TEXT,
          total_copies INTEGER DEFAULT 1,
          available INTEGER DEFAULT 1,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS loans (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          book_id TEXT,
          borrowed_at TEXT,
          due_at TEXT,
          returned_at TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(book_id) REFERENCES books(id)
        );

        CREATE TABLE IF NOT EXISTS reservations (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          book_id TEXT,
          reserved_at TEXT,
          active INTEGER DEFAULT 1,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(book_id) REFERENCES books(id)
        );

        CREATE TABLE IF NOT EXISTS read_history (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          book_id TEXT,
          read_at TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(book_id) REFERENCES books(id)
        );
        """
    )
    db.commit()
    db.close()


# ===== AUTH =====
MAX_BCRYPT = 72


def norm_password(p: str) -> str:
    if p is None:
        return ""
    return p.encode("utf-8")[:MAX_BCRYPT].decode("utf-8", errors="ignore")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ===== MODELS =====
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: str


# ===== STARTUP =====
@app.on_event("startup")
def startup():
    init_db()


# ===== AUTH ROUTES =====
@app.post("/api/auth/register", status_code=201)
def register(data: RegisterIn):
    if len(data.password) < 6:
        raise HTTPException(400, "Senha muito curta (mínimo 6 caracteres)")

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT id FROM users WHERE email = ?", (data.email.lower(),))
    if cur.fetchone():
        db.close()
        raise HTTPException(409, "Email já cadastrado")

    user_id = str(uuid.uuid4())
    pwd_hash = argon2.hash(norm_password(data.password))

    cur.execute(
        "INSERT INTO users (id,name,email,password_hash) VALUES (?,?,?,?)",
        (user_id, data.name, data.email.lower(), pwd_hash),
    )
    db.commit()

    cur.execute("SELECT id,name,email,created_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    db.close()

    return {
        "user": dict(row),
        "access_token": create_access_token({"sub": user_id}),
    }


@app.post("/api/auth/login")
def login(data: LoginIn):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "SELECT id,name,email,password_hash FROM users WHERE email = ?",
        (data.email.lower(),),
    )
    row = cur.fetchone()
    db.close()

    if not row:
        raise HTTPException(401, "Credenciais inválidas")

    try:
        ok = argon2.verify(norm_password(data.password), row["password_hash"])
    except Exception:
        ok = False

    if not ok:
        raise HTTPException(401, "Credenciais inválidas")

    token = create_access_token({"sub": row["id"], "email": row["email"]})

    return {"access_token": token, "user": dict(row)}


@app.get("/api/auth/me", response_model=UserOut)
def me(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    user_id = payload.get("sub")

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id,name,email,created_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    db.close()

    if not row:
        raise HTTPException(404, "Usuário não encontrado")

    return dict(row)


@app.get("/api/health")
def health():
    return {"ok": True}


# ================================================================
#                🔥  LOANS & RESERVATIONS API  🔥
# ================================================================
from typing import Optional
from pydantic import BaseModel


class LoanCreateIn(BaseModel):
    bookId: str
    dueDate: Optional[str] = None


class ReservationCreateIn(BaseModel):
    bookId: str
    expiresAt: Optional[str] = None


def now_iso():
    return datetime.utcnow().replace(microsecond=0).isoformat()


# --- Criar Empréstimo ---
@app.post("/api/loans", status_code=201)
def create_loan_api(payload: LoanCreateIn, token: str = Depends(oauth2_scheme)):
    user = verify_token(token)
    user_id = user["sub"]

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT id, available FROM books WHERE id = ?", (payload.bookId,))
    book = cur.fetchone()
    if not book:
        raise HTTPException(404, "Livro não encontrado")

    if int(book["available"]) <= 0:
        raise HTTPException(400, "Sem cópias disponíveis")

    loan_id = str(uuid.uuid4())
    borrowed_at = now_iso()
    due_at = payload.dueDate or (datetime.utcnow() + timedelta(days=14)).isoformat()

    cur.execute(
        """INSERT INTO loans (id,user_id,book_id,borrowed_at,due_at)
           VALUES (?,?,?,?,?)""",
        (loan_id, user_id, payload.bookId, borrowed_at, due_at),
    )

    cur.execute(
        "UPDATE books SET available = MAX(available - 1, 0) WHERE id = ?",
        (payload.bookId,),
    )

    db.commit()
    db.close()

    return {
        "id": loan_id,
        "bookId": payload.bookId,
        "userId": user_id,
        "borrowedAt": borrowed_at,
        "dueAt": due_at,
    }


# --- Listar empréstimos do usuário ---
@app.get("/api/loans/me")
def my_loans(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)

    db = get_db()
    cur = db.cursor()
    cur.execute(
        """SELECT l.*, b.title, b.authors
           FROM loans l
           LEFT JOIN books b ON b.id = l.book_id
           WHERE user_id = ?
           ORDER BY borrowed_at DESC""",
        (user["sub"],),
    )
    rows = cur.fetchall()
    db.close()

    return [dict(r) for r in rows]


# --- Criar reserva ---
@app.post("/api/reservations", status_code=201)
def create_reservation(payload: ReservationCreateIn, token: str = Depends(oauth2_scheme)):
    user = verify_token(token)

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT id FROM reservations WHERE user_id=? AND book_id=? AND active=1",
                (user["sub"], payload.bookId))
    if cur.fetchone():
        raise HTTPException(409, "Já possui reserva ativa")

    res_id = str(uuid.uuid4())

    cur.execute(
        """INSERT INTO reservations (id,user_id,book_id,reserved_at,active)
           VALUES (?,?,?,?,1)""",
        (res_id, user["sub"], payload.bookId, now_iso()),
    )

    db.commit()
    db.close()

    return {"id": res_id, "bookId": payload.bookId, "userId": user["sub"]}


# --- Listar reservas do usuário ---
@app.get("/api/reservations/me")
def my_reservations(token: str = Depends(oauth2_scheme)):
    user = verify_token(token)

    db = get_db()
    cur = db.cursor()
    cur.execute(
        """SELECT r.*, b.title, b.authors
           FROM reservations r
           LEFT JOIN books b ON b.id = r.book_id
           WHERE r.user_id = ?
           ORDER BY r.reserved_at DESC""",
        (user["sub"],),
    )
    rows = cur.fetchall()
    db.close()

    return [dict(r) for r in rows]


# ================================================================
#                    🔥 END LOANS API 🔥
# ================================================================


# ===== ROUTERS =====
app.include_router(books_router)

if HAS_HISTORY:
    app.include_router(history_router)

if HAS_REPORTS:
    app.include_router(reports_router)


# ===== RUN =====
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)
