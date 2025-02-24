import React, { useState } from "react";
import API from "../../../api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, User } from "lucide-react";
import toast from "react-hot-toast";

function Login({ onSuccess, onRegisterClick }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading("Logging in...");
    try {
      const { data } = await API.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.user.type);
      toast.success("Welcome back!");
      
      if (data.user.type === "admin") {
        navigate("/admin");
      } else {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/");
        }
      }
      toast.remove();
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-auto w-full max-w-md overflow-hidden bg-dark rounded-2xl shadow-[0_0_25px_5px_rgba(255,215,0,0.7)]">
      <div className="relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 transform rotate-12 rounded-3xl blur-3xl" />
        
        <div className="relative p-8 rounded-2xl shadow-2xl border border-gray-700/50 bg-gray-800">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-2">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                { form.email === "" && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-500" />
                  </div> )}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    value={form.email}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                             placeholder-gray-500 transition-all duration-200"
                    placeholder="___Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                { form.password === "" &&(
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500" />
                  </div>
                )}
                  <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={form.password}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-100 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                             placeholder-gray-500 transition-all duration-200"
                    placeholder="___Enter your password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-red-900 text-white text-sm font-semibold
                       rounded-xl hover:from-yellow-100 hover:to-yellow-700 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-1 
                       focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 bg-red-900 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <a
              href="http://localhost:5000/api/auth/google"
              className="w-full py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl
                       hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </a>

            <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
              <Link
                to="/forgot-password"
                className="hover:text-purple-400 transition-colors duration-200"
              >
                Forgot password?
              </Link>
              <Link
                onClick={onRegisterClick}
                className="hover:text-purple-400 transition-colors duration-200"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;