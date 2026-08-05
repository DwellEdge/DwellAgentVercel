require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const agentRoutes = require("./routes/agentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const propertyTypeGetRoutes = require("./routes/propertyType");
const propertyTypeCreateRoutes = require("./routes/propertyTypeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const transactionHistoryRoutes = require("./routes/transactionHistoryRoutes");
const agentAuthRoutes = require("./routes/agentAuthRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

connectDB();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.use("/api", locationRoutes);
app.use("/api/property-types", propertyTypeGetRoutes);
app.use("/api/property-types", propertyTypeCreateRoutes);
app.use("/api/transactions", transactionHistoryRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", messageRoutes);
app.use("/api/agent-auth", agentAuthRoutes);
app.use("/api/properties", propertyRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});