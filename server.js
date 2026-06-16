console.log("=================================");
console.log("THIS IS MY CURRENT SERVER FILE");
console.log(__filename);
console.log("=================================");

const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
console.log("MONGO URL:", process.env.MONGO_URL);
const twilio= require("twilio");

const app = express();

const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/api/test-payment", (req, res) => {
  console.log("TEST PAYMENT HIT");
  res.send("PAYMENT ROUTE EXISTS");
});

app.get("/vijaytest", (req, res) => {
  res.send("VIJAY TEST ROUTE");
});

app.get("/", (req, res) => {
  res.send("ROOT ROUTE WORKING");
});

console.log("========== MY SERVER FILE LOADED ==========");
console.log(__filename);


const JWT_SECRET = process.env.JWT_SECRET || "secret123";

/* ================= CHECK ENV ================= */
if (!process.env.ATLAS_URI) {
  console.error("❌ ATLAS_URI missing in .env file");
  process.exit(1);
}


// MongoDB Connection
mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err.message);
    process.exit(1);
  });

// Define Customer Schema
const customerSchema = new mongoose.Schema({
  Id: Number,

  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,

  mobileNumber: String,

  createdDateAndTime: {
    type: Date,
    default: Date.now,
  },
});

// Define Agent Schema
const agentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,
  mobileNumber: String,
  propertyCount: Number,
});

const Customer = mongoose.model("Customer", customerSchema, "Customers");
const Agent = mongoose.model("Agent", agentSchema, "Agents");

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", port: 5002 });
});

// NEW: Get cities from DATABASE first (fast and reliable)
app.get("/api/location", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    console.log("Location search query:", query);

    if (!query || query.length < 2) {
      console.log("Query too short");
      return res.json([]);
    }

    try {
      // STEP 1: Get cities from DATABASE
      console.log("Searching database for cities matching:", query);
      
      const dbAgentCities = await Agent.find({
        city: { $regex: query, $options: "i" }
      }).distinct("city");
      
      const dbCustomerCities = await Customer.find({
        city: { $regex: query, $options: "i" }
      }).distinct("city");
      
      const dbCities = [...new Set([...dbAgentCities, ...dbCustomerCities])];
      
      console.log("Database cities found:", dbCities);

      // If we found cities in database, return them immediately
      if (dbCities.length > 0) {
        const results = dbCities.map((cityName, index) => ({
          display_name: cityName,
          place_id: `db_${index}`,
          lat: "0",
          lon: "0",
          source: "database"
        }));
        return res.json(results);
      }

      // STEP 2: If no database results, try Nominatim API as fallback
      console.log("No database results, trying Nominatim API...");
      
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
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
        },
        { timeout: 3000 }
      );

      console.log("Nominatim results:", response.data.length);

      // Extract and clean city names from Nominatim
      const cityMap = new Map();
      (response.data || []).forEach((location) => {
        const parts = location.display_name.split(",").map(p => p.trim());
        const cityName = parts[0]; // Take first part as city
        
        if (cityName && !cityMap.has(cityName.toLowerCase())) {
          cityMap.set(cityName.toLowerCase(), {
            display_name: cityName,
            place_id: location.place_id,
            lat: location.lat,
            lon: location.lon,
            source: "nominatim"
          });
        }
      });

      const results = Array.from(cityMap.values()).slice(0, 8);
      console.log("Final results:", results.map(r => r.display_name));
      res.json(results);

    } catch (nominatimError) {
      console.error("Nominatim error (non-critical):", nominatimError.message);
      // Don't fail if Nominatim fails - we already have database results or none
      res.json([]); 
    }
  } catch (error) {
    console.error("Error in /api/location:", error.message);
    res.status(500).json({
      message: "Error fetching locations",
      error: error.message,
    });
  }
});

// Get all unique areas for a given city
app.get("/api/areas", async (req, res) => {
  try {
    const city = req.query.city?.trim();
    
    if (!city) {
      return res.json([]);
    }

    console.log("Fetching areas for city:", city);

    const areas = await Agent.find({
      city: { $regex: `^${city}$`, $options: "i" }
    }).distinct("area");
    
    const customerAreas = await Customer.find({
      city: { $regex: `^${city}$`, $options: "i" }
    }).distinct("area");
    
    const allAreas = [...new Set([...areas, ...customerAreas])].sort();
    
    console.log("Found areas:", allAreas);
    res.json(allAreas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({ error: error.message });
  }
});

// Search customers by city and area
app.get("/api/customers", async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();

    console.log("SEARCH CITY:", city);
    console.log("SEARCH AREA:", area);

    if (!city || !area) {
      return res.json([]);
    }

    const areaName = area.split(",")[0].trim();

    console.log("EXTRACTED CITY:", city);
    console.log("EXTRACTED AREA:", areaName);

    const agentResults = await Agent.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${areaName}$`, $options: "i" },
    }).lean();

    console.log("Agents Found:", agentResults.length);

    const customerResults = await Customer.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${areaName}$`, $options: "i" },
    }).lean();

    console.log("Customers Found:", customerResults.length);

    const results = [
      ...agentResults.map((agent) => ({
        ...agent,
        type: "Agent",
      })),
      ...customerResults.map((customer) => ({
        ...customer,
        type: "Customer",
      })),
    ];

    console.log("Total Results:", results.length);
    res.json(results);
  } catch (error) {
    console.error("Error in /api/customers:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/api/debug/data", async (req, res) => {
  try {
    const customerCount = await Customer.countDocuments();
    const agentCount = await Agent.countDocuments();
    const sampleCustomers = await Customer.find().limit(3);
    const sampleAgents = await Agent.find().limit(3);

    res.json({
      customerCount,
      agentCount,
      sampleCustomers,
      sampleAgents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    res.json(collections);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/debug/database", async (req, res) => {
  console.log("DEBUG DATABASE API HIT");

  res.json({
    database: mongoose.connection.db.databaseName,
  });
});

app.get("/api/raw", async (req, res) => {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    const result = {};

    for (const col of collections) {
      result[col.name] = await mongoose.connection.db
        .collection(col.name)
        .find({})
        .toArray();
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/test123", (req, res) => {
  res.send("TEST ROUTE WORKING");
});

// Add Agent
app.post("/api/agents", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      city,
      area,
      address,
      mobileNumber,
      propertyCount,
    } = req.body;

    const agent = new Agent({
      firstName,
      lastName,
      city,
      area,
      address,
      mobileNumber,
      propertyCount,
    });

    await agent.save();

    res.status(201).json({
      success: true,
      message: "Agent Added Successfully",
      data: agent,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Add Customer
app.post("/api/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);

    await customer.save();

    res.status(201).json({
      success: true,
      message: "Customer Added Successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

console.log("Registering routes...");
console.log("/api/health");
console.log("/api/location");
console.log("/api/areas");
console.log("/api/customers");
console.log("Routes registered successfully");


app.get("/api/agents", async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();

    const query = {};

    if (city) {
      query.city = {
        $regex: `^${city}$`,
        $options: "i",
      };
    }

    if (area) {
      query.area = {
        $regex: `^${area}$`,
        $options: "i",
      };
    }

    const agents = await Agent.find(query).lean();

    res.json(agents);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});


console.log("PAYMENT ROUTE REGISTERED");
console.log("BEFORE PAYMENT ROUTE");

app.post("/api/payment-request", async (req, res) => {
  console.log("PAYMENT REQUEST RECEIVED");
  console.log("REQ BODY:", req.body);

  try {
    const { mobileNumber, firstName } = req.body;

    const lastCustomer = await Customer
      .findOne()
      .sort({ Id: -1 });

    const nextId = lastCustomer
      ? lastCustomer.Id + 1
      : 1001;

    const customer = new Customer({
      Id: nextId,
      firstName,
      mobileNumber,
      createdDateAndTime: new Date(),
    });

    await customer.save();

    res.status(201).json({
      success: true,
      customer,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

console.log("AFTER PAYMENT ROUTE");

console.log("REGISTERING PAYMENT ROUTE");
console.log("REGISTERING TEST ROUTE");


// twilio 


const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post("/api/send-message", async (req, res) => {
  const { phone, name, agents } = req.body;

  if (!phone || phone.length !== 10 || isNaN(phone)) {
    return res.status(400).json({ success: false, error: "Invalid phone number" });
  }

  // Build agent details text
  const agentDetails = agents && agents.length > 0
    ? agents.map((agent, i) =>
        `Agent ${i + 1}:\nName: ${agent.firstName} ${agent.lastName}\nCity: ${agent.city}\nArea: ${agent.area}\nAddress: ${agent.address}\nMobile: ${agent.mobileNumber}`
      ).join("\n\n")
    : "No agents selected";

  const message = `Hi ${name}! 👋\n\nThank you for using DwellAgent! 🏠\n\nYour selected agents:\n\n${agentDetails}\n\nOur team will reach out to you shortly.`;

  try {
    // Send SMS
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });

    // Send WhatsApp
    await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Twilio error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});