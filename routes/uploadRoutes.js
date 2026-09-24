const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const base = path.join(__dirname, '..', 'uploads');
    const sub = file.fieldname === 'videos' ? 'videos' : 'images';
    const dest = path.join(base, sub);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files allowed for images field'));
  }
  if (file.fieldname === 'videos') {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    return cb(new Error('Only video files allowed for videos field'));
  }
  cb(null, false);
};

const upload = multer({ storage, fileFilter });

// Accept multiple images and videos. images -> uploads/images, videos -> uploads/videos
router.post('/media', upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'videos', maxCount: 5 },
]), (req, res) => {
  try {
    res.json({ success: true, files: req.files });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Route-level error handler to catch multer and other errors and return JSON
router.use((err, req, res, next) => {
  console.error('Upload route error:', err && err.message ? err.message : err);
  if (res.headersSent) return next(err);
  const status = err && err.code === 'LIMIT_UNEXPECTED_FILE' ? 400 : 500;
  res.status(status).json({ success: false, message: err.message || 'Upload error' });
});

module.exports = router;
