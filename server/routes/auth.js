const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passport = require("passport");
const { sendMail } = require("../utils/mailer");
const { generateOTP, sendOTP } = require("../utils/otpService");
const UserActivity = require("../models/UserActivity");
const router = express.Router();

const pendingRegistrations = new Map();
// Maintain active login OTP sessions
const activeLoginOtpSessions = new Map();

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

        // Generate a unique registration ID
        const registrationId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        // Store registration data temporarily
        pendingRegistrations.set(registrationId, {
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            dateOfBirth,
            otp,
            otpExpiry,
            createdAt: new Date()
        });

        // Set cleanup timeout (remove pending registration after 15 minutes)
        setTimeout(() => {
            pendingRegistrations.delete(registrationId);
        }, 15 * 60 * 1000);

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        // Send OTP email notification
        sendMail({
            to: email,
            subject: "Verify Your Phone Number - Instruct",
            text: `Your OTP for Instruct registration is: ${otp}. Valid for 10 minutes.`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <style>
        :root {
            --primary-color: #eb9f18;
            --secondary-color: #b16901;
            --text-primary: #c6c6c4;
            --text-secondary: #8a8a89;
            --dark-bg: #0a0a0a;
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
            background: linear-gradient(135deg, #000000 0%, #282828 50%, #0a0a0a 100%);
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
        }

        .logo {
            position: relative;
            z-index: 1;
            margin-bottom: 20px;
        }

        .logo img {
            width: 180px;
            height: auto;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
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

        .welcome-text {
            font-size: 18px;
            color: var(--text-secondary);
            margin-bottom: 30px;
            text-align: center;
        }

        .otp-container {
            background: linear-gradient(145deg, #1c1c1c, #0f0f0f);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .otp-title {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 15px;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 20px 0;
        }

        .timer {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .timer-icon {
            width: 16px;
            height: 16px;
            fill: var(--text-secondary);
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, var(--primary-color), transparent);
            margin: 30px 0;
            opacity: 0.2;
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

        .security-notice {
            background: rgba(235, 159, 24, 0.05);
            border-left: 4px solid var(--primary-color);
            padding: 15px;
            margin: 30px 0;
            font-size: 14px;
            color: var(--text-secondary);
            border-radius: 0 8px 8px 0;
        }

        .footer {
            text-align: center;
            padding: 30px;
            background: linear-gradient(to bottom, #141414, #0a0a0a);
            color: var(--text-secondary);
            font-size: 13px;
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
            background-color: var(--primary-color);
            transform: translateY(-2px);
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
                <div class="logo">
                    <img src="https://instructedu.s3.eu-north-1.amazonaws.com/assets/mail+header.svg" alt="Instruct">
                </div>
            </div>
            
            <div class="content">
                <h1>Verify Your Account</h1>
                <p class="welcome-text">Welcome to Instruct! We're excited to have you join our learning community.</p>
                
                <div class="otp-container">
                    <div class="otp-title">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="timer">
                        <svg class="timer-icon" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7H11V13L16.2,16.2L17,14.9L12.5,12.2V7Z"/>
                        </svg>
                        Valid for 10 minutes
                    </div>
                </div>

                <div class="security-notice">
                    <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                </div>

                <div style="text-align: center;">
                    <a href="#" class="button">Complete Verification</a>
                </div>

                <div class="divider"></div>

                <p style="color: var(--text-secondary); font-size: 14px; text-align: center;">
                    If you didn't request this verification, please ignore this email or contact our support team.
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
                <li><a href="terms.html">Terms & Conditions</a></li>
                      <li><a href="privacy.policy.html">Privacy Policy</a></li>
            </div>
        </div>
    </div>
</body>
</html>`,
        }).catch((err) => console.error("Error sending OTP email:", err));

        res.status(200).json({
            message: "Verification code sent! Please verify your phone number with the OTP.",
            registrationId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { registrationId, otp } = req.body;

        // Get pending registration
        const registration = pendingRegistrations.get(registrationId);
        if (!registration) {
            return res.status(404).json({ message: "Registration session expired or not found. Please try again." });
        }

        // Check if OTP is expired
        if (registration.otpExpiry < new Date()) {
            return res.status(400).json({ message: "OTP expired. Please request a new one." });
        }

        // Verify OTP
        if (registration.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Now create the user in the database
        const newUser = new User({
            firstName: registration.firstName,
            lastName: registration.lastName,
            email: registration.email,
            phoneNumber: registration.phoneNumber,
            password: registration.password,
            dateOfBirth: registration.dateOfBirth,
            type: "student",
            is_verified: true // User is verified since OTP is correct
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Remove from pending registrations
        pendingRegistrations.delete(registrationId);

        // Send welcome email
        sendMail({
            to: registration.email,
            subject: "Welcome to Instruct!",
            text: "Thank you for registering at Instruct. Your account has been created successfully.",
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Instruct</title>
                <!-- Email styles here -->
            </head>
            <body>
                <div class="container">
                    <div class="email-wrapper">
                        <div class="header">
                            <!-- Header content -->
                        </div>
                        
                        <div class="content">
                            <h1>Welcome to Instruct!</h1>
                            <p>Your account has been created successfully.</p>
                            <p>Start exploring courses and expand your knowledge today!</p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>&copy; 2025 Instruct. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>`,
        }).catch((err) => console.error("Error sending welcome email:", err));

        res.json({
            message: "Registration completed successfully!",
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                type: newUser.type
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
    try {
        const { registrationId } = req.body;

        // Get pending registration
        const registration = pendingRegistrations.get(registrationId);
        if (!registration) {
            return res.status(404).json({ message: "Registration session expired or not found. Please try again." });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Update registration with new OTP
        registration.otp = otp;
        registration.otpExpiry = otpExpiry;
        pendingRegistrations.set(registrationId, registration);

        // Send OTP via SMS
        await sendOTP(registration.phoneNumber, otp);

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

        // Update last active time
        user.lastActive = new Date();
        await user.save();

        // Create login activity record
        await UserActivity.create({
            userId: user._id,
            action: 'login',
            details: {
                method: 'email',
                timestamp: new Date()
            }
        });

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


router.post("/send-login-otp", async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ message: "No account found with this phone number" });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Generate session ID
        const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        // Store OTP session
        activeLoginOtpSessions.set(sessionId, {
            phoneNumber,
            userId: user._id,
            otp,
            otpExpiry,
            attempts: 0,
            createdAt: new Date()
        });

        // Set cleanup timeout (remove session after 15 minutes)
        setTimeout(() => {
            activeLoginOtpSessions.delete(sessionId);
        }, 15 * 60 * 1000);

        // Send OTP via SMS
        await sendOTP(phoneNumber, otp);

        // Send email notification
        sendMail({
            to: user.email,
            subject: "Login Verification Code - Instruct",
            text: `Your OTP for Instruct login is: ${otp}. Valid for 10 minutes.`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <style>
        :root {
            --primary-color: #eb9f18;
            --secondary-color: #b16901;
            --text-primary: #c6c6c4;
            --text-secondary: #8a8a89;
            --dark-bg: #0a0a0a;
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
            background: linear-gradient(135deg, #000000 0%, #282828 50%, #0a0a0a 100%);
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
        }

        .logo {
            position: relative;
            z-index: 1;
            margin-bottom: 20px;
        }

        .logo img {
            width: 180px;
            height: auto;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
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

        .welcome-text {
            font-size: 18px;
            color: var(--text-secondary);
            margin-bottom: 30px;
            text-align: center;
        }

        .otp-container {
            background: linear-gradient(145deg, #1c1c1c, #0f0f0f);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .otp-title {
            font-size: 16px;
            color: var(--text-secondary);
            margin-bottom: 15px;
        }

        .otp-code {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 20px 0;
        }

        .timer {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .timer-icon {
            width: 16px;
            height: 16px;
            fill: var(--text-secondary);
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, var(--primary-color), transparent);
            margin: 30px 0;
            opacity: 0.2;
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

        .security-notice {
            background: rgba(235, 159, 24, 0.05);
            border-left: 4px solid var(--primary-color);
            padding: 15px;
            margin: 30px 0;
            font-size: 14px;
            color: var(--text-secondary);
            border-radius: 0 8px 8px 0;
        }

        .footer {
            text-align: center;
            padding: 30px;
            background: linear-gradient(to bottom, #141414, #0a0a0a);
            color: var(--text-secondary);
            font-size: 13px;
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
            background-color: var(--primary-color);
            transform: translateY(-2px);
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
                <div class="logo">
                    <img src="https://instructedu.s3.eu-north-1.amazonaws.com/assets/mail+header.svg" alt="Instruct">
                </div>
            </div>
            
            <div class="content">
                <h1>Verify Your Account</h1>
                <p class="welcome-text">Welcome to Instruct! We're excited to have you join our learning community.</p>
                
                <div class="otp-container">
                    <div class="otp-title">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="timer">
                        <svg class="timer-icon" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7H11V13L16.2,16.2L17,14.9L12.5,12.2V7Z"/>
                        </svg>
                        Valid for 10 minutes
                    </div>
                </div>

                <div class="security-notice">
                    <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                </div>

                <div style="text-align: center;">
                    <a href="#" class="button">Complete Verification</a>
                </div>

                <div class="divider"></div>

                <p style="color: var(--text-secondary); font-size: 14px; text-align: center;">
                    If you didn't request this verification, please ignore this email or contact our support team.
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
                <li><a href="terms.html">Terms & Conditions</a></li>
                      <li><a href="privacy.policy.html">Privacy Policy</a></li>
            </div>
        </div>
    </div>
</body>
</html>`
        
        }).catch(err => console.error("Error sending login OTP email:", err));

        res.json({
            message: "OTP sent to your phone number",
            sessionId
        });

    } catch (error) {
        console.error("Error sending login OTP:", error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
});

// Verify login OTP
router.post("/verify-login-otp", async (req, res) => {
    try {
        const { sessionId, otp } = req.body;

        // Get OTP session
        const session = activeLoginOtpSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session expired or not found. Please try again." });
        }

        // Check if OTP is expired
        if (session.otpExpiry < new Date()) {
            activeLoginOtpSessions.delete(sessionId);
            return res.status(400).json({ message: "OTP expired. Please request a new one." });
        }

        // Verify OTP
        if (session.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Find user
        const user = await User.findById(session.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Clear OTP fields
        user.otp = undefined;
        user.otpExpiry = undefined;

        // Update last active timestamp
        user.lastActive = new Date();

        // Add login activity to activity log
        user.activityLog.push({
            activityType: "login",
            timestamp: new Date()
        });

        // Save user
        await user.save();

        // Create UserActivity record
        await UserActivity.create({
            userId: user._id,
            action: "login",
            details: {
                method: "phone",
                timestamp: new Date()
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Remove OTP session
        activeLoginOtpSessions.delete(sessionId);

        res.json({
            success: true,
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
        console.error("Error verifying login OTP:", error);
        res.status(500).json({ message: "Failed to verify OTP", error: error.message });
    }
});

// Resend login OTP
router.post("/resend-login-otp", async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Get OTP session
        const session = activeLoginOtpSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session expired or not found. Please try again." });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Update session
        session.otp = otp;
        session.otpExpiry = otpExpiry;
        session.attempts = 0;
        activeLoginOtpSessions.set(sessionId, session);

        // Send OTP via SMS
        await sendOTP(session.phoneNumber, otp);

        // Find user for email notification
        const user = await User.findById(session.userId);
        if (user && user.email) {
            // Send email notification
            sendMail({
                to: user.email,
                subject: "New Login Verification Code - Instruct",
                text: `Your new OTP for Instruct login is: ${otp}. Valid for 10 minutes.`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Login Verification Code</h2>
            <p>Your new verification code for phone login is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
          `
            }).catch(err => console.error("Error sending login OTP email:", err));
        }

        res.json({ message: "OTP resent successfully", sessionId });

    } catch (error) {
        console.error("Error resending login OTP:", error);
        res.status(500).json({ message: "Failed to resend OTP", error: error.message });
    }
});
module.exports = router;
