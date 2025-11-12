class InMemoryBookRepo {
  constructor() {
    this.reset();
  }

  reset(seed = null) {
    this.books = seed ? seed.slice() : [
      { id: 1, title: "Livro Teste", available: true }
    ];
  }

  async list() {
    return this.books.slice();
  }

  async getById(id) {
    return this.books.find(b => b.id === id) || null;
  }

  async save(book) {
    const id = this.books.length ? Math.max(...this.books.map(b => b.id)) + 1 : 1;
    const nb = { id, ...book };
    this.books.push(nb);
    return nb;
  }

  async update(id, patch) {
    const idx = this.books.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.books[idx] = { ...this.books[idx], ...patch };
    return this.books[idx];
  }
}

module.exports = new InMemoryBookRepo();
