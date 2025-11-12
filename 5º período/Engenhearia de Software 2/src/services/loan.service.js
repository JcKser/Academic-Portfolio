const bookRepo = require("../repositories/book.repo");

class LoanService {
  constructor() {
    this.loans = [];
  }

  reset() {
    this.loans = [];
  }

  async processLoan(userId, bookId) {
    const book = await bookRepo.getById(bookId);
    if (!book) throw new Error("Livro não encontrado");
    if (!book.available) throw new Error("Livro indisponível");

    // bloquear o livro (simplesmente atualizar disponibilidade)
    await bookRepo.update(bookId, { available: false });

    const loanId = this.loans.length ? Math.max(...this.loans.map(l => l.loanId)) + 1 : 1;
    const loan = { loanId, userId, bookId, date: new Date().toISOString() };
    this.loans.push(loan);
    return loan;
  }

  async listLoans() {
    return this.loans.slice();
  }
}

module.exports = new LoanService();
