import React, { useState, useEffect } from "react";
import API from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, UserPlus, User, Calendar, Phone, CheckCircle, X } from "lucide-react";
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

  // Particle animation state
  const [particles, setParticles] = useState([]);
  
  // Generate particles on component mount
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          speed: Math.random() * 0.5 + 0.1,
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
      setParticles(newParticles);
    };
    
    generateParticles();
    
    // Animate particles
    const animationInterval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + particle.speed * particle.direction) % 100,
          y: (particle.y + particle.speed * 0.5 * particle.direction) % 100,
          opacity: Math.max(0.1, Math.min(0.6, particle.opacity + (Math.random() * 0.1 - 0.05)))
        }))
      );
    }, 50);
    
    return () => clearInterval(animationInterval);
  }, []);

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
    const loadingToast = toast.loading('Creating account...');

    try {
      const response = await API.post("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        password: form.password
      });

      toast.dismiss(loadingToast);
      toast.success("Registration initiated! Please verify your phone number.");
      setUserId(response.data.registrationId);
      setStep(2);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Verifying OTP...');

    try {
      const response = await API.post("/auth/verify-otp", {
        registrationId: userId,
        otp
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.dismiss(loadingToast);
      toast.success("Phone number verified successfully!");
      navigate("/courses");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading('Resending OTP...');

    try {
      await API.post("/auth/resend-otp", { registrationId: userId });
      toast.dismiss(loadingToast);
      toast.success("OTP resent successfully!");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Registration Form (Step 1)
  const renderRegistrationForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <User size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              id="firstName"
              name="firstName"
              onChange={handleChange}
              value={form.firstName}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                       placeholder-gray-500 transition-all duration-200"
              placeholder="First name"
              required
              style={{ textIndent: "30px" }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <User size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              id="lastName"
              name="lastName"
              onChange={handleChange}
              value={form.lastName}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                       placeholder-gray-500 transition-all duration-200"
              placeholder="Last name"
              required
              style={{ textIndent: "30px" }}
            />
          </div>
        </div>
      </div>

      {/* Email and Phone */}
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <Mail size={18} className="text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              value={form.email}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                       placeholder-gray-500 transition-all duration-200"
              placeholder="Email address"
              required
              style={{ textIndent: "30px" }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <Phone size={18} className="text-gray-500" />
            </div>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              onChange={handleChange}
              value={form.phoneNumber}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                       placeholder-gray-500 transition-all duration-200"
              placeholder="Phone number"
              required
              style={{ textIndent: "30px" }}
            />
          </div>
        </div>
      </div>

      {/* Date of Birth and Password */}
      <div className="space-y-4">
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-1.5">Date of Birth</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <Calendar size={18} className="text-gray-500" />
            </div>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              onChange={handleChange}
              value={form.dateOfBirth}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                       placeholder-gray-500 transition-all duration-200"
              required
              style={{ textIndent: "30px" }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none">
              <Lock size={18} className="text-gray-500" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              value={form.password}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                       placeholder-gray-500 transition-all duration-200"
              placeholder="Create password"
              required
              style={{ textIndent: "30px" }}
            />
          </div>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none">
            <Lock size={18} className="text-gray-500" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            onChange={handleChange}
            value={form.confirmPassword}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500
                     placeholder-gray-500 transition-all duration-200"
            placeholder="Confirm password"
            required
            style={{ textIndent: "30px" }}
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 text-white text-sm font-semibold
                   rounded-[40px] transition-all duration-200
                   focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #eb9f18, #b16901)"
          }}
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
      </div>

      {/* <div className="text-center mt-6">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div> */}
    </form>
  );

  // OTP Verification Form (Step 2)
  const renderOTPVerificationForm = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div>
        <input
          type="text"
          id="otp"
          name="otp"
          onChange={(e) => setOtp(e.target.value)}
          value={otp}
          className="w-full px-4 py-2.5 bg-gray-800/90 border border-gray-700 text-gray-100 text-center text-2xl tracking-widest rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-amber-500/70 focus:border-amber-500 transition-all duration-200"
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          required
        />
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 text-white text-sm font-semibold
                   rounded-[40px] transition-all duration-200
                   focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #eb9f18, #b16901)"
          }}
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
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          Didn't receive the code?{" "}
          <div
            onClick={handleResendOTP}
            disabled={isLoading}
            className="text-amber-400 cursor-pointer hover:text-amber-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </div>
        </p>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto overflow-y-auto max-h-[90vh]">
        <div className="w-full max-w-md mx-auto overflow-hidden bg-dark rounded-2xl shadow-[0_0_25px_5px_rgba(76,29,149,0.15)] relative">
          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 z-50 text-gray-400 hover:text-gray-300 bg-transparent border-none"
            style={{ cursor: "pointer" }}
          >
            <X size={20} />
          </button>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, ${particle.opacity})`,
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </div>
          
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute inset-0 transform rotate-12 rounded-3xl" />
            
            <div className="relative p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800 backdrop-filter backdrop-blur-sm bg-gray-900/60">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <UserPlus size={32} className="text-gray-100" />
                </div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  {step === 1 ? "Create Account" : "Verify Your Phone"}
                </h1>
                <p className="text-gray-400 mt-2">
                  {step === 1
                    ? "Join us and start your learning journey"
                    : "We've sent a verification code to your phone number"}
                </p>
              </div>

              {step === 1 ? renderRegistrationForm() : renderOTPVerificationForm()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;