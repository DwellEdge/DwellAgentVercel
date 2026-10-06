const Customer = require("../models/Customer");
const client = require("../services/twilioService");
const { enrichAgents } = require("./enrichAgents");

async function sendCustomerMessages({ phone, name, agents }) {
  const fullAgents = await enrichAgents(agents || []);

  const lastCustomer = await Customer.findOne().sort({ Id: -1 });
  const nextId = lastCustomer ? lastCustomer.Id + 1 : 1001;

  await new Customer({
    Id: nextId,
    name,
    mobileNumber: phone,
    createdDateAndTime: new Date(),
  }).save();

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

  return fullAgents;
}

module.exports = { sendCustomerMessages };