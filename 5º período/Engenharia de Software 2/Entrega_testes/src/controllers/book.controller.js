const express = require("express");
const router = express.Router();
const bookService = require("../services/book.service");

router.get("/books", async (req, res) => {
  const books = await bookService.listBooks();
  res.json(books);
});

router.post("/books", async (req, res) => {
  const b = await bookService.createBook(req.body);
  res.status(201).json(b);
});

module.exports = router;
