const Agent = require("../models/Agent");
const PropertyDetails = require("../models/PropertyDetails");

// P01=Rent, P02=Lease, P03=Sale
const purposeMap = {
  P01: "Rent",
  P02: "Lease",
  P03: "Sale",
};

const createAgent = async (req, res) => {
  try {
    const agent = await Agent.create(req.body);
    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAgents = async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const propertyTypeId = req.query.propertyTypeId?.trim();

    if (!city || !area || !propertyTypeId) {
      return res.json([]);
    }

    const purpose = purposeMap[propertyTypeId];
    if (!purpose) {
      return res.json([]);
    }

    // Find all active (non-expired) properties matching city/area/purpose
    const properties = await PropertyDetails.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
      propertyAvailableFor: purpose,
      expiryDate: { $gt: new Date() },
    }).lean();

    if (properties.length === 0) {
      return res.json([]);
    }

    // Count properties per agent
    const agentCountMap = {};
    properties.forEach((prop) => {
      agentCountMap[prop.agentId] = (agentCountMap[prop.agentId] || 0) + 1;
    });

    // Fetch agent details for those agentIds
    const agentIds = Object.keys(agentCountMap);
    const agents = await Agent.find({ agentId: { $in: agentIds } }).lean();

    const result = agents.map((agent) => ({
      ...agent,
      filteredCount: agentCountMap[agent.agentId] || 0,
      filteredPropertyType: purpose,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAgents, createAgent };