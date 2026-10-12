const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

const getGridFSBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not ready");
  }

  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "propertyMedia",
    });
  }

  return bucket;
};

const getBaseUrlFromRequest = (req) => {
  const headers = req?.headers || {};
  const forwardedProto = headers["x-forwarded-proto"];
  const forwardedHost = headers["x-forwarded-host"];

  const protocol =
    forwardedProto?.split(",")[0].trim() ||
    req?.protocol ||
    "http";

  const host =
    forwardedHost?.split(",")[0].trim() ||
    req?.get?.("host") ||
    process.env.APP_URL ||
    "localhost:5002";

  const cleanHost = host.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return `${protocol}://${cleanHost}`;
};

module.exports = {
  getGridFSBucket,
  getBaseUrlFromRequest,
};