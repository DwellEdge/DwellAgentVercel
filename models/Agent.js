const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,
  officeAddress: String,
  homeAddress: String,
  email: { type: String, unique: true, sparse: true },
  mobileNumber: String,
  photo: String,
  idDocument: String,
  password: String,
  loginId: String,
  propertyTypes: [
    {
      propertyTypeId: String,
      propertyType: String,
      count: Number,
    },
  ],
  "Number of Property": String,
  createdDateAndTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Agent", agentSchema, "Agents");