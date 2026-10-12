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

const normalizePurpose = (value) => {
  if (!value) return null;
  const text = String(value).trim();

  if (["Rent", "Lease", "Sale"].includes(text)) return text;
  if (text === "P01") return "Rent";
  if (text === "P02") return "Lease";
  if (text === "P03") return "Sale";
  return null;
};

const getAgents = async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const propertyTypeId = req.query.propertyTypeId?.trim();
    const minBudget = req.query.minBudget ? Number(req.query.minBudget) : null;
    const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null;

    if (!city || !area) {
      return res.json([]);
    }

    const purpose = normalizePurpose(propertyTypeId) || purposeMap[propertyTypeId] || null;

    const filter = {
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
      expiryDate: { $gt: new Date() },
    };

    if (purpose) {
      filter.propertyAvailableFor = purpose;
    }

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