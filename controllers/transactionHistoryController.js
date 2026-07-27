const TransactionHistory = require("../models/TransactionHistory");
const Customer = require("../models/Customer");

const createTransaction = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      mobileNumber: req.body.mobileNumber,
    });

    const transactionData = {
      ...req.body,
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

// Returns the distinct agentIds previously selected by ANY customer for
// this exact city + area + purpose, so Home.jsx can sink them to the
// bottom of the results list on a fresh search.
const getPreviousAgents = async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const propertyTypeId = req.query.propertyTypeId?.trim();

    if (!city || !area || !propertyTypeId) {
      return res.json([]);
    }

    const transactions = await TransactionHistory.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
      "agentSelections.propertyTypeId": propertyTypeId,
    }).lean();

    const agentIds = new Set();
    transactions.forEach((txn) => {
      (txn.agentSelections || []).forEach((sel) => {
        if (sel.propertyTypeId === propertyTypeId && sel.agentId) {
          agentIds.add(sel.agentId);
        }
      });
    });

    res.json(Array.from(agentIds));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getPreviousAgents,
};