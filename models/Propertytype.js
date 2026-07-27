const mongoose = require("mongoose");

const propertyTypeSchema =
  new mongoose.Schema({
    propertyTypeId: {
      type: String,
      required: true,
      unique: true,
    },

    propertyType: {
      type: String,
      required: true,
    },
  });

module.exports = mongoose.model(
  "PropertyType",
  propertyTypeSchema,
  "PropertyTypes"
);