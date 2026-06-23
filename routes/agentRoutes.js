const express = require("express");

const {
  createAgent,
  getAgents,
} = require("../controllers/agentController");

const router = express.Router();

router.post("/", createAgent);

router.get("/", getAgents);

module.exports = router;