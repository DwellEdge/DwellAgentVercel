const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyWebhook,
  verifyPayment,
} = require("../controllers/paymentController");

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment); // new

// Razorpay webhooks need the raw body to validate the signature.
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  req.rawBody = req.body.toString();
  try {
    req.body = JSON.parse(req.rawBody);
  } catch (e) {
    req.body = {};
  }
  verifyWebhook(req, res);
});

module.exports = router;