const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  registerAgent,
  loginAgent,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/agentauthController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photo") {
    // Photo: JPEG and PNG only
    const allowed = ["image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Agent photo must be a JPEG or PNG file"), false);
    }
  } else if (file.fieldname === "idDocument") {
    // ID document: JPEG, PNG, PDF only
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("ID document must be a JPEG, PNG, or PDF file"), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

// Custom error handler for multer file type rejections
const handleUpload = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "idDocument", maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post("/register", handleUpload, registerAgent);
router.post("/login", loginAgent);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;