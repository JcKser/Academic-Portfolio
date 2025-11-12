const bookRepo = require("../repositories/book.repo");

class BookService {
  async listBooks() {
    return await bookRepo.list();
  }

  async createBook(data) {
    return await bookRepo.save({ title: data.title, available: true });
  }

  async lendBook(bookId) {
    const book = await bookRepo.getById(bookId);
    if (!book) throw new Error("Livro não encontrado");
    if (!book.available) throw new Error("Livro indisponível");
    return await bookRepo.update(bookId, { available: false });
  }

  async returnBook(bookId) {
    const book = await bookRepo.getById(bookId);
    if (!book) throw new Error("Livro não encontrado");
    return await bookRepo.update(bookId, { available: true });
  }
}

module.exports = new BookService();
