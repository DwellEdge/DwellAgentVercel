const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  Id: Number,
  name: String,
  mobileNumber: String,
  city: String,
  area: String,
  createdDateAndTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "Customer",
  customerSchema,
  "Customers"
);