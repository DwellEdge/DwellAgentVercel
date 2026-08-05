const express = require("express");
const router = express.Router();
const { addProperty, getPropertiesByAgent } = require("../controllers/propertyController");

router.post("/", addProperty);
router.get("/:agentId", getPropertiesByAgent);

module.exports = router;