"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiUser, FiLogIn, FiUserPlus } from "react-icons/fi";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await loginUser(loginData);
    if (result.success) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      const role = result.user.role;
      if (role === "ADMIN") window.location.href = "/admin";
      else if (role === "SELLER") window.location.href = "/seller";
      else window.location.href = "/products";
    } else {
      if (result.message === "User not found" || result.message === "Email not found") {
        setIsLogin(false);
        setRegisterData({ ...registerData, email: loginData.email });
        setMessage("No account found. Please register below.");
      } else {
        result.success ? toast.success(result.message) : toast.error(result.message);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await registerUser(registerData);
    if (result.success) {
      setLoginData({ email: registerData.email, password: "" });
      setMessage("Registration successful. Please login.");
      setIsLogin(true);
    } else {
      result.success ? toast.success(result.message) : toast.error(result.message);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Warm orbs ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden">

          {/* Top orange accent */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

          <div className="p-7 md:p-9">

            {/* Logo */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                ShopWave
              </h1>
              <p className="text-xs text-gray-400 mt-1">Premium Electronics Store</p>
            </div>

            {/* Tab Switch */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
              <button
                onClick={() => { setIsLogin(true); setMessage(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isLogin
                    ? "bg-white text-orange-600 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiLogIn size={14} />
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setMessage(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  !isLogin
                    ? "bg-white text-orange-600 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiUserPlus size={14} />
                Register
              </button>
            </div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-4 py-3 rounded-xl mb-5"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Login Form ── */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="email"
                      placeholder="Email"
                      className={inputClass}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="password"
                      placeholder="Password"
                      className={inputClass}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>

                  <button className="group relative overflow-hidden w-full bg-gradient-to-b from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-300/40 hover:shadow-lg hover:shadow-orange-400/50 transition-all duration-200 flex items-center justify-center gap-2 mt-1">
                    <FiLogIn size={15} />
                    Login
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                  </button>
                </motion.form>
              ) : (

                /* ── Register Form ── */
                <motion.form
                  key="register"
                  onSubmit={handleRegister}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-4"
                >
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={inputClass}
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="email"
                      placeholder="Email"
                      className={inputClass}
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </div>

                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      type="password"
                      placeholder="Password"
                      className={inputClass}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </div>

                  <button className="group relative overflow-hidden w-full bg-gradient-to-b from-green-400 to-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-green-300/40 hover:shadow-lg hover:shadow-green-400/50 transition-all duration-200 flex items-center justify-center gap-2 mt-1">
                    <FiUserPlus size={15} />
                    Create Account
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Toggle Link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setMessage(""); }}
                className="text-orange-500 font-bold hover:text-orange-600 transition-colors duration-200"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>

          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-5">
          🔒 Your data is safe & encrypted
        </p>

      </motion.div>
    </div>
  );
}
