"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/api";
import { motion } from "framer-motion";
import { FiPackage, FiTruck, FiCreditCard, FiEye, FiMapPin } from "react-icons/fi";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    getOrders(user.id).then((data) => {
      setOrders(data.orders);
    });
  }, []);

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Pending:   { bg: "bg-yellow-50 border-yellow-200",  text: "text-yellow-600", dot: "bg-yellow-500" },
    Shipped:   { bg: "bg-blue-50 border-blue-200",      text: "text-blue-600",   dot: "bg-blue-500"   },
    Delivered: { bg: "bg-green-50 border-green-200",    text: "text-green-600",  dot: "bg-green-500"  },
    Cancelled: { bg: "bg-red-50 border-red-200",        text: "text-red-600",    dot: "bg-red-500"    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 relative overflow-hidden">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FiPackage className="inline mr-1.5 mb-0.5" size={13} />
            Order History
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Orders
            </span>
          </h1>

          {orders.length > 0 && (
            <p className="text-base text-gray-500 mt-3">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60" />
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60" />
          </div>
        </motion.div>

        {/* ── Empty State ── */}
        {orders.length === 0 ? (
          <motion.div
            className="text-center py-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-6xl mb-5">📦</p>
            <h2 className="text-2xl font-bold text-gray-700">No Orders Yet</h2>
            <p className="text-gray-400 mt-2 text-sm">
              Your purchased products will appear here.
            </p>
          </motion.div>
        ) : (

          <div className="space-y-5">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig["Cancelled"];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden"
                >
                  {/* ── Card Top Bar ── */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <FiPackage size={16} className="text-orange-500" />
                      <h2 className="text-base font-bold text-gray-800">
                        Order <span className="text-orange-500">#{order.id}</span>
                      </h2>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {order.status}
                    </span>
                  </div>

                  {/* ── Card Body ── */}
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Order ID */}
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
                      <p className="text-sm font-bold text-gray-700">#{order.id}</p>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Total Amount</p>
                      <p className="text-xl font-extrabold text-gray-900">₹{order.total_amount}</p>
                    </div>

                    {/* Info Pills */}
                    <div className="flex sm:flex-col gap-3">
                      <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 flex-1">
                        <FiCreditCard size={14} className="text-pink-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-pink-400 font-semibold uppercase">Payment</p>
                          <p className="text-xs font-bold text-gray-700">Paid</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex-1">
                        <FiTruck size={14} className="text-green-500 shrink-0" />
                        <div>
                          <p className="text-[10px] text-green-500 font-semibold uppercase">Shipping</p>
                          <p className="text-xs font-bold text-gray-700">Free</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ── Delivery Status Bar ── */}
                  <div className="mx-5 mb-5 flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                    <FiMapPin size={15} className="text-orange-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-orange-600">Delivery Status</p>
                      <p className="text-xs text-gray-500 mt-0.5">Estimated Delivery: Tomorrow</p>
                    </div>
                  </div>

                  {/* ── Action Buttons ── */}
                  <div className="px-5 pb-5 flex flex-col sm:flex-row gap-3">
                    <button className="group relative overflow-hidden flex-1 bg-gradient-to-b from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:shadow-orange-300/40 transition-all duration-200 flex items-center justify-center gap-2">
                      <FiEye size={14} />
                      View Details
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                    </button>

                    <button className="flex-1 bg-white border border-indigo-200 text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 flex items-center justify-center gap-2">
                      <FiTruck size={14} />
                      Track Order
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
