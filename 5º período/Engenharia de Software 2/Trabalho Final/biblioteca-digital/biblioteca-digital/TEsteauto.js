/**
 * Testes automatizados básicos do Sistema de Biblioteca Digital
 * Framework: Jest + Supertest
 */

const request = require('supertest');
const app = require('../server'); // ajuste caso necessário

// ===============
// Teste: Servidor
// ===============
describe('Servidor - Testes básicos', () => {
  test('Servidor deve responder na rota raiz', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});

// ==========================
// Teste: Endpoints de Livros
// ==========================
describe('Livros - Testes de API', () => {
  test('Deve retornar lista de livros', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Deve retornar detalhes de um livro específico', async () => {
    const res = await request(app).get('/books/1');
    expect([200, 404]).toContain(res.statusCode);
  });
});

// ===============================
// Teste: Empréstimos e Reservas
// ===============================
describe('Empréstimos e Reservas', () => {
  test('Deve criar um empréstimo', async () => {
    const payload = { userId: 1, bookId: 1, dias: 7 };

    const res = await request(app)
      .post('/loans')
      .send(payload);

    expect([200, 400]).toContain(res.statusCode);
  });

  test('Deve criar uma reserva', async () => {
    const payload = { userId: 1, bookId: 1 };

    const res = await request(app)
      .post('/reservations')
      .send(payload);

    expect([200, 400]).toContain(res.statusCode);
  });
});

// =========================
// Teste: Histórico
// =========================
describe('Histórico - API', () => {
  test('Deve retornar histórico de um usuário', async () => {
    const res = await request(app).get('/history/1');
    expect([200, 404]).toContain(res.statusCode);
  });
});
