const axios = require("axios");

const Agent = require("../models/Agent");
const Customer = require("../models/Customer");

const searchLocations = async (query) => {

  const dbAgentCities = await Agent.find({
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

  const dbCities = [
    ...new Set([
      ...dbAgentCities,
      ...dbCustomerCities,
    ]),
  ];

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
      timeout: 3000,
    }
  );

  const cityMap = new Map();

  (response.data || []).forEach((location) => {

    const cityName =
      location.display_name
        .split(",")[0]
        .trim();

    if (
      cityName &&
      !cityMap.has(cityName.toLowerCase())
    ) {
      cityMap.set(
        cityName.toLowerCase(),
        {
          display_name: cityName,
          place_id: location.place_id,
          lat: location.lat,
          lon: location.lon,
          source: "nominatim",
        }
      );
    }
  });

  return Array.from(
    cityMap.values()
  ).slice(0, 8);
};

const getAreasByCity = async (city) => {

  const areas = await Agent.find({
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
  }).distinct("area");

  const customerAreas =
    await Customer.find({
      city: {
        $regex: `^${city}$`,
        $options: "i",
      },
    }).distinct("area");

  return [
    ...new Set([
      ...areas,
      ...customerAreas,
    ]),
  ].sort();
};

const getCustomersByArea = async (
  city,
  area
) => {

  const areaName =
    area.split(",")[0].trim();

  const agentResults =
    await Agent.find({
      city: {
        $regex: `^${city}$`,
        $options: "i",
      },
      area: {
        $regex: `^${areaName}$`,
        $options: "i",
      },
    }).lean();

  const customerResults =
    await Customer.find({
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
    ...agentResults.map((a) => ({
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