const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");
const { sendMail } = require("../utils/mailer");
const { generateOTP, sendOTP } = require("../utils/otpService");
const router = express.Router();


// ----- Google OAuth -----
// Step 1: Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Google redirects back to your callback URL
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication: create a JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // Redirect to your frontend with the token (adjust the URL as needed)
        sendMail({
            to: req.user.email,
            subject: "Login Alert - Instruct",
            text: `You have successfully logged in via Google at ${new Date().toLocaleString()}.`,
            html: `<p>You have successfully logged in via Google at <strong>${new Date().toLocaleString()}</strong>.</p>`,
        }).catch((err) => console.error("Error sending Google login email:", err));

        res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    }
);




// Registration
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, dateOfBirth } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? "Email already registered"
                    : "Phone number already registered"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            dateOfBirth,
            type: "student",
            otp,
            otpExpiry,
            is_verified: false
        });

        await newUser.save();

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        // Send welcome email
        sendMail({
            to: email,
            subject: "Welcome to Instruct!",
            text: "Thank you for registering at Instruct. Please verify your phone number with the OTP sent.",
            html: `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instruct</title>
      <style>
          /* Your existing email styles */
      </style>
  </head>
  <body>
      <div class="container">
          <div class="email-wrapper">
              <div class="header">
                  <div class="welcome-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
                          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
                      </svg>
                  </div>
                  <div class="logo">
                      <img src="Assets used/mail header.svg" alt="Instruct">
                  </div>
              </div>
              
              <div class="content">
                  <h1>Verify Your Phone Number</h1>
                  <p style="text-align: center; color: var(--text-primary);">
                      Welcome to Instruct! Please verify your phone number with the OTP sent to ${phoneNumber}.
                  </p>
  
                  <div class="feature-card">
                      <div class="feature-title">🔐 Complete Your Registration</div>
                      <p>We've sent a verification code to your phone. Please enter it to complete your registration.</p>
                  </div>
  
                  <div style="text-align: center; margin-top: 30px;">
                      <a href="#" class="button">Verify Account</a>
                  </div>
              </div>
  
              <div class="footer">
                  <p>&copy; 2025 Instruct. All rights reserved.</p>
                  <p>This is an automated message. Please do not reply.</p>
              </div>
          </div>
      </div>
  </body>
  </html>`,
        }).catch((err) => console.error("Error sending registration email:", err));

        res.status(201).json({
            message: "Registration initiated! Please verify your phone number with the OTP sent.",
            userId: newUser._id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP is expired
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP expired. Please request a new one." });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark user as verified
        user.is_verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            message: "Phone number verified successfully!",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                type: user.type
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP via SMS
        await sendOTP(user.phoneNumber, otp);

        res.json({ message: "OTP resent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials!" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });


        sendMail({
            to: email,
            subject: "Login Alert - Instruct",
            text: `You have successfully logged in at ${new Date().toLocaleString()}.`,
            html: `<p>You have successfully logged in at <strong>${new Date().toLocaleString()}</strong>.</p>`,
        }).catch((err) => console.error("Error sending login email:", err));

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, type: user.type } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//forgot password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        sendMail({
            to: email,
            subject: "Reset password Alert - Instruct",
            text: `You have requested for password reset at ${new Date().toLocaleString()}.`,
            html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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

        .key-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 4px 15px rgba(235, 159, 24, 0.3);
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
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

        .otp-container {
            background: linear-gradient(145deg, #1c1c1c, #0f0f0f);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            border: 1px solid rgba(235, 159, 24, 0.1);
            position: relative;
        }

        .otp-container::before {
            content: '🤔';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24px;
            background: var(--card-bg);
            padding: 0 10px;
            border-radius: 50%;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: var(--primary-color);
            margin: 20px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .reminder-box {
            background: rgba(235, 159, 24, 0.05);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            border: 1px solid rgba(235, 159, 24, 0.1);
        }

        .reminder-title {
            color: var(--primary-color);
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .timer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: var(--text-secondary);
            margin-top: 15px;
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
        }

        @media only screen and (max-width: 480px) {
            .container { padding: 20px 10px; }
            .content { padding: 20px; }
            .otp-code { font-size: 28px; letter-spacing: 6px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <div class="key-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M7 14C5.9 14 5 13.1 5 12S5.9 10 7 10 9 10.9 9 12 8.1 14 7 14M12.6 10C11.8 7.7 9.6 6 7 6C3.7 6 1 8.7 1 12S3.7 18 7 18C9.6 18 11.8 16.3 12.6 14H16V18H20V14H23V10H12.6Z"/>
                    </svg>
                </div>
                <div class="logo">
                    <img src="/Assets used/mail header.svg" alt="instruct">
                </div>
            </div>
            
            <div class="content">
                <h1>Oops! Forgot Your Password?</h1>
                <p style="text-align: center; color: var(--text-secondary);">
                    Don't worry, it happens to the best of us! Let's get you back into your account.
                </p>

                <div class="otp-container">
                    <div style="color: var(--text-secondary);">Your Password Reset Code</div>
                    <div class="otp-code">847296</div>
                    <div class="timer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7H11V13L16.2,16.2L17,14.9L12.5,12.2V7Z"/>
                        </svg>
                        Code expires in 10 minutes
                    </div>
                </div>

                <div class="reminder-box">
                    <div class="reminder-title">
                        💡 Password Tips
                    </div>
                    <ul style="color: var(--text-secondary); margin: 10px 0; padding-left: 20px;">
                        <li>Mix uppercase and lowercase letters</li>
                        <li>Include numbers and special characters</li>
                        <li>Make it memorable but not guessable</li>
                        <li>Avoid using the same password everywhere</li>
                    </ul>
                </div>

                <div style="text-align: center;">
                    <a href="#" class="button">Reset Password</a>
                </div>

                <p style="color: var(--text-secondary); font-size: 14px; text-align: center; margin-top: 30px;">
                    Didn't request this reset? Please ignore this email or contact our support team if you have concerns.
                </p>
            </div>

            <div class="footer">
                <p>For your security, this password reset link will expire in 10 minutes.</p>
                <p>&copy; 2025 Instruct. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>`,
        }).catch((err) => console.error("Error sending login email:", err));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected Route Example
router.get("/protected", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided!" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: "This is a protected route", userId: verified.id });
    } catch (error) {
        res.status(401).json({ message: "Invalid token!" });
    }
});

module.exports = router;
