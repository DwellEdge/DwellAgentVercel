const express = require("express");
const { getPropertyTypes } = require("../controllers/Propertytype");

const router = express.Router();
router.get("/", getPropertyTypes);

module.exports = router;