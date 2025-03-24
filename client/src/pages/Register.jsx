import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, UserPlus, User, Calendar, Phone, CheckCircle } from "lucide-react";
import toast from 'react-hot-toast';

function Register() {
  const [step, setStep] = useState(1); // Step 1: Registration form, Step 2: OTP verification
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phoneNumber: "", 
    dateOfBirth: "", 
    password: "",
    confirmPassword: ""
  });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    toast.loading('Creating account...');

    try {
      const response = await API.post("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        password: form.password
      });
      
      toast.success("Registration initiated! Please verify your phone number.");
      setUserId(response.data.userId);
      setStep(2); // Move to OTP verification step
      toast.remove();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading('Verifying OTP...');

    try {
      const response = await API.post("/auth/verify-otp", {
        userId,
        otp
      });
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success("Phone number verified successfully!");
      navigate("/dashboard");
      toast.remove();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    toast.loading('Resending OTP...');

    try {
      await API.post("/auth/resend-otp", { userId });
      toast.success("OTP resent successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
      toast.remove();
    }
  };

  // Registration Form (Step 1)
  const renderRegistrationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                onChange={handleChange}
                value={form.firstName}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
                placeholder="First name"
                required
              />
            </div>
          </div>
          
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                onChange={handleChange}
                value={form.lastName}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
                placeholder="Last name"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              value={form.email}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} className="text-gray-500" />
            </div>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              onChange={handleChange}
              value={form.phoneNumber}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Date of Birth
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-500" />
            </div>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              onChange={handleChange}
              value={form.dateOfBirth}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-500" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              value={form.password}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Create a password"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-500" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              onChange={handleChange}
              value={form.confirmPassword}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-1 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <UserPlus size={18} />
            Create Account
          </>
        )}
      </button>

      <div className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
        >
          Sign in
        </button>
      </div>
    </form>
  );

  // OTP Verification Form (Step 2)
  const renderOTPVerificationForm = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Verify Your Phone</h2>
        <p className="text-gray-400 mt-2">
          We've sent a verification code to your phone number
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Enter OTP
          </label>
          <input
            type="text"
            id="otp"
            name="otp"
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 text-gray-100 text-center text-xl tracking-widest rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-1 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle size={18} />
            Verify OTP
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </form>
  );

  return (
    <div className="min-h-auto w-full max-w-md">
      <div className="relative w-full max-w-md mx-4">
        <div className="relative p-8 rounded-2xl shadow-2xl border border-gray-700/50 bg-gray-800">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserPlus size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              {step === 1 ? "Create Account" : "Verify Account"}
            </h1>
            <p className="text-gray-400 mt-2">
              {step === 1 
                ? "Join us and start your journey" 
                : "Complete verification to continue"}
            </p>
          </div>

          {step === 1 ? renderRegistrationForm() : renderOTPVerificationForm()}
        </div>
      </div>
    </div>
  );
}

export default Register;
