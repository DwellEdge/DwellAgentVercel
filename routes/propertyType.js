const express = require("express");
const { getPropertyTypes } = require("../controllers/PropertyType");

const router = express.Router();
router.get("/", getPropertyTypes);

module.exports = router;