const axios = require('axios');

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Fast2SMS
const sendOTP = async (phoneNumber, otp) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        route: "dlt",
        sender_id: process.env.FAST2SMS_SENDER_ID,
        message:process.env.FAST2SMS_MESSAGE_ID,
        variables_values: otp,
        flash: 0,
        numbers: phoneNumber
      }
    });
    
    return {
      success: response.data.return,
      requestId: response.data.request_id,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    throw new Error('Failed to send OTP');
  }
};

// Send DLT-approved message via Fast2SMS
const sendDLTMessage = async (phoneNumber, messageId, variables = []) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        route: "dlt",
        sender_id: process.env.FAST2SMS_SENDER_ID,
        message: messageId,
        variables_values: variables.join("|"),
        flash: 0,
        numbers: phoneNumber
      }
    });
    
    return {
      success: response.data.return,
      requestId: response.data.request_id,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error sending DLT message:', error.response?.data || error.message);
    throw new Error('Failed to send DLT message');
  }
};

// Verify if the provided OTP matches the stored OTP
const verifyOTP = (storedOTP, providedOTP) => {
  return storedOTP === providedOTP;
};

// Check if OTP is expired
const isOTPExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};

module.exports = {
  generateOTP,
  sendOTP,
  sendDLTMessage,
  verifyOTP,
  isOTPExpired
};
