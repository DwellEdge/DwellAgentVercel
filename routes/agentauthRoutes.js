const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { registerAgent, loginAgent } = require("../controllers/agentauthController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
  ]),
  registerAgent
);

router.post("/login", loginAgent);

module.exports = router;