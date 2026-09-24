const axios = require("axios");

const PropertyDetails = require("../models/PropertyDetails");
const Agent = require("../models/Agent");
const Customer = require("../models/Customer");
const PropertyType = require("../models/Propertytype");

// P01=Rent, P02=Lease, P03=Sale (UI label may be "Purchase")
const purposeMap = {
  P01: "Rent",
  P02: "Lease",
  P03: "Sale",
};

// Case-insensitive dedupe helper — keeps the first-seen casing for each value
const dedupeCaseInsensitive = (items) => {
  const map = new Map();
  items.forEach((item) => {
    if (!item) return;
    const trimmed = String(item).trim();
    const key = trimmed.toLowerCase();
    if (!map.has(key)) {
      map.set(key, trimmed);
    }
  });
  return Array.from(map.values());
};

const resolvePurpose = async (propertyTypeOrId) => {
  if (!propertyTypeOrId) return null;

  if (purposeMap[propertyTypeOrId]) {
    return purposeMap[propertyTypeOrId];
  }

  const property = await PropertyType.findOne({
    $or: [
      { propertyTypeId: propertyTypeOrId },
      { propertyType: { $regex: `^${propertyTypeOrId}$`, $options: "i" } },
    ],
  }).lean();

  if (property?.propertyTypeId) {
    return purposeMap[property.propertyTypeId] || null;
  }

  if (propertyTypeOrId.toLowerCase() === "purchase") {
    return "Sale";
  }

  if (["Rent", "Lease", "Sale"].includes(propertyTypeOrId)) {
    return propertyTypeOrId;
  }

  return null;
};

const searchLocations = async (query) => {
  const dbAgentCities = await PropertyDetails.find({
    city: {
      $regex: query,
      $options: "i",
    },
  }).distinct("city");

  const dbCustomerCities = await Customer.find({
    city: {
      $regex: query,
      $options: "i",
    },
  }).distinct("city");

  const dbCities = dedupeCaseInsensitive([
    ...dbAgentCities,
    ...dbCustomerCities,
  ]);

  if (dbCities.length > 0) {
    return dbCities.map((cityName, index) => ({
      display_name: cityName,
      place_id: `db_${index}`,
      lat: "0",
      lon: "0",
      source: "database",
    }));
  }

  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: `${query}, India`,
        format: "json",
        addressdetails: 1,
        limit: 8,
        countrycodes: "in",
      },
      headers: {
        "User-Agent": "DwellEdge/1.0",
      },
      timeout: 1000,
    },
  );

  const cityMap = new Map();

  (response.data || []).forEach((location) => {
    const cityName = location.display_name.split(",")[0].trim();

    if (cityName && !cityMap.has(cityName.toLowerCase())) {
      cityMap.set(cityName.toLowerCase(), {
        display_name: cityName,
        place_id: location.place_id,
        lat: location.lat,
        lon: location.lon,
        source: "nominatim",
      });
    }
  });

  return Array.from(cityMap.values()).slice(0, 8);
};

const getAreasByCity = async (city) => {
  const areas = await PropertyDetails.find({
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
    expiryDate: { $gt: new Date() },
  }).distinct("area");

  const customerAreas = await Customer.find({
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
  }).distinct("area");

  return dedupeCaseInsensitive([...areas, ...customerAreas]).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
};

const getCustomersByArea = async (city, area, propertyTypeOrId) => {
  const TransactionHistory = require("../models/TransactionHistory");

  const areaName = area.split(",")[0].trim();
  const purpose = await resolvePurpose(propertyTypeOrId);

  const propertyFilter = {
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
    area: {
      $regex: `^${areaName}$`,
      $options: "i",
    },
    expiryDate: { $gt: new Date() },
  };

  if (purpose) {
    propertyFilter.propertyAvailableFor = purpose;
  }

  const propertyResults = await PropertyDetails.find(propertyFilter).lean();

  const propertyCountByAgent = {};
  propertyResults.forEach((property) => {
    propertyCountByAgent[property.agentId] =
      (propertyCountByAgent[property.agentId] || 0) + 1;
  });

  const agentIds = Object.keys(propertyCountByAgent);
  const agents = agentIds.length
    ? await Agent.find({ agentId: { $in: agentIds } }).lean()
    : [];

  const previousTransactions = await TransactionHistory.find({
    city: { $regex: `^${city}$`, $options: "i" },
    area: { $regex: `^${areaName}$`, $options: "i" },
    ...(propertyTypeOrId ? { propertyType: propertyTypeOrId } : {}),
  }).lean();

  const usedAgentIds = new Set(
    previousTransactions.flatMap((transaction) => transaction.agentIds || []),
  );

  const sortedAgents = agents
    .map((agent) => ({
      ...agent,
      filteredCount: propertyCountByAgent[agent.agentId] || 0,
      filteredPropertyType: purpose,
      properties: propertyResults.filter((p) => p.agentId === agent.agentId),
    }))
    .sort((a, b) => {
      const aUsed = usedAgentIds.has(a.agentId);
      const bUsed = usedAgentIds.has(b.agentId);
      if (aUsed === bUsed) return 0;
      return aUsed ? 1 : -1;
    });

  const customerResults = await Customer.find({
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
    area: {
      $regex: `^${areaName}$`,
      $options: "i",
    },
  }).lean();

  return [
    ...sortedAgents.map((a) => ({
      ...a,
      type: "Agent",
    })),
    ...customerResults.map((c) => ({
      ...c,
      type: "Customer",
    })),
  ];
};

module.exports = {
  searchLocations,
  getAreasByCity,
  getCustomersByArea,
};