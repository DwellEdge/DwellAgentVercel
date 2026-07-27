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

const sendWelcomeEmail = async (agent) => {
    const siteUrl = process.env.APP_URL || "https://dwellagentvercel.onrender.com";
    const unsubscribeHeader = EMAIL_LIST_UNSUBSCRIBE ? ` <${EMAIL_LIST_UNSUBSCRIBE}>` : undefined;

    const mailOptions = {
        from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
        sender: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        replyTo: EMAIL_REPLY_TO,
        to: agent.email,
        subject: "Welcome to DwellEdge",
        text: `Welcome to DwellEdge!\n\n` +
              `Visit: ${siteUrl}\n` +
              `Login ID: ${agent.email}\n` +
              `Registered Mobile Number: ${agent.mobileNumber}\n\n` +
              `Thank you for registering with DwellEdge.`,
        html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Welcome to DwellEdge</title>
              </head>
              <body>
                <h2>Welcome to DwellEdge!</h2>
                <p>Let us grow the business through mutual co-operation.</p>
                <h3>Important Details</h3>
                <p><strong>DwellEdge Link:</strong></p>
                <p><a href="${siteUrl}">${siteUrl}</a></p>
                <p><strong>Login ID:</strong> ${agent.email}</p>
                <p><strong>Registered Mobile Number:</strong> ${agent.mobileNumber}</p>
                <p>Thank you for registering with DwellEdge.</p>
              </body>
            </html>
        `,
        headers: {
            "X-Mailer": "DwellEdge Mail Service",
            "X-Priority": "3 (Normal)",
            "Importance": "Normal",
            ...(unsubscribeHeader ? { "List-Unsubscribe": unsubscribeHeader } : {}),
        },
        envelope: {
            from: EMAIL_FROM,
            to: agent.email,
        },
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendWelcomeEmail;