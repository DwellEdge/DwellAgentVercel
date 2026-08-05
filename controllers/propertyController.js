const PropertyDetails = require("../models/PropertyDetails");
const Agent = require("../models/Agent");
const client = require("../services/twilioService");

const addProperty = async (req, res) => {
  try {
    const {
      agentId,
      propertyAvailableFor,
      propertyCost,
      propertyAddress,
      area,
      city,
      pinCode,
      facing,
      propertyType,
      carParking,
      twoWheelerParking,
      amenities,
      landmark,
    } = req.body;

    // Save the property first
    const property = await PropertyDetails.create({
      agentId,
      propertyAvailableFor,
      propertyCost,
      propertyAddress,
      area,
      city,
      pinCode,
      facing,
      propertyType,
      carParking: carParking || false,
      twoWheelerParking: twoWheelerParking || false,
      amenities: amenities || {},
      landmark: landmark || "",
    });

    // Respond to frontend immediately
    res.status(201).json({ success: true, data: property });

    // Send SMS after responding so it never blocks the frontend
    try {
      const agent = await Agent.findOne({ agentId }).lean();
      console.log("Agent found for SMS:", agent ? agent.firstName : "NOT FOUND");

      if (agent && agent.mobileNumber) {
        const smsMessage =
          `Hi ${agent.firstName}, your property has been successfully registered on DwellAgent!\n\n` +
          `Property Details:\n` +
          `Available For: ${propertyAvailableFor}\n` +
          `Cost: Rs.${Number(propertyCost).toLocaleString()}\n` +
          `Address: ${propertyAddress}, ${area}, ${city} - ${pinCode}\n` +
          `Your listing will be visible to customers for 90 days.\n\n` +
          `Thank you for using DwellAgent!`;

        await client.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE,
          to: `+91${agent.mobileNumber}`,
        });
        console.log(`Property registration SMS sent to +91${agent.mobileNumber}`);
      } else {
        console.log("SMS skipped — agent not found or no mobile number. agentId:", agentId);
      }
    } catch (smsErr) {
      console.error("Property SMS send error:", smsErr.message);
    }

  } catch (error) {
    console.error("Add property error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPropertiesByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const properties = await PropertyDetails.find({
      agentId,
      expiryDate: { $gt: new Date() },
    }).lean();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addProperty, getPropertiesByAgent };