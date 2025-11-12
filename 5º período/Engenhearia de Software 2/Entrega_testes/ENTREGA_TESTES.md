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

* **Camada de domínio/serviços:**

  * `book.service.js`: regras de negócio para cadastro e empréstimo de livros.
  * `loan.service.js`: processamento de empréstimos e controle de disponibilidade.

* **Camada de persistência (repositório em memória):**

  * `book.repo.js`: manipulação de dados de livros (armazenamento temporário).

* **Camada de API:**

  * Endpoints:

    * `GET /api/books` — listar livros
    * `POST /api/books` — cadastrar novo livro
    * `POST /api/loans` — criar empréstimo

---

## 🧩 Testes Implementados

Foram desenvolvidos **4 testes automatizados** com o framework **Jest + Supertest**, abrangendo camada de domínio e API:

| Tipo       | Arquivo                                   | O que valida                                                                                                   |
| ---------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Unitário   | `src/tests/unit/book.service.test.js`     | Verifica se o empréstimo (`lendBook`) altera corretamente a disponibilidade do livro e impede novo empréstimo. |
| Unitário   | `src/tests/unit/loan.service.test.js`     | Garante que o serviço de empréstimos (`processLoan`) cria registros e bloqueia o livro.                        |
| Integração | `src/tests/integration/books.api.test.js` | Testa os endpoints de listagem e criação de livros (`GET` e `POST /api/books`).                                |
| Integração | `src/tests/integration/loans.api.test.js` | Testa o endpoint de criação de empréstimo (`POST /api/loans`) e atualização de disponibilidade do livro.       |

---

## ⚙️ Tecnologias utilizadas

* **Node.js**
* **Express**
* **Jest** — framework de testes
* **Supertest** — testes de integração HTTP
* **NPM** — gerenciamento de dependências

---

## 🚀 Como executar os testes

1. Clone o repositório:

   ```bash
   git clone https://github.com/JcKser/Academic-Portfolio.git
   ```
2. Acesse a pasta do projeto:

   ```bash
   cd "Academic-Portfolio/5º período/Engenhearia de Software 2"
   ```
3. Instale as dependências:

   ```bash
   npm install
   ```
4. Execute os testes:

   ```bash
   npm test
   ```
5. (Opcional) Gere o relatório de cobertura:

   ```bash
   npm run test:coverage
   ```

---

## 📦 Estrutura do projeto

```
Engenhearia de Software 2/
 ├── src/
 │   ├── controllers/
 │   ├── services/
 │   ├── repositories/
 │   └── tests/
 │       ├── unit/
 │       └── integration/
 ├── jest.config.cjs
 ├── package.json
 ├── .gitignore
 └── ENTREGA_TESTES.md
```

---

## ✅ Resultado dos testes

Todos os testes passaram com sucesso:

```
Test Suites: 4 passed, 4 total
Tests:       7 passed, 7 total
Time:        0.4 s
```

---

## 🔗 Link do repositório

[https://github.com/JcKser/Academic-Portfolio/tree/main/5º%20período/Engenhearia%20de%20Software%202](https://github.com/JcKser/Academic-Portfolio/tree/main/5º%20período/Engenhearia%20de%20Software%202)

---

## 📄 Observações finais

O projeto cumpre o escopo mínimo exigido:
✔️ Testes unitários e de integração;
✔️ Cobertura de camadas de domínio e API;
✔️ Execução 100% automatizada com Jest;
✔️ Arquivo de entrega completo para avaliação.

---

**Data:** 12/11/2025
**Autor:** *Júlio César Gonzaga Ferreira Silva*
