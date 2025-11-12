const loanService = require("../../services/loan.service");
const bookRepo = require("../../repositories/book.repo");

beforeEach(() => {
  bookRepo.reset([{ id: 1, title: "Livro Teste", available: true }]);
  loanService.reset();
});

test("processLoan creates loan and blocks book", async () => {
  const loan = await loanService.processLoan(10, 1);
  expect(loan).toHaveProperty("loanId");
  const bookAfter = await bookRepo.getById(1);
  expect(bookAfter.available).toBe(false);
});

test("processLoan throws if book not available", async () => {
  await loanService.processLoan(10, 1);
  await expect(loanService.processLoan(11, 1)).rejects.toThrow("Livro indisponível");
});

