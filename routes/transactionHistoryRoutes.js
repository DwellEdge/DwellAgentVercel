const express = require("express");
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  getPreviousAgents,
} = require(
  "../controllers/transactionHistoryController"
);

router.post(
  "/",
  createTransaction
);

router.get(
  "/",
  getTransactions
);

router.get(
  "/previous-agents",
  getPreviousAgents
);

module.exports = router;