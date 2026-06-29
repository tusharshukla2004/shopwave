"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiUser, FiShield, FiPackage, FiHeart, FiShoppingCart } from "react-icons/fi";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User>({ name: "", email: "", role: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  const roleConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    ADMIN:    { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500"    },
    SELLER:   { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", dot: "bg-yellow-500" },
    CUSTOMER: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-500" },
  };

  const rc = roleConfig[user.role] || roleConfig["CUSTOMER"];

  const stats = [
    { icon: <FiPackage size={18} />, value: "12", label: "Orders",   color: "text-orange-500", iconBg: "bg-orange-50 border-orange-200 text-orange-500" },
    { icon: <FiHeart size={18} />,   value: "5",  label: "Wishlist", color: "text-pink-500",   iconBg: "bg-pink-50 border-pink-200 text-pink-500"       },
    { icon: <FiShoppingCart size={18} />, value: "3", label: "Cart", color: "text-green-600",  iconBg: "bg-green-50 border-green-200 text-green-600"    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex items-center justify-center p-6 relative overflow-hidden">

      {/* ── Warm orbs ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* ── Card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden">

          {/* Top orange accent */}
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

          <div className="p-7 md:p-9">

            {/* ── Avatar ── */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 blur-sm opacity-60" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-4xl font-extrabold shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
            </motion.div>

            {/* ── Name & Title ── */}
            <motion.div
              className="text-center mb-7"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-2xl font-extrabold text-gray-900">{user.name || "User"}</h1>
              <p className="text-sm text-gray-400 mt-1">ShopWave Member</p>

              {/* Divider */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-400/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-400/60" />
              </div>
            </motion.div>

            {/* ── Info Fields ── */}
            <motion.div
              className="space-y-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Name */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 shrink-0">
                  <FiUser size={15} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Name</p>
                  <h2 className="text-sm font-bold text-gray-800">{user.name}</h2>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 shrink-0">
                  <FiMail size={15} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <h2 className="text-sm font-bold text-gray-800">{user.email}</h2>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-500 shrink-0">
                  <FiShield size={15} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium">Role</p>
                  <span className={`inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${rc.bg} ${rc.text} ${rc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                    {user.role}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Stats ── */}
            <motion.div
              className="grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mx-auto mb-2 ${stat.iconBg}`}>
                    {stat.icon}
                  </div>
                  <h2 className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</h2>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-400 mt-5">
          🔒 Your data is private & secure
        </p>

      </motion.div>
    </div>
  );
}
