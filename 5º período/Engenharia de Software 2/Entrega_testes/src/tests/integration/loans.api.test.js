const request = require("supertest");
const { createApp } = require("../../app");

let app;
beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await request(app).post("/__test/reset").send({ seedBooks: [{ id: 100, title: "Livro Teste", available: true }] });
});

test("POST /api/loans creates loan and updates book", async () => {
  const res = await request(app).post("/api/loans").send({ userId: 5, bookId: 100 });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("loanId");

  const books = await request(app).get("/api/books");
  const book = books.body.find(b => b.id === 100);
  expect(book.available).toBe(false);
});

