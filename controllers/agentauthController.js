const Agent = require("../models/Agent");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const client = require("../services/twilioService");
const sendWelcomeEmail = require("../services/emailService");
const { sendPasswordResetOtpEmail } = require("../services/emailService");

const sanitize = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|OR|AND)\b)/gi, "");
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getNextAgentId = async () => {
  const result = await Agent.aggregate([
    { $match: { agentId: { $regex: /^A\d+$/ } } },
    {
      $project: {
        number: {
          $toInt: {
            $substrCP: ["$agentId", 1, { $subtract: [{ $strLenCP: "$agentId" }, 1] }],
          },
        },
      },
    },
    { $sort: { number: -1 } },
    { $limit: 1 },
  ]);
  const nextNumber = result.length ? result[0].number + 1 : 1;
  return `A${String(nextNumber).padStart(2, "0")}`;
};

const registerAgent = async (req, res) => {
  try {
    const {
      firstName, lastName, email, mobileNumber,
      officeAddress, homeAddress, password, referral,
    } = req.body;

    const cleanFirstName = sanitize(firstName?.trim() || "");
    const cleanLastName = sanitize(lastName?.trim() || "");
    const cleanEmail = email?.toLowerCase().trim() || "";
    const cleanMobile = mobileNumber?.trim() || "";
    const cleanOffice = sanitize(officeAddress?.trim() || "");
    const cleanHome = sanitize(homeAddress?.trim() || "");
    const cleanReferral = referral?.trim() || "";

    if (!cleanFirstName || !cleanLastName)
      return res.status(400).json({ success: false, message: "Agent name is required" });

    if (!isValidEmail(cleanEmail))
      return res.status(400).json({ success: false, message: "Invalid email format" });

    if (!/^\d{10}$/.test(cleanMobile))
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });

    if (!cleanOffice)
      return res.status(400).json({ success: false, message: "Office address is required" });

    if (!cleanHome)
      return res.status(400).json({ success: false, message: "Home address is required" });

    if (!req.files?.photo?.[0])
      return res.status(400).json({ success: false, message: "Agent photo is required" });

    if (!req.files?.idDocument?.[0])
      return res.status(400).json({ success: false, message: "ID document is required" });

    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const existing = await Agent.findOne({ email: cleanEmail });
    if (existing)
      return res.status(400).json({ success: false, message: "Email already registered" });

    let referredBy = null;
    if (cleanReferral) {
      const referringAgent = await Agent.findOne({
        $or: [
          { loginId: { $regex: `^${cleanReferral}$`, $options: "i" } },
          { firstName: { $regex: `^${cleanReferral}$`, $options: "i" } },
        ],
      });
      if (!referringAgent) {
        return res.status(400).json({
          success: false,
          message: "Referral not found. Please enter a valid referral ID or agent name.",
        });
      }
      referredBy = {
        agentId: referringAgent.agentId,
        loginId: referringAgent.loginId,
        name: `${referringAgent.firstName} ${referringAgent.lastName}`,
      };
    }

    // Use let so retry loop can reassign
    let agentId = await getNextAgentId();
    let loginId = `${cleanFirstName}${agentId}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const photo = req.files?.photo?.[0]?.filename || "";
    const idDocument = req.files?.idDocument?.[0]?.filename || "";

    const buildPayload = () => ({
      agentId,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      mobileNumber: cleanMobile,
      officeAddress: cleanOffice,
      homeAddress: cleanHome,
      address: cleanOffice,
      photo,
      idDocument,
      password: hashedPassword,
      loginId,
      referredBy,
    });

    const maxRetries = 3;
    let agent;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        agent = await Agent.create(buildPayload());
        break;
      } catch (createError) {
        if (
          createError.code === 11000 &&
          createError.keyPattern?.agentId &&
          attempt < maxRetries
        ) {
          agentId = await getNextAgentId();
          loginId = `${cleanFirstName}${agentId}`;
          continue;
        }
        throw createError;
      }
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(agent);
      console.log("Welcome email sent.");
    } catch (emailError) {
      console.error("Email Error:", emailError.message);
    }

    // Send welcome SMS
    const smsMessage =
      `Welcome to DwellEdge let grow the business through mutual co-operation! ` +
      `below are the important details\n` +
      `DwellEdge link to publish the property: http://localhost:5173/agent-login\n` +
      `login id: ${loginId}\n` +
      `Registered email: ${cleanEmail}`;

    try {
      if (!process.env.TWILIO_PHONE) throw new Error("TWILIO_PHONE is not configured");
      await client.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE,
        to: `+91${cleanMobile}`,
      });
      console.log(`Welcome SMS sent to +91${cleanMobile}`);
    } catch (smsErr) {
      console.error("SMS send error:", smsErr.code || "unknown", smsErr.message);
    }

    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error("Register error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Registration failed due to an ID conflict. Please try again.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAgent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and Password are required" });
    }

    const cleanUsername = username.trim();

    const agent = await Agent.findOne({
      $or: [
        { email: cleanUsername.toLowerCase() },
        { loginId: { $regex: `^${cleanUsername}$`, $options: "i" } },
      ],
    });

    if (!agent) {
      return res.status(401).json({ success: false, message: "Invalid Username or Password" });
    }

    if (!agent.password) {
      return res.status(401).json({
        success: false,
        message: "This account was not registered through the portal",
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Username or Password" });
    }

    const { password: _, ...agentData } = agent.toObject();
    res.status(200).json({ success: true, message: "Login Successful", agent: agentData });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otp = String(crypto.randomInt(10000, 99999));
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    agent.otp = otp;
    agent.otpExpiry = otpExpiry;
    await agent.save();

    try {
      await sendPasswordResetOtpEmail({ email: agent.email, otp });
      console.log(`OTP email sent to ${agent.email}`);
    } catch (mailError) {
      console.error("Password reset email error:", mailError.message);
    }

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (
      !agent.otp ||
      agent.otp !== otp ||
      !agent.otpExpiry ||
      new Date(agent.otpExpiry) < new Date()
    ) {
      return res.status(400).json({ success: false, message: "OTP is invalid or expired" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (
      !agent.otp ||
      agent.otp !== otp ||
      !agent.otpExpiry ||
      new Date(agent.otpExpiry) < new Date()
    ) {
      return res.status(400).json({ success: false, message: "OTP is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    agent.password = hashedPassword;
    agent.otp = undefined;
    agent.otpExpiry = undefined;
    await agent.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerAgent, loginAgent, forgotPassword, verifyOtp, resetPassword };