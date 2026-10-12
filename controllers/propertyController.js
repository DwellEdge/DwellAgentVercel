const PropertyDetails = require("../models/PropertyDetails");
const Agent = require("../models/Agent");
const client = require("../services/twilioService");
const { getGridFSBucket, getBaseUrlFromRequest } = require("../config/gridfs");

const purposeMap = { P01: "Rent", P02: "Lease", P03: "Sale" };
const VALID_BHK = ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK"];

const normalizePurpose = (value) => {
  if (!value) return null;
  const text = String(value).trim();

  if (["Rent", "Lease", "Sale"].includes(text)) return text;
  if (text === "P01") return "Rent";
  if (text === "P02") return "Lease";
  if (text === "P03") return "Sale";
  return null;
};

const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();

      const filename = `property-${file.fieldname}-${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}-${file.originalname}`;

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.mimetype,
        metadata: {
          fieldname: file.fieldname,
          originalName: file.originalname,
        },
      });

      uploadStream.on("error", reject);

      uploadStream.on("finish", () => {
        resolve({
          id: uploadStream.id.toString(),
          filename,
          contentType: file.mimetype,
        });
      });

      uploadStream.end(file.buffer);
    } catch (error) {
      reject(error);
    }
  });
};

const buildMediaUrls = (files = [], req) => {
  const baseUrl = getBaseUrlFromRequest(req);

  return (files || [])
    .filter(Boolean)
    .map((file) => {
      const raw = typeof file === "string" ? file : file.path || file.filename || "";
      if (!raw) return "";
      if (/^https?:\/\//i.test(raw)) return raw;

      const normalized = raw.replace(/\\/g, "/").replace(/^\/+/, "");
      const isGridFsId = /^[0-9a-fA-F]{24}$/.test(normalized);

      if (isGridFsId) {
        return `${baseUrl}/api/property-media/${normalized}`;
      }

      const cleanFile = normalized.replace(/^uploads\//i, "");
      return `${baseUrl}/uploads/${cleanFile}`;
    })
    .filter(Boolean);
};

const buildPhotoUrls = (photos, req) => buildMediaUrls(photos, req);

const buildVideoUrls = (videos, req) => buildMediaUrls(videos, req);

const addProperty = async (req, res) => {
  try {
    console.log({
      route: "POST /api/properties",
      database: require("mongoose").connection.name,
      collection: PropertyDetails.collection.name,
    });

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
      bhk,
      carParking,
      twoWheelerParking,
      landmark,
    } = req.body;

    // Photos and videos uploaded via multer
    const photoFiles = req.files?.photos || [];
    const videoFiles = req.files?.videos || [];

    const uploadedPhotos = await Promise.all(
      photoFiles.map((file) => uploadToGridFS(file)),
    );

    const uploadedVideos = await Promise.all(
      videoFiles.map((file) => uploadToGridFS(file)),
    );

    const photos = uploadedPhotos.map((file) => file.id);
    const videos = uploadedVideos.map((file) => file.id);

    // --- Server-side validation (client-side checks can be bypassed) ---
    if (photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one property photo is required.",
      });
    }

    if (!bhk || !VALID_BHK.includes(bhk)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid BHK (1BHK–5BHK).",
      });
    }

    // Parse amenities — sent as JSON string from FormData
    let amenities = {};
    try {
      amenities = req.body.amenities ? JSON.parse(req.body.amenities) : {};
    } catch {
      amenities = {};
    }

    const property = await PropertyDetails.create({
      agentId,
      propertyAvailableFor,
      propertyCost: Number(propertyCost),
      propertyAddress,
      area,
      city,
      pinCode,
      facing,
      propertyType,
      bhk,
      carParking: carParking === "true" || carParking === true,
      twoWheelerParking:
        twoWheelerParking === "true" || twoWheelerParking === true,
      amenities,
      landmark: landmark || "",
      photos,
      videos,
    });

    console.log({
      route: "POST /api/properties",
      database: require("mongoose").connection.name,
      collection: PropertyDetails.collection.name,
      propertyId: property._id.toString(),
    });

    // Respond immediately so frontend doesn't wait
    res.status(201).json({ success: true, data: property });

    // SMS after response
    try {
      const agent = await Agent.findOne({ agentId }).lean();
      console.log(
        "Agent found for SMS:",
        agent ? agent.firstName : "NOT FOUND",
      );

      if (agent && agent.mobileNumber) {
        const smsMessage =
          `Hi ${agent.firstName}, your property has been successfully registered on DwellAgent!\n\n` +
          `Property Details:\n` +
          `Available For: ${propertyAvailableFor}\n` +
          `BHK: ${bhk}\n` +
          `Cost: Rs.${Number(propertyCost).toLocaleString()}\n` +
          `Address: ${propertyAddress}, ${area}, ${city} - ${pinCode}\n` +
          `Photos uploaded: ${photos.length}\n` +
          `Your listing will be visible to customers for 90 days.\n\n` +
          `Thank you for using DwellAgent!`;

        await client.messages.create({
          body: smsMessage,
          from: process.env.TWILIO_PHONE,
          to: `+91${agent.mobileNumber}`,
        });
        console.log(`Property SMS sent to +91${agent.mobileNumber}`);
      } else {
        console.log(
          "SMS skipped — agent not found or no mobile. agentId:",
          agentId,
        );
      }
    } catch (smsErr) {
      console.error("Property SMS error:", smsErr.message);
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

    const result = properties.map((p) => ({
      ...p,
      photoUrls: buildPhotoUrls(p.photos, req),
      videoUrls: buildVideoUrls(p.videos, req),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchProperties = async (req, res) => {
  try {
    console.log({
      route: "GET /api/properties/search",
      database: require("mongoose").connection.name,
      collection: PropertyDetails.collection.name,
    });

    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const propertyTypeId = req.query.propertyTypeId?.trim();
    const minBudget = req.query.minBudget ? Number(req.query.minBudget) : null;
    const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null;
    const bhk = req.query.bhk?.trim();

    if (!city || !area) return res.json([]);

    const purpose = normalizePurpose(propertyTypeId) || purposeMap[propertyTypeId] || null;

    const filter = {
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
      expiryDate: { $gt: new Date() },
    };

    if (purpose) {
      filter.propertyAvailableFor = purpose;
    }

    if (bhk && VALID_BHK.includes(bhk)) {
      filter.bhk = bhk;
    }

    if (minBudget !== null || maxBudget !== null) {
      filter.propertyCost = {};
      if (minBudget !== null) filter.propertyCost.$gte = minBudget;
      if (maxBudget !== null) filter.propertyCost.$lte = maxBudget;
    }

    const properties = await PropertyDetails.find(filter).lean();

    console.log({
      route: "GET /api/properties/search",
      database: require("mongoose").connection.name,
      collection: PropertyDetails.collection.name,
      resultCount: properties.length,
    });

    // Fetch agents for all properties
    const agentIds = [...new Set(properties.map((p) => p.agentId))];
    const agents = await Agent.find({ agentId: { $in: agentIds } }).lean();
    const agentMap = {};
    agents.forEach((a) => (agentMap[a.agentId] = a));

    const result = properties.map((prop) => ({
      ...prop,
      agent: agentMap[prop.agentId] || null,
      // Photos and videos are per-property — each property has its own
      photoUrls: buildPhotoUrls(prop.photos, req),
      videoUrls: buildVideoUrls(prop.videos, req),
      hasPhotos: (prop.photos || []).length > 0,
      hasVideos: (prop.videos || []).length > 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("Search properties error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addProperty, getPropertiesByAgent, searchProperties };
