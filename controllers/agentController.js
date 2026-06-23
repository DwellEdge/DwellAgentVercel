const Agent = require("../models/Agent");

const createAgent = async (req, res) => {
  try {
    const agent = new Agent(req.body);

    await agent.save();

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

    const query = {};

    if (city)
      query.city = {
        $regex: `^${city}$`,
        $options: "i",
      };

    if (area)
      query.area = {
        $regex: `^${area}$`,
        $options: "i",
      };

    const agents = await Agent.find(query);

    res.json(agents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createAgent,
  getAgents,
};