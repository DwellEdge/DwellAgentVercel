const express = require("express");
const { getPropertyTypes } = require("../controllers/propertytype");

const router = express.Router();
router.get("/", getPropertyTypes);

module.exports = router;