const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST || "smtpout.secureserver.net",
  port: process.env.SMTP_PORT || 456,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "no-reply@instructedu.in",
    pass: process.env.SMTP_PASS || "@Instruct.team0018",
  },
});

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.SMTP_USER || "no-reply@instructedu.in",
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
