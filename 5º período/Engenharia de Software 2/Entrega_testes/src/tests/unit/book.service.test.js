const bookService = require("../../services/book.service");
const bookRepo = require("../../repositories/book.repo");

beforeEach(() => {
  bookRepo.reset([{ id: 1, title: "Livro Teste", available: true }]);
});

test("lendBook reduces availability", async () => {
  const b = await bookService.lendBook(1);
  expect(b.available).toBe(false);

  const after = await bookRepo.getById(1);
  expect(after.available).toBe(false);
});

test("lendBook throws when unavailable", async () => {
  await bookService.lendBook(1);
  await expect(bookService.lendBook(1)).rejects.toThrow("Livro indisponível");
});

