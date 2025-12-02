#!/usr/bin/env python3
# full_seed_with_reviews.py
"""
Seeder completo — recria DB SQLite do zero e popula com:
- MAIN user (email Julio+teste@example.com / pass 1234567) + 4 fake users
- Muitos livros
- Activity: loans (ativos, devolvidos, atrasados), read_history, reservations
- Reviews (rating + comment) gerados automaticamente para livros lidos / devolvidos
- Atualiza avg_rating e review_count em books
"""

import os
import sqlite3
import uuid
import random
import sys
from datetime import datetime, timedelta

# ----------------- CONFIG -----------------
BASE_DIR = os.path.dirname(__file__) or '.'
DB_DIR = os.path.join(BASE_DIR, "Banco de dados")
DB_PATH = os.path.join(DB_DIR, "data.db")

NUM_FAKE_USERS = 4     # além do MAIN_USER
NUM_BOOKS = 300        # ajuste conforme quiser
MAX_LOANS_PER_USER = 60
MAX_READS_PER_USER = 50
MAX_RESERVATIONS_PER_USER = 8

# Usuário obrigatório (MAIN)
MAIN_USER_ID = "6dffe89a-efab-4605-a355-24a4b4964bc1"
MAIN_USER_EMAIL = "julio+teste@example.com"
MAIN_USER_PASSWORD = "1234567"
MAIN_USER_NAME = "Júlio Teste"

# Tenta usar bibliotecas extras
try:
    from faker import Faker
    fake = Faker("pt_BR")
except Exception:
    fake = None

try:
    from passlib.hash import argon2
    def hash_password(p): return argon2.hash(p)
except Exception:
    import hashlib
    def hash_password(p): return hashlib.sha256(p.encode('utf-8')).hexdigest()

# ----------------- Helpers -----------------
def now_iso():
    return datetime.utcnow().replace(microsecond=0).isoformat()

def iso_str(dt):
    if dt is None:
        return None
    return dt.replace(microsecond=0).isoformat()

def random_past_date(days_back_max=400):
    days = random.randint(1, days_back_max)
    hours = random.randint(0, 23)
    minutes = random.randint(0, 59)
    return datetime.utcnow() - timedelta(days=days, hours=hours, minutes=minutes)

def mkid():
    return str(uuid.uuid4())

# ----------------- DB creation -----------------
def recreate_db(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"[db] arquivo existente removido: {path}")
        except Exception as e:
            print("[db] Erro removendo arquivo antigo:", e)
            raise
    conn = sqlite3.connect(path)
    cur = conn.cursor()
    cur.executescript("""
    PRAGMA foreign_keys = ON;

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
        avg_rating REAL DEFAULT NULL,
        review_count INTEGER DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(book_id) REFERENCES books(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_book_id_created_at ON reviews(book_id, created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS ux_reviews_user_book ON reviews(user_id, book_id);
    """)
    conn.commit()
    return conn

# ----------------- Insert helpers -----------------
def insert_user(cur, user_id, name, email, password_plain):
    ph = hash_password(password_plain)
    cur.execute("INSERT INTO users (id,name,email,password_hash,created_at) VALUES (?,?,?,?,?)",
                (user_id, name, email, ph, now_iso()))

def insert_book(cur, book_id, title, authors, pages=100, categories='', description=''):
    cur.execute("""INSERT INTO books (id,title,authors,pages,categories,description,total_copies,available,created_at)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (book_id, title, authors, pages, categories, description, 3, 3, now_iso()))

def insert_loan(cur, loan_id, user_id, book_id, borrowed_at, due_at, returned_at):
    cur.execute("INSERT INTO loans (id,user_id,book_id,borrowed_at,due_at,returned_at) VALUES (?,?,?,?,?,?)",
                (loan_id, user_id, book_id, iso_str(borrowed_at), iso_str(due_at), iso_str(returned_at)))

def insert_reservation(cur, res_id, user_id, book_id, reserved_at, active=1):
    cur.execute("INSERT INTO reservations (id,user_id,book_id,reserved_at,active) VALUES (?,?,?,?,?)",
                (res_id, user_id, book_id, iso_str(reserved_at), active))

def insert_read(cur, rid, user_id, book_id, read_at):
    cur.execute("INSERT INTO read_history (id,user_id,book_id,read_at) VALUES (?,?,?,?)",
                (rid, user_id, book_id, iso_str(read_at)))

def insert_review(cur, review_id, user_id, book_id, rating, comment, created_at=None, updated_at=None):
    # tenta inserir; se já existir (unique constraint) faz UPDATE
    created = iso_str(created_at) if created_at else now_iso()
    try:
        cur.execute("INSERT INTO reviews (id,user_id,book_id,rating,comment,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
                    (review_id, user_id, book_id, rating, comment, created, iso_str(updated_at) if updated_at else None))
    except sqlite3.IntegrityError:
        # já existe (user-book), faz update (substitui rating/comment/updated_at)
        cur.execute("UPDATE reviews SET rating=?, comment=?, updated_at=? WHERE user_id=? AND book_id=?",
                    (rating, comment, now_iso(), user_id, book_id))

# ----------------- Content pools -----------------
BASE_TITLES = [
    "Inteligência Artificial na Sala de Aula","Tecnologia Social","Futuro Presente",
    "Ciência, Tecnologia e Inovação","Programação em Python","Algoritmos e Estruturas",
    "Engenharia de Software","Design de Produto","Redes e Segurança","Sistemas Distribuídos",
    "Banco de Dados Avançado","Introdução à Matemática","Estatística Aplicada","Finanças Pessoais",
    "Psicologia do Aprendizado","Filosofia Contemporânea","História do Brasil","Literatura Brasileira",
    "O Mundo Digital","Técnicas de Entrevista","Gestão Ágil","Marketing Digital","UX Design",
    "Criatividade e Inovação","Sustentabilidade e Tecnologia","Biotecnologia Essencial",
    "Desenvolvimento Mobile","Cloud Native Patterns","DevOps na Prática","Segurança Aplicada",
    "Contos de Verão","Manual do Programador","Arquitetura de Software Moderna"
]
AUTHORS = ["Ana Júlia Aragão","Luiz Miguel Dias","Leonardo Guerra","Nicolas Pimenta","Luan Alves",
           "Mariana Costa","Pedro Silva","Carla Souza","Rodrigo Lima","Beatriz Oliveira"]

SAMPLE_COMMENTS = [
    "Excelente leitura, recomendo muito!",
    "Boa didática e exemplos práticos.",
    "Amei o conteúdo, mudou minha forma de pensar.",
    "Não era bem o que eu esperava, mas foi útil.",
    "Maravilhoso — leitura obrigatória para profissionais.",
    "Alguns capítulos cansam, mas no geral bom.",
    "Ótima estrutura e linguagem acessível.",
    "Conteúdo profundo, exige atenção.",
    "Livro prático e direto ao ponto.",
    "Incrível! Recomendaria para colegas.",
    "Achei repetitivo em algumas partes.",
    "Adorei a abordagem e os exercícios."
]

def make_title(i):
    if i < len(BASE_TITLES):
        return BASE_TITLES[i]
    return f"{random.choice(['Fundamentos','Práticas','Manual','Guia','Avançado'])} de {random.choice(['Sistemas','IA','Programação','Redes','Dados','Arquitetura'])} #{i}"

def make_author():
    if random.random() < 0.7:
        return random.choice(AUTHORS)
    if fake:
        return fake.name()
    return "Autor Desconhecido"

# ----------------- Seeding main logic -----------------
def seed():
    conn = recreate_db(DB_PATH)
    cur = conn.cursor()

    print("[seed] criando MAIN user:", MAIN_USER_EMAIL)
    insert_user(cur, MAIN_USER_ID, MAIN_USER_NAME, MAIN_USER_EMAIL, MAIN_USER_PASSWORD)

    user_ids = [MAIN_USER_ID]

    print("[seed] criando usuários fake...")
    for i in range(NUM_FAKE_USERS):
        uid = mkid()
        name = (fake.name() if fake else f"User {i+1}")
        email = f"user{i+1}@example.com"
        pw = "password"
        insert_user(cur, uid, name, email, pw)
        user_ids.append(uid)

    # cria livros
    print(f"[seed] criando {NUM_BOOKS} livros...")
    book_ids = []
    for i in range(NUM_BOOKS):
        bid = mkid()
        title = make_title(i % len(BASE_TITLES))
        authors = make_author()
        pages = random.randint(60, 900)
        cats = random.choice(["Ficção","Ciência","Programação","Negócios","Educação","Geral","Fantasia","História"])
        desc = (fake.paragraph(nb_sentences=3) if fake else f"Descrição do livro {title} — por {authors}.")
        insert_book(cur, bid, f"{title} — {i}", authors, pages, cats, desc)
        book_ids.append(bid)

    conn.commit()

    print("[seed] criando atividade (reads, loans, reservations) por usuário...")

    total_loans = 0
    total_reads = 0
    total_res = 0
    total_reviews = 0

    # para garantir overlap: escolher alguns "hot" books que muitos usuários vão ler
    shared_books = random.sample(book_ids, min(25, len(book_ids)))

    def create_activity_for(user_id, intensity_factor=1.0):
        nonlocal total_loans, total_reads, total_res

        # READS (history)
        reads_n = int(max(2, random.randint(4, MAX_READS_PER_USER) * intensity_factor))
        reads_n = min(reads_n, len(book_ids))
        # garanto que alguns compartilhados sejam lidos por muitos
        read_books = random.sample(book_ids, reads_n - 3) if reads_n > 3 else random.sample(book_ids, reads_n)
        # adiciona alguns shared books
        for sb in random.sample(shared_books, min(3, len(shared_books))):
            if sb not in read_books:
                read_books.append(sb)
        # garantir unicidade
        read_books = list(dict.fromkeys(read_books))
        for b in read_books:
            rid = mkid()
            read_at = random_past_date(365)
            cur.execute("INSERT INTO read_history (id,user_id,book_id,read_at) VALUES (?,?,?,?)",
                        (rid, user_id, b, iso_str(read_at)))
            total_reads += 1

        # LOANS
        loans_n = int(max(1, random.randint(2, max(4, MAX_LOANS_PER_USER//3)) * intensity_factor))
        loans_n = min(loans_n, len(book_ids))
        loan_books = random.sample(book_ids, loans_n)
        for b in loan_books:
            lid = mkid()
            borrowed_at = random_past_date(300)
            due_at = borrowed_at + timedelta(days=random.randint(7, 28))
            returned_at = None

            r = random.random()
            if r < 0.6:
                # devolvido (a maioria)
                delta = random.randint(0, max(1, (datetime.utcnow() - borrowed_at).days + 7))
                returned = borrowed_at + timedelta(days=delta)
                if returned > datetime.utcnow():
                    returned = datetime.utcnow() - timedelta(days=random.randint(0,2))
                returned_at = returned
            elif r < 0.8:
                # ativo possivelmente overdue
                if due_at < datetime.utcnow() and random.random() < 0.8:
                    returned_at = None
                else:
                    returned_at = None
            else:
                # devolvido muito depois
                returned = due_at + timedelta(days=random.randint(1, 60))
                if returned > datetime.utcnow():
                    returned = None
                returned_at = returned

            insert_loan(cur, lid, user_id, b, borrowed_at, due_at, returned_at)
            total_loans += 1

        # RESERVATIONS
        if random.random() < 0.8:
            res_n = random.randint(0, min(MAX_RESERVATIONS_PER_USER, 4))
            if res_n > 0:
                res_books = random.sample(book_ids, res_n)
                for b in res_books:
                    rid = mkid()
                    reserved_at = random_past_date(120)
                    insert_reservation(cur, rid, user_id, b, reserved_at, active=random.choice([0,1,1]))
                    total_res += 1

    # MAIN_USER mais ativo
    create_activity_for(MAIN_USER_ID, intensity_factor=2.0)

    # outros users
    for uid in user_ids:
        if uid == MAIN_USER_ID:
            continue
        create_activity_for(uid, intensity_factor=random.uniform(0.6, 1.3))

    conn.commit()

    # ---- gerar reviews para livros lidos ou devolvidos ----
    print("[seed] gerando reviews para livros lidos ou devolvidos...")

    # consulta todos os pares (user, book) onde o user leu (read_history) ou loan devolvido (returned_at not null)
    cur.execute("""
      SELECT DISTINCT rh.user_id, rh.book_id
      FROM read_history rh
      UNION
      SELECT DISTINCT l.user_id, l.book_id
      FROM loans l
      WHERE l.returned_at IS NOT NULL
    """)
    pairs = cur.fetchall()  # lista de (user_id, book_id)
    random.shuffle(pairs)

    for (user_id, book_id) in pairs:
        # decide se esse par vira um review (nem todo read vira review)
        if random.random() < 0.82:  # 82% chance de gerar review para quem leu/devolveu
            rating = random.randint(3,5) if random.random() < 0.85 else random.randint(1,5)
            comment = random.choice(SAMPLE_COMMENTS)
            # ocasionalmente gerar comentário mais longo via faker
            if fake and random.random() < 0.25:
                comment = fake.sentence(nb_words=random.randint(8,20))
            insert_review(cur, mkid(), user_id, book_id, rating, comment, created_at=random_past_date(200))
            total_reviews += 1

    conn.commit()

    # ---- atualizar agregados em books (avg_rating, review_count) ----
    print("[seed] atualizando agregados avg_rating / review_count em books...")
    cur.execute("SELECT id FROM books")
    all_b = [r[0] for r in cur.fetchall()]
    updated = 0
    for bid in all_b:
        cur.execute("SELECT COUNT(*), AVG(rating) FROM reviews WHERE book_id = ?", (bid,))
        row = cur.fetchone()
        cnt = row[0] or 0
        avg = row[1] or None
        if cnt > 0:
            cur.execute("UPDATE books SET review_count = ?, avg_rating = ? WHERE id = ?", (cnt, float(avg), bid))
            updated += 1
    conn.commit()

    # ---- calcular overdue ativos ----
    cur.execute("SELECT COUNT(*) FROM loans WHERE returned_at IS NULL AND due_at < ?", (now_iso(),))
    overdue_active = cur.fetchone()[0]

    # stats
    cur.execute("SELECT COUNT(*) FROM users"); users_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM books"); books_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM loans"); loans_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM read_history"); reads_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM reservations"); res_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM reviews"); reviews_count = cur.fetchone()[0]

    print("=== SEED COMPLETO ===")
    print("USERS:", users_count)
    print("BOOKS:", books_count)
    print("LOANS:", loans_count)
    print("READ_HISTORY:", reads_count)
    print("RESERVATIONS:", res_count)
    print("REVIEWS:", reviews_count)
    print("OVERDUE (ativos):", overdue_active)
    print("MAIN_USER_ID:", MAIN_USER_ID)
    print("MAIN_USER_EMAIL:", MAIN_USER_EMAIL, "PASSWORD:", MAIN_USER_PASSWORD)

    conn.close()
    print("[seed] banco criado com sucesso em:", DB_PATH)

if __name__ == "__main__":
    print("=== INICIANDO SEED COMPLETO (COM REVIEWS) ===")
    seed()
    print("=== FIM SEED ===")
