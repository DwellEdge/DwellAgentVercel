const express = require("express");
const router = express.Router();

const {
  createPropertyType,
} = require("../controllers/propertytypeController");

router.post("/", createPropertyType);

module.exports = router;