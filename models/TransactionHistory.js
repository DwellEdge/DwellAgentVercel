const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },

  city: String,

  area: String,

  customerId: Number,

  noOfAgentsSelected: Number,

  agentIds: [String],

  // Exact (agent, purpose) pairs for this transaction — the source of truth
  // when a single checkout spans more than one purpose (e.g. Rent + Lease).
  agentSelections: [
    {
      agentId: String,
      propertyTypeId: String,
      propertyType: String,
    },
  ],

  // Comma-joined summary of distinct purposes in this transaction, for quick
  // reading in Compass / simple queries. Not used for filtering logic.
  propertyType: String,

  mobileNumber: String,

  amountReceived: Number,

  createdDateAndTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "TransactionHistory",
  transactionHistorySchema,
  "Transaction history details"
);