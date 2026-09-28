const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "DwellEdge";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || EMAIL_FROM;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";
const EMAIL_LIST_UNSUBSCRIBE = process.env.EMAIL_LIST_UNSUBSCRIBE;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be defined in the environment.");
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    ciphers: "TLSv1.2",
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error.message);
  } else {
    console.log("Email transporter is ready to send messages.");
  }
});

// Welcome email sent on registration
const sendWelcomeEmail = async (agent) => {
  const siteUrl = process.env.APP_URL || "http://localhost:5173";
  const unsubscribeHeader = EMAIL_LIST_UNSUBSCRIBE
    ? ` <${EMAIL_LIST_UNSUBSCRIBE}>`
    : undefined;

  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    sender: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    replyTo: EMAIL_REPLY_TO,
    to: agent.email,
    subject: "Welcome to DwellEdge",
    text:
      `Welcome to DwellEdge let grow the business through mutual co-operation! below are the important details\n\n` +
      `Dwelledge link to publish the property: ${siteUrl}/agent-login\n` +
      `login id: ${agent.loginId}\n` +
      `Registered mobile number: ${agent.mobileNumber}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to DwellEdge</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #fff7f3; margin: 0; padding: 32px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #fdd9c8; border-radius: 16px; padding: 32px;">
            <h2 style="color: #7c2d12; margin: 0 0 8px;">Welcome to DwellEdge!</h2>
            <p style="color: #a8674a; font-size: 14px; line-height: 1.6;">
              Let's grow the business through mutual co-operation! Below are your important details.
            </p>
            <div style="background: #fff8f5; border: 1px solid #fdd9c8; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 12px; font-size: 14px; color: #7c2d12;">
                <strong>🔗 Dwelledge link to publish the property:</strong><br/>
                <a href="${siteUrl}/agent-login" style="color: #e8724a;">${siteUrl}/agent-login</a>
              </p>
              <p style="margin: 0 0 12px; font-size: 14px; color: #7c2d12;">
                <strong>🪪 Login ID:</strong> ${agent.loginId}
              </p>
              <p style="margin: 0; font-size: 14px; color: #7c2d12;">
                <strong>📞 Registered Mobile Number:</strong> +91${agent.mobileNumber}
              </p>
            </div>
            <p style="color: #d4a090; font-size: 12px; text-align: center; margin: 0;">© 2026 DwellAgent</p>
          </div>
        </body>
      </html>
    `,
    headers: {
      "X-Mailer": "DwellEdge Mail Service",
      "X-Priority": "3 (Normal)",
      Importance: "Normal",
      ...(unsubscribeHeader
        ? { "List-Unsubscribe": unsubscribeHeader }
        : {}),
    },
    envelope: {
      from: EMAIL_FROM,
      to: agent.email,
    },
  };

  await transporter.sendMail(mailOptions);
};

// OTP email sent on forgot password
const sendPasswordResetOtpEmail = async ({ email, otp }) => {
  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    replyTo: EMAIL_REPLY_TO,
    to: email,
    subject: "DwellEdge — Password Reset OTP",
    text:
      `Your OTP for password reset is: ${otp}\n\n` +
      `This OTP is valid for 5 minutes. Do not share it with anyone.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Password Reset OTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #fff7f3; margin: 0; padding: 32px;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #fdd9c8; border-radius: 16px; padding: 32px;">
            <h2 style="color: #7c2d12; margin: 0 0 8px;">Password Reset</h2>
            <p style="color: #a8674a; font-size: 14px; line-height: 1.6;">
              You requested a password reset for your DwellEdge account.
              Use the OTP below to proceed. It expires in <strong>5 minutes</strong>.
            </p>
            <div style="background: #fff8f5; border: 1px solid #fdd9c8; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #a8674a;">Your OTP</p>
              <p style="margin: 0; font-size: 36px; font-weight: bold; color: #e8724a; letter-spacing: 8px;">
                ${otp}
              </p>
            </div>
            <p style="color: #a8674a; font-size: 13px;">
              If you did not request this, please ignore this email.
              Do not share this OTP with anyone.
            </p>
            <p style="color: #d4a090; font-size: 12px; text-align: center; margin: 0;">© 2026 DwellAgent</p>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;
module.exports.sendPasswordResetOtpEmail = sendPasswordResetOtpEmail;