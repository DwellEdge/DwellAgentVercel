const express = require("express");
const mongoose = require("mongoose");
const { getGridFSBucket } = require("../config/gridfs");

const router = express.Router();

router.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID",
      });
    }

    const bucket = getGridFSBucket();

    const files = await bucket
      .find({
        _id: new mongoose.Types.ObjectId(fileId),
      })
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "Media file not found",
      });
    }

    const file = files[0];

    res.set("Content-Type", file.contentType || "application/octet-stream");

    res.set(
      "Content-Disposition",
      `inline; filename="${file.filename}"`
    );

    const downloadStream = bucket.openDownloadStream(file._id);

    downloadStream.on("error", (error) => {
      console.error("GridFS download error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Unable to read media file",
        });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Property media error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;