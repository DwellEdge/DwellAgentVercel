const express = require("express");
const { getPropertyTypes } = require("../controllers/propertytypeController");

const router = express.Router();
router.get("/", getPropertyTypes);

module.exports = router;