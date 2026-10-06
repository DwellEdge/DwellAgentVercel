const express = require("express");
const router = express.Router();

const {
  createPropertyType,
} = require("../controllers/propertyTypeController");

router.post("/", createPropertyType);

module.exports = router;