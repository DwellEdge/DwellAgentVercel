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
    const minBudget = req.query.minBudget ? Number(req.query.minBudget) : null;
    const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null;

    if (!city || !area || !propertyTypeId) {
      return res.json([]);
    }

    const purpose = purposeMap[propertyTypeId];
    if (!purpose) {
      return res.json([]);
    }

    const filter = {
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
      propertyAvailableFor: purpose,
      expiryDate: { $gt: new Date() },
    };

    if (minBudget !== null || maxBudget !== null) {
      filter.propertyCost = {};
      if (minBudget !== null && !Number.isNaN(minBudget)) {
        filter.propertyCost.$gte = minBudget;
      }
      if (maxBudget !== null && !Number.isNaN(maxBudget)) {
        filter.propertyCost.$lte = maxBudget;
      }
    }

    const properties = await PropertyDetails.find(filter).lean();

    if (properties.length === 0) {
      return res.json([]);
    }

    const agentCountMap = {};
    properties.forEach((prop) => {
      const id = String(prop.agentId || "").trim();
      if (!id) return;
      agentCountMap[id] = (agentCountMap[id] || 0) + 1;
    });

    const agentIds = Object.keys(agentCountMap);
    const agents = await Agent.find({ agentId: { $in: agentIds } }).lean();

    const result = agents.map((agent) => ({
      _id: agent._id,
      agentId: agent.agentId,
      firstName: agent.firstName,
      lastName: agent.lastName,
      area,
      city,
      filteredCount: agentCountMap[agent.agentId] || 0,
      filteredPropertyType: purpose,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAgents, createAgent };