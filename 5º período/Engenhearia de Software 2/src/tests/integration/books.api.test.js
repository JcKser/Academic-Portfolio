const request = require("supertest");
const { createApp, bookRepo } = require("../../app");

let app;
beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  // reset repo via endpoint
  await request(app).post("/__test/reset").send({ seedBooks: [{ id: 1, title: "Livro Teste", available: true }] });
});

test("GET /api/books lists books", async () => {
  const res = await request(app).get("/api/books");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test("POST /api/books creates a book", async () => {
  const res = await request(app).post("/api/books").send({ title: "Novo Livro" });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("id");
});

