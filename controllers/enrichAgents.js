const mongoose = require("mongoose");
const Agent = require("../models/Agent");
const PropertyDetails = require("../models/PropertyDetails");

const norm = (s) => String(s || "").trim().toLowerCase();

async function enrichAgents(agents = []) {
  // Home.jsx sets agentId = record.agentId || record._id, so accept either form
  const ids = [
    ...new Set(
      agents.flatMap((a) => [a.agentId, a._id]).filter(Boolean).map(String)
    ),
  ];
  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

  // Mobile number comes from the Agents collection
  const agentDocs = await Agent.find({
    $or: [{ agentId: { $in: ids } }, { _id: { $in: objectIds } }],
  }).lean();

  const findAgentDoc = (a) =>
    agentDocs.find(
      (d) =>
        String(d.agentId) === String(a.agentId) ||
        String(d._id) === String(a.agentId) ||
        String(d._id) === String(a._id)
    );

  // Property address comes from the PropertyDetails collection
  const businessIds = [...new Set(agentDocs.map((d) => d.agentId))];

  // CHANGE 1: only non-expired properties
  const props = await PropertyDetails.find({
    agentId: { $in: businessIds },
    expiryDate: { $gt: new Date() },
  }).lean();

  return agents.map((a) => {
    const doc = findAgentDoc(a);

    const areaKey = norm(a.area);
    const cityKey = norm(a.city); // CHANGE 2a: new line
    const purposeKey = norm(a.propertyTypeName); // Rent / Sale / Lease

    // CHANGE 2b: filter now also checks the city
    const matches = props.filter((p) => {
      if (!doc || p.agentId !== doc.agentId) return false;
      const pArea = norm(p.area);
      const areaOk = !areaKey || pArea === areaKey || pArea.includes(areaKey) || areaKey.includes(pArea);
      const cityOk = !cityKey || norm(p.city) === cityKey;
      const purposeOk = !purposeKey || norm(p.propertyAvailableFor) === purposeKey;
      return areaOk && cityOk && purposeOk;
    });

    const addresses = [...new Set(matches.map((p) => p.propertyAddress).filter(Boolean))];

    return {
      ...a,
      mobileNumber: doc?.mobileNumber || "Not available",
      propertyAddress: addresses.length
        ? addresses.slice(0, 3).join(" | ")
        : "Not available",
    };
  });
}

module.exports = { enrichAgents };