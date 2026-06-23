require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const agentRoutes = require("./routes/agentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Running");
});

const locationRoutes =
  require("./routes/locationRoutes");

  app.use(
  "/api",
  locationRoutes
);

app.use("/api/agents", agentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", messageRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(
    `Server Running On Port ${PORT}`
  );
});