const express = require("express");
const bodyParser = require("express").json;
const bookController = require("./controllers/book.controller");
const loanController = require("./controllers/loan.controller");
const bookRepo = require("./repositories/book.repo");
const loanService = require("./services/loan.service");

function createApp() {
  const app = express();
  app.use(bodyParser());
  app.use("/api", bookController);
  app.use("/api", loanController);

  // endpoint para helpers de teste (reset)
  app.post("/__test/reset", (req, res) => {
    if (req.body && req.body.seedBooks) {
      bookRepo.reset(req.body.seedBooks);
    } else {
      bookRepo.reset();
    }
    loanService.reset();
    res.status(200).json({ ok: true });
  });

  return app;
}

module.exports = { createApp, bookRepo, loanService };
