const Customer = require("../models/Customer");
const { enrichAgents } = require("./enrichAgents");

// Saves the customer once (by mobile number). Reuses the record if it exists.
// transactionHistoryController looks the customer up by mobileNumber.
async function saveCustomer({ phone, name }) {
  const existing = await Customer.findOne({ mobileNumber: phone });
  if (existing) return existing;

  const lastCustomer = await Customer.findOne().sort({ Id: -1 });
  const nextId = lastCustomer ? lastCustomer.Id + 1 : 1001;

  return new Customer({
    Id: nextId,
    name,
    mobileNumber: phone,
    createdDateAndTime: new Date(),
  }).save();
}

// Adds mobile number, address etc. to each selected agent.
// Never throws: falls back to the agents the frontend sent.
async function getFullAgents(agents) {
  try {
    return await enrichAgents(agents || []);
  } catch (err) {
    console.error("enrichAgents failed (using raw agents):", err.message);
    return agents || [];
  }
}

// OPTIONAL: SMS + WhatsApp. Only called when ENABLE_TWILIO=true.
// Twilio is loaded here (not at the top of the file) so an inactive
// account or missing keys can't break the server or the payment flow.
async function sendCustomerMessages({ phone, name, fullAgents }) {
  const client = require("../services/twilioService");

  const agentDetails =
    fullAgents.length > 0
      ? fullAgents
          .map(
            (agent, i) =>
              `Agent ${i + 1}:\nName: ${agent.firstName} ${agent.lastName}\nMobile: ${agent.mobileNumber}\nCity: ${agent.city}\nArea: ${agent.area}\nProperty Address: ${agent.propertyAddress}`
          )
          .join("\n\n")
      : "No agents selected";

  await client.messages.create({
    body: `Hi ${name}! Thank you for using DwellAgent. Our agents will contact you shortly.`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}`,
  });

  await client.messages.create({
    body: `Hi ${name}! 👋\n\nThank you for using DwellAgent! 🏠\n\nYour selected agents:\n\n${agentDetails}\n\nOur team will reach out to you shortly.`,
    from: "whatsapp:+14155238886",
    to: `whatsapp:+91${phone}`,
  });
}

module.exports = { saveCustomer, getFullAgents, sendCustomerMessages };