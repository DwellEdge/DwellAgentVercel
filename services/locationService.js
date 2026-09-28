const axios = require("axios");

const PropertyDetails = require("../models/PropertyDetails");
const Agent = require("../models/Agent");
const Customer = require("../models/Customer");
const PropertyType = require("../models/PropertyType");

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;
const GEOAPIFY_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

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

const normalizeCityName = (value) => {
  if (!value) return "";
  const parts = String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const firstMeaningful = parts.find((part) => !["India", "IN", "State", "District"].includes(part));
  return firstMeaningful || parts[0] || "";
};

const buildDisplayNameFromParts = (city, state, county, country) => {
  const labelState = state || county;
  const parts = [city, labelState, country].filter(Boolean).map((part) => String(part).trim());
  if (parts.length === 0) return "";
  return parts.join(", ");
};

const formatGeoapifyCitySuggestion = (properties = {}, feature = {}) => {
  const city =
    properties.city ||
    properties.town ||
    properties.village ||
    properties.name ||
    "";

  if (!city) return null;

  const county = properties.county || properties.state_district || properties.county_name || "";
  const state = properties.state || properties.state_code || properties.region || "";
  const country = properties.country || "India";

  return {
    displayName: buildDisplayNameFromParts(city, state, county, country),
    city,
    state: state || county || "",
    country,
    latitude: feature?.geometry?.coordinates?.[1] ?? properties.lat ?? null,
    longitude: feature?.geometry?.coordinates?.[0] ?? properties.lon ?? null,
    placeId: properties.place_id || feature.id || null,
    raw: properties,
    type: properties.type || properties.result_type || null,
  };
};

const getGeoapifyCitySuggestions = async (query) => {
  if (!GEOAPIFY_API_KEY) return [];

  try {
    const response = await axios.get(GEOAPIFY_AUTOCOMPLETE_URL, {
      params: {
        text: query,
        limit: 8,
        type: "city",
        filter: "countrycode:in",
        apiKey: GEOAPIFY_API_KEY,
      },
      timeout: 10000,
    });

    const cityMap = new Map();

    (response.data?.features || []).forEach((feature) => {
      const properties = feature?.properties || {};
      const suggestion = formatGeoapifyCitySuggestion(properties, feature);

      if (!suggestion) return;

      const cityValue = (properties.city || properties.town || properties.village || properties.name || "").trim();
      const cityKey = cityValue.toLowerCase();

      if (!cityKey || cityKey.includes("street") || cityKey.includes("road") || cityMap.has(cityKey)) {
        return;
      }

      cityMap.set(cityKey, {
        ...suggestion,
        display_name: suggestion.displayName,
        city_name: cityValue,
        state_name: suggestion.state,
        country_name: suggestion.country,
      });
    });

    return Array.from(cityMap.values()).slice(0, 8);
  } catch (error) {
    console.error("Geoapify location search failed:", error.message);
    return [];
  }
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

  const cityMap = new Map();

  [...dbCities, ...(await getGeoapifyCitySuggestions(query))].forEach((item) => {
    const rawDisplayName = item.displayName || item.display_name || item.city_name || item.city || item.name || item;
    const cityName = item.city || item.city_name || normalizeCityName(rawDisplayName);
    const stateName = item.state || item.state_name || "";
    const countryName = item.country || item.country_name || "India";
    const displayName = item.displayName || item.display_name || (cityName ? buildDisplayNameFromParts(cityName, stateName, "", countryName) : cityName);

    if (!cityName) return;
    if (!cityMap.has(cityName.toLowerCase())) {
      cityMap.set(cityName.toLowerCase(), {
        displayName,
        display_name: displayName,
        city: cityName,
        city_name: cityName,
        state: stateName,
        state_name: stateName,
        country: countryName,
        country_name: countryName,
        place_id: item.place_id || item.placeId || `db_${cityName}`,
        latitude: item.latitude ?? item.lat ?? null,
        longitude: item.longitude ?? item.lon ?? null,
        lat: item.latitude ?? item.lat ?? "0",
        lon: item.longitude ?? item.lon ?? "0",
        source: item.source || "database",
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