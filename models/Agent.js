const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,
  mobileNumber: String,
  propertyCount: Number,
});

module.exports = mongoose.model(
  "Agent",
  agentSchema,
  "Agents"
);