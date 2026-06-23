const {
  searchLocations,
  getAreasByCity,
  getCustomersByArea,
} = require(
  "../services/locationService"
);

const getLocations = async (
  req,
  res
) => {
  try {

    const query =
      req.query.q?.trim();

    if (
      !query ||
      query.length < 2
    ) {
      return res.json([]);
    }

    const locations =
      await searchLocations(query);

    res.json(locations);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Error fetching locations",
      error: error.message,
    });

  }
};

const getAreas = async (
  req,
  res
) => {
  try {

    const city =
      req.query.city?.trim();

    if (!city) {
      return res.json([]);
    }

    const areas =
      await getAreasByCity(city);

    res.json(areas);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

const getCustomers = async (
  req,
  res
) => {
  try {

    const city =
      req.query.city?.trim();

    const area =
      req.query.area?.trim();

    if (!city || !area) {
      return res.json([]);
    }

    const result =
      await getCustomersByArea(
        city,
        area
      );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  getLocations,
  getAreas,
  getCustomers,
};