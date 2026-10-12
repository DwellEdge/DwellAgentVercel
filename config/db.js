const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);

    console.log("✅ MongoDB Connected");
    console.log("Database:", mongoose.connection.name);
    console.log("Collection check: PropertyDetails ->", require("../models/PropertyDetails").collection.name);
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;