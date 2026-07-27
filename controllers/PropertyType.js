const PropertyType = require("../models/PropertyType");

const getPropertyTypes = async (req, res) => {
  try {
    const types = await PropertyType.find().lean();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPropertyTypes };