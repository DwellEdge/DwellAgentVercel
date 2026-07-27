const express = require("express");
const router = express.Router();

const {
  createAgent,
  getAgents,
} = require("../controllers/agentController");

router.post("/", createAgent);

router.get("/", getAgents);

module.exports = router;
