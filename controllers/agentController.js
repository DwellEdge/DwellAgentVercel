const Agent = require("../models/Agent");

const createAgent = async (req, res) => {
  try {
    const agent = await Agent.create(req.body);

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAgents = async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const propertyTypeId = req.query.propertyTypeId?.trim();

    const query = {};

    if (city) query.city = { $regex: `^${city}$`, $options: "i" };
    if (area) query.area = { $regex: `^${area}$`, $options: "i" };

    let agents = await Agent.find(query);

    // If propertyTypeId filter applied, show only that count
    if (propertyTypeId) {
      agents = agents
        .map((agent) => {
          const matchedType = agent.propertyTypes.find(
            (pt) => pt.propertyTypeId === propertyTypeId
          );
          return {
            ...agent.toObject(),
            filteredCount: matchedType ? matchedType.count : 0,
            filteredPropertyType: matchedType ? matchedType.propertyType : null,
          };
        })
        .filter((agent) => agent.filteredCount > 0); // hide agents with 0
    }

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAgents,
  createAgent,
};