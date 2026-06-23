const Customer = require("../models/Customer");
const client = require("../services/twilioService");

const sendMessage = async (req, res) => {
  const { phone, name, agents } = req.body;

  if (!phone || phone.length !== 10 || isNaN(phone)) {
    return res.status(400).json({ success: false, error: "Invalid phone number" });
  }

  try {
    const lastCustomer = await Customer.findOne().sort({ Id: -1 });
    const nextId = lastCustomer ? lastCustomer.Id + 1 : 1001;

    const customer = new Customer({
      Id: nextId,
      name: name,
      mobileNumber: phone,
      createdDateAndTime: new Date(),
    });

    await customer.save();

    const agentDetails = agents && agents.length > 0
      ? agents.map((agent, i) =>
          `Agent ${i + 1}:\nName: ${agent.firstName} ${agent.lastName}\nCity: ${agent.city}\nArea: ${agent.area}\nAddress: ${agent.address}\nMobile: ${agent.mobileNumber}`
        ).join("\n\n")
      : "No agents selected";

    const smsMessage = `Hi ${name}! Thank you for using DwellAgent. Our agents will contact you shortly.`;

    const whatsappMessage = `Hi ${name}! 👋\n\nThank you for using DwellAgent! 🏠\n\nYour selected agents:\n\n${agentDetails}\n\nOur team will reach out to you shortly.`;

    await client.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });

    await client.messages.create({
      body: whatsappMessage,
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Error in sendMessage:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { sendMessage };