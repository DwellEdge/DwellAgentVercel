const PropertyType = require("../models/PropertyType");

const createPropertyType = async (req, res) => {
  try {
    const propertyType = await PropertyType.create(req.body);

    res.status(201).json({
      success: true,
      data: propertyType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPropertyType,
};