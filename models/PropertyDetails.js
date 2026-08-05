const mongoose = require("mongoose");

const propertyDetailsSchema = new mongoose.Schema({
  agentId: { type: String, required: true },

  propertyAvailableFor: {
    type: String,
    enum: ["Rent", "Lease", "Sale"],
    required: true,
  },

  propertyCost: { type: Number, required: true },

  propertyAddress: { type: String, required: true },

  area: { type: String, required: true },

  city: { type: String, required: true },

  pinCode: { type: String, required: true },

  facing: {
    type: String,
    enum: ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"],
  },

  propertyType: {
    type: String,
    enum: ["Apartment", "Villa", "Plot", "Independent House", "Commercial", "Other"],
  },

  carParking: { type: Boolean, default: false },

  twoWheelerParking: { type: Boolean, default: false },

  amenities: {
    gym: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    badminton: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    others: { type: String, default: "" },
  },

  landmark: { type: String, default: "" },

  listedDate: { type: Date, default: Date.now },

  // Properties expire after 90 days
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
});

module.exports = mongoose.model(
  "PropertyDetails",
  propertyDetailsSchema,
  "PropertyDetails"
);