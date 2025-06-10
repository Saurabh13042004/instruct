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

const getSuccessEmailTemplate = ({ userName, courseName, amount, transactionId, date, paymentMethod, redirectLink }) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction Successful</title>
    <style>
        :root {
            --primary-color: #eb9f18;
            --secondary-color: #b16901;
            --text-primary: #c6c6c4;
            --text-secondary: #8a8a89;
            --dark-bg: #0a0a0a;
            --darker-bg: #050505;
            --card-bg: #141414;
        }
        
        body {
            list-style: none;
            margin: 0;
            padding: 0;
            background: linear-gradient(145deg, var(--dark-bg), #000000);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--text-primary);
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .email-wrapper {
            background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(145deg, var(--dark-bg), var(--darker-bg));
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
            border-bottom: 2px solid var(--primary-color);
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at top right, rgba(235, 159, 24, 0.1), transparent 60%),
                        radial-gradient(circle at bottom left, rgba(177, 105, 1, 0.1), transparent 60%);
        }

        .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 4px 15px rgba(235, 159, 24, 0.3);
        }

        .success-icon svg {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .logo {
            position: relative;
            z-index: 1;
        }

        .logo img {
            width: 180px;
            height: auto;
            filter: brightness(1.1) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        }

        .content {
            padding: 40px;
            background-color: var(--card-bg);
        }

        h1 {
            color: var(--primary-color);
            font-size: 28px;
            margin: 0 0 20px;
            text-align: center;
            font-weight: 600;
        }

        .transaction-details {
            background: linear-gradient(145deg, #1c1c1c, #0f0f0f);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid rgba(235, 159, 24, 0.1);
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(235, 159, 24, 0.1);
        }

        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .detail-label {
            color: var(--text-secondary);
        }

        .detail-value {
            color: var(--text-primary);
            font-weight: 600;
        }

        .amount {
            font-size: 32px;
            color: var(--primary-color);
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(235, 159, 24, 0.2);
        }

        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(235, 159, 24, 0.3);
        }

        .footer {
            text-align: center;
            padding: 30px;
            background: linear-gradient(to bottom, #141414, #0a0a0a);
            color: var(--text-secondary);
            font-size: 13px;
            border-top: 1px solid rgba(198, 198, 196, 0.1);
        }

        .social-links {
            margin: 20px 0;
            display: inline-flex
        }

        .social-icon {
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 10px;
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 50%;
            padding: 8px;
            transition: all 0.3s ease;
            opacity: 0.8;
        }

        .social-icon:hover {
            opacity: 1;
            transform: translateY(-2px);
        }

        @media only screen and (max-width: 480px) {
            .container { padding: 20px 10px; }
            .content { padding: 20px; }
            .transaction-details { padding: 20px; }
            .amount { font-size: 28px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <div class="success-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                </div>
                <div class="logo">
                    <img src="https://instructedu.s3.eu-north-1.amazonaws.com/assets/mail+header.svg" alt="Instruct">
                </div>
            </div>
            
            <div class="content">
                <h1>Transaction Successful!</h1>
                <p style="text-align: center; color: var(--text-secondary);">Dear ${userName},</p>
                <p style="text-align: center; color: var(--text-secondary);">
                    Your payment for the course <b>${courseName}</b> has been processed successfully. Here are your transaction details.
                </p>

                <div class="amount">₹${amount} INR</div>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID</span>
                        <span class="detail-value">${transactionId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">${paymentMethod}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Course</span>
                        <span class="detail-value">${courseName}</span>
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="${redirectLink}" class="button">Begin now</a>
                </div>

                <p style="color: var(--text-secondary); font-size: 14px; text-align: center; margin-top: 30px;">
                    Course access will be activated within the next 5 minutes. Thank you for choosing Instruct!
                </p>
            </div>

            <div class="footer">
                <div class="social-links">
                    <a href="https://t.me/instructedu" class="social-icon">
                        <img src="https://instructedu.s3.eu-north-1.amazonaws.com/assets/tele.svg.svg" alt="Telegram">
                    </a>
                    <a href="https://www.youtube.com/@Instruct-edu?sub_confirmation=1" class="social-icon">
                        <img src="https://instructedu.s3.eu-north-1.amazonaws.com/assets/yt+(2).svg" alt="Youtube">
                    </a>
                    <a href="https://whatsapp.com/channel/0029VapAEFwIt5rn5nNfnx05" class="social-icon">
                        <img src="https://instructedu.s3.eu-north-1.amazonaws.com/assets/whatsapp.svg" alt="Whatsapp">
                    </a>
                </div>
                <p>&copy; 2025 Instruct. All rights reserved.</p>
                <p>This is an automated message. Please do not reply.</p>
                <ul style="list-style: none; padding: 0; margin-top: 10px;">
                  <li style="display: inline-block; margin: 0 5px;"><a href="#" style="color: var(--text-secondary); text-decoration: none;">Terms & Conditions</a></li>
                  <li style="display: inline-block; margin: 0 5px;"><a href="#" style="color: var(--text-secondary); text-decoration: none;">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
};

const sendMail = async ({ to, subject, text, html, templateData }) => {
  const mailOptions = {
    from: process.env.SMTP_USER || "no-reply@instructedu.in",
    to,
    subject,
    text,
    html: templateData ? getSuccessEmailTemplate(templateData) : html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail, getSuccessEmailTemplate };
