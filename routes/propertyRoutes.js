const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  addProperty,
  getPropertiesByAgent,
  searchProperties,
} = require("../controllers/propertyController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `property-${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photos") {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Photos must be JPEG, PNG or WebP"), false);
  } else if (file.fieldname === "videos") {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Videos must be MP4, WebM or MOV"), false);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

const handleUpload = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "videos", maxCount: 2 },
  ]);
  uploadFields(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.get("/search", searchProperties);
router.post("/", handleUpload, addProperty);
router.get("/:agentId", getPropertiesByAgent);

module.exports = router;