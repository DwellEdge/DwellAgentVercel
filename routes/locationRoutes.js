const express = require("express");

const {
  getLocations,
  getAreas,
  getCustomers,
} = require(
  "../controllers/locationController"
);

const router = express.Router();

router.get(
  "/location",
  getLocations
);

router.get(
  "/areas",
  getAreas
);

router.get(
  "/customers",
  getCustomers
);

module.exports = router;