const express = require("express");
const router = express.Router();
const loanService = require("../services/loan.service");

router.post("/loans", async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const loan = await loanService.processLoan(userId, bookId);
    res.status(201).json(loan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/loans", async (req, res) => {
  const loans = await require("../services/loan.service").listLoans();
  res.json(loans);
});

module.exports = router;
