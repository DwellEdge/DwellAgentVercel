const crypto = require("crypto");
const { sendCustomerMessages } = require("./messageHelper");

// Lazy-load Razorpay so the server doesn't crash if the dependency
// isn't installed yet.
let Razorpay;
try {
  Razorpay = require("razorpay");
} catch (e) {
  Razorpay = null;
}

const makeRazorpayInstance = () => {
  if (!Razorpay) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create an order for the given amount (in INR)
const createOrder = async (req, res) => {
  const client = makeRazorpayInstance();
  if (!client) {
    return res.status(500).json({
      success: false,
      message:
        "Server misconfiguration: missing 'razorpay' dependency. Run 'npm install razorpay' in the server root and restart.",
    });
  }

  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: receipt || `txn_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await client.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay createOrder error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify the payment signature, then send SMS + WhatsApp
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      phone,
      name,
      agents,
    } = req.body;

    if (!phone || phone.length !== 10 || isNaN(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

       const fullAgents = await sendCustomerMessages({ phone, name, agents });

    res.json({ success: true, agents: fullAgents });
  } catch (err) {
    console.error("verifyPayment error", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify webhook signature (if configured in Razorpay dashboard)
const verifyWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = req.rawBody || JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", secret || "")
    .update(body)
    .digest("hex");

  if (signature === expected) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
};

module.exports = { createOrder, verifyPayment, verifyWebhook };