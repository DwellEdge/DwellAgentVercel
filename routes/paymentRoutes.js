const express = require("express");
const router = express.Router();
const { createOrder, verifyWebhook } = require("../controllers/paymentController");

router.post("/create-order", createOrder);

// Razorpay webhooks often require the raw body to validate signature.
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  // attach rawBody for verification
  req.rawBody = req.body.toString();
  // parse JSON body for handlers
  try {
    req.body = JSON.parse(req.rawBody);
  } catch (e) {
    req.body = {};
  }
  verifyWebhook(req, res);
});

module.exports = router;
