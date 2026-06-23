const Customer = require("../models/Customer");

const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);

    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCustomer,
};