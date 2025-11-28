# main.py
import sqlite3
from sqlite3 import Connection
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.hash import argon2
import jwt
from datetime import datetime, timedelta
import os
import uuid
import uvicorn # Importante para rodar o servidor

# Importa as rotas de livros do arquivo books.py
from books import router as books_router

# ===== CONFIG GERAL =====
DATABASE = "data.db"
SECRET_KEY = os.environ.get("JWT_SECRET", "mudar_essa_chave_em_producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias

# ===== APP SETUP =====
app = FastAPI(title="Biblioteca Digital API")

# ---- CORS (Configuração de Segurança) ----
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5500",   # Live Server VS Code
    "http://localhost:5500",
    "*" # Apenas para dev, permite conexões de qualquer lugar
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== DATABASE UTILS =====
def get_db() -> Connection:
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
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
        """
    )
    db.commit()
    db.close()

# ===== AUTH HELPER FUNCTIONS =====
MAX_BCRYPT = 72
def norm_password(p: str) -> str:
    if p is None: return ""
    return p.encode("utf-8")[:MAX_BCRYPT].decode("utf-8", errors="ignore")

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

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

# ===== STARTUP EVENT =====
@app.on_event("startup")
def startup():
    init_db()

# ===== ROTAS DE AUTENTICAÇÃO =====

@app.post("/api/auth/register", status_code=201)
def register(data: RegisterIn):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Senha muito curta (mínimo 6 caracteres)")

    db = get_db()
    cur = db.cursor()
    
    # Verifica se email já existe
    cur.execute("SELECT id FROM users WHERE email = ?", (data.email.lower(),))
    if cur.fetchone():
        db.close()
        raise HTTPException(status_code=409, detail="Email já cadastrado")

    user_id = str(uuid.uuid4())
    pwd_hash = argon2.hash(norm_password(data.password))

    cur.execute(
        "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
        (user_id, data.name.strip(), data.email.lower(), pwd_hash)
    )
    db.commit()
    
    # Retorna usuário criado + token
    cur.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    db.close()

    return {
        "user": dict(row),
        "access_token": create_access_token({"sub": user_id, "email": row["email"]})
    }

@app.post("/api/auth/login")
def login(data: LoginIn):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?", (data.email.lower(),))
    row = cur.fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    try:
        ok = argon2.verify(norm_password(data.password), row["password_hash"])
    except Exception:
        ok = False

    if not ok:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token = create_access_token({"sub": row["id"], "email": row["email"]})
    return {
        "access_token": access_token, 
        "user": {"id": row["id"], "name": row["name"], "email": row["email"]}
    }

@app.get("/api/auth/me", response_model=UserOut)
def me(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    db.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return dict(row)

@app.get("/api/health")
def health():
    return {"ok": True}

# ===== INCLUINDO AS ROTAS DE LIVROS =====
# Isso é crucial! Sem isso, o frontend não consegue buscar livros.
app.include_router(books_router)

# ===== EXECUÇÃO =====
if __name__ == "__main__":
    # Roda o servidor na porta 8080
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)