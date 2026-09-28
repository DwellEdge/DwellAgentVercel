const crypto = require("crypto");

// Lazy-load Razorpay so the server doesn't crash if the dependency
// isn't installed yet. createOrder will return a helpful error if
// the package is missing.
let Razorpay;
try {
  // try to require here — may throw if not installed
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

// Create an order for the given amount (in INR) and return order details
const createOrder = async (req, res) => {
  // Ensure Razorpay package is available
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
      amount: Math.round(amount * 100), // amount in paise
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

// Verify webhook signature (if you configure webhooks in Razorpay dashboard)
const verifyWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = req.rawBody || JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", secret || "")
    .update(body)
    .digest("hex");

  if (signature === expected) {
    // process webhook payload in req.body
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
};

module.exports = {
  createOrder,
  verifyWebhook,
};
