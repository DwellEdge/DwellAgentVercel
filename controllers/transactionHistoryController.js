const TransactionHistory = require("../models/TransactionHistory");
const Customer = require("../models/Customer");

const escapeRegex = (s = "") =>
  String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "Tirupati, Andhra Pradesh, India" -> "Tirupati"
const toPlainCity = (city = "") => String(city).split(",")[0].trim();

const createTransaction = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      mobileNumber: req.body.mobileNumber,
    });

    const transactionData = {
      ...req.body,
      // always store the plain city so it matches what Home.jsx searches with
      city: toPlainCity(req.body.city),
      customerId: customer?.Id || null,
    };

    const transaction = await TransactionHistory.create(transactionData);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await TransactionHistory.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Returns [{ agentId, lastSelectedAt }] for agents previously selected (paid)
// by ANY customer for this exact city + area + purpose. Home.jsx sorts by
// lastSelectedAt so the most recently selected agent sits at the very bottom
// and the order keeps rotating with every new payment.
const getPreviousAgents = async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const propertyTypeId = req.query.propertyTypeId?.trim();

    if (!city || !area || !propertyTypeId) {
      return res.json([]);
    }

    const rows = await TransactionHistory.aggregate([
      {
        $match: {
          // "Tirupati" also matches old records saved as "Tirupati, Andhra Pradesh, India"
          city: new RegExp(`^${escapeRegex(toPlainCity(city))}(,|$)`, "i"),
          area: new RegExp(`^${escapeRegex(area)}$`, "i"),
        },
      },
      { $unwind: "$agentSelections" },
      { $match: { "agentSelections.propertyTypeId": propertyTypeId } },
      {
        $group: {
          _id: "$agentSelections.agentId",
          lastSelectedAt: { $max: "$createdDateAndTime" },
        },
      },
      { $project: { _id: 0, agentId: "$_id", lastSelectedAt: 1 } },
    ]);

    res.json(rows);
  } catch (error) {
    console.error("getPreviousAgents error:", error.message);
    res.status(500).json([]);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getPreviousAgents,
};