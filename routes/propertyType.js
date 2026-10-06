const express = require("express");
const { getPropertyTypes } = require("../controllers/propertyTypeController");

const router = express.Router();
router.get("/", getPropertyTypes);

module.exports = router;