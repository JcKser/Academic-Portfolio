# 🧪 Entrega — Testes Automatizados  
**Disciplina:** Engenharia de Software 2  
**Aluno:** Júlio César Gonzaga Ferreira Silva  
**Período:** 5º Período — Ciência da Computação / PUC Minas  

---

## 🎯 Objetivo  
Implementar testes automatizados (unitários e de integração) que validem o funcionamento correto das principais partes do sistema, assegurando a correção, confiabilidade e qualidade do código.

---

## 🧱 Escopo desenvolvido  
Foi criado um **backend mínimo em Node.js (Express)** simulando um sistema de **Biblioteca Digital**, com as seguintes camadas e responsabilidades:

- **Camada de domínio/serviços:**
  - `book.service.js`: regras de negócio para cadastro e empréstimo de livros.  
  - `loan.service.js`: processamento de empréstimos e controle de disponibilidade.  

- **Camada de persistência (repositório em memória):**
  - `book.repo.js`: manipulação de dados de livros (armazenamento temporário).  

- **Camada de API:**
  - Endpoints:
    - `GET /api/books` — listar livros  
    - `POST /api/books` — cadastrar novo livro  
    - `POST /api/loans` — criar empréstimo  

---

## 🧩 Testes Implementados  
Foram desenvolvidos **4 testes automatizados** com o framework **Jest + Supertest**, abrangendo camada de domínio e API:

| Tipo | Arquivo | O que valida |
|------|----------|--------------|
| Unitário | `src/tests/unit/book.service.test.js` | Verifica se o empréstimo (`lendBook`) altera corretamente a disponibilidade do livro e impede novo empréstimo. |
| Unitário | `src/tests/unit/loan.service.test.js` | Garante que o serviço de empréstimos (`processLoan`) cria registros e bloqueia o livro. |
| Integração | `src/tests/integration/books.api.test.js` | Testa os endpoints de listagem e criação de livros (`GET` e `POST /api/books`). |
| Integração | `src/tests/integration/loans.api.test.js` | Testa o endpoint de criação de empréstimo (`POST /api/loans`) e atualização de disponibilidade do livro. |

---

## ⚙️ Tecnologias utilizadas  
- **Node.js**  
- **Express**  
- **Jest** — framework de testes  
- **Supertest** — testes de integração HTTP  
- **NPM** — gerenciamento de dependências  

---

## 🚀 Como executar os testes  
1. Clone o repositório:  
   ```bash
   git clone https://github.com/JcKser/Academic-Portfolio.git
