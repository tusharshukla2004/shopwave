import { useEffect, useState } from "react";
import { getOrderDetails, getOrders } from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiPackage, FiTruck, FiCreditCard, FiEye, FiMapPin } from "react-icons/fi";
export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState({});
    const [expandedOrder, setExpandedOrder] = useState(null);
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) {
            setLoading(false);
            return;
        }
        getOrders(user.id)
            .then((data) => setOrders(data.orders || []))
            .catch((error) => toast.error(error.message || "Failed to load orders"))
            .finally(() => setLoading(false));
    }, []);
    const viewOrder = async (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            return;
        }
        try {
            const result = details[orderId] || await getOrderDetails(orderId);
            setDetails((current) => ({ ...current, [orderId]: result }));
            setExpandedOrder(orderId);
        } catch (error) {
            toast.error(error.message || "Failed to load order details");
        }
    };
    const statusConfig = {
        PENDING: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", dot: "bg-yellow-500" },
        PAID: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600", dot: "bg-blue-500" },
        SHIPPED: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-600", dot: "bg-indigo-500" },
        DELIVERED: { bg: "bg-green-50 border-green-200", text: "text-green-600", dot: "bg-green-500" },
        CANCELLED: { bg: "bg-red-50 border-red-200", text: "text-red-600", dot: "bg-red-500" },
        EXPIRED: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", dot: "bg-gray-400" },
        TEST: { bg: "bg-violet-50 border-violet-200", text: "text-violet-700", dot: "bg-violet-500" },
    };
    return (<div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 relative overflow-hidden">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none z-0"/>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none z-0"/>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <motion.span className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <FiPackage className="inline mr-1.5 mb-0.5" size={13}/>
            Order History
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Orders
            </span>
          </h1>

          {orders.length > 0 && (<p className="text-base text-gray-500 mt-3">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>)}

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60"/>
            <div className="w-2 h-2 rounded-full bg-orange-500"/>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60"/>
          </div>
        </motion.div>

        {/* ── Empty State ── */}
        {loading ? <p className="py-20 text-center text-gray-500">Loading orders...</p> : orders.length === 0 ? (<motion.div className="text-center py-28" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="text-6xl mb-5">📦</p>
            <h2 className="text-2xl font-bold text-gray-700">{localStorage.getItem("user") ? "No Orders Yet" : "Log in to view orders"}</h2>
            <p className="text-gray-400 mt-2 text-sm">
              Your purchased products will appear here.
            </p>
          </motion.div>) : (<div className="space-y-5">
            {orders.map((order, index) => {
                const status = statusConfig[String(order.status).toUpperCase()] || statusConfig.PENDING;
                return (<motion.div key={order.id} initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden">
                  {/* ── Card Top Bar ── */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex items-center gap-2">
                      <FiPackage size={16} className="text-orange-500"/>
                      <h2 className="text-base font-bold text-gray-800">
                        Order <span className="text-orange-500">#{order.id}</span>
                      </h2>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${status.bg} ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}/>
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
                        <FiCreditCard size={14} className="text-pink-500 shrink-0"/>
                        <div>
                          <p className="text-[10px] text-pink-400 font-semibold uppercase">Payment</p>
                          <p className="text-xs font-bold text-gray-700">{order.status === "TEST" ? "Test only · not paid" : order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED" ? "Paid" : order.status === "EXPIRED" ? "Reservation expired" : order.status === "CANCELLED" ? "Cancelled" : "Awaiting payment"}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ── Delivery Status Bar ── */}
                  <div className="mx-5 mb-5 flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                    <FiMapPin size={15} className="text-orange-500 shrink-0"/>
                    <div>
                      <p className="text-xs font-bold text-orange-600">Delivery Status</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.status === "TEST" ? "Simulation only; no shipment will be made" : order.status === "SHIPPED" ? "Your order is on its way" : order.status === "DELIVERED" ? "Order delivered" : "Tracking starts after shipment"}</p>
                    </div>
                  </div>

                  {/* ── Action Buttons ── */}
                  <div className="px-5 pb-5 flex flex-col sm:flex-row gap-3">
                    <button onClick={() => viewOrder(order.id)} className="group relative overflow-hidden flex-1 bg-gradient-to-b from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:shadow-orange-300/40 transition-all duration-200 flex items-center justify-center gap-2">
                      <FiEye size={14}/>
                      View Details
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"/>
                    </button>

                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {details[order.id]?.order?.shipping_address && (
                        <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                          <h3 className="mb-1 font-bold text-gray-800">Delivery address</h3>
                          <p>{details[order.id].order.shipping_address.fullName}</p>
                          <p>{details[order.id].order.shipping_address.phone}</p>
                          <p>
                            {details[order.id].order.shipping_address.addressLine},{" "}
                            {details[order.id].order.shipping_address.city},{" "}
                            {details[order.id].order.shipping_address.state}{" "}
                            {details[order.id].order.shipping_address.postalCode}
                          </p>
                        </div>
                      )}
                      <h3 className="mb-3 text-sm font-bold text-gray-800">Order items</h3>
                      {(details[order.id]?.order?.items || []).map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between gap-4 py-2 text-sm">
                          <span className="text-gray-700">{Number(item.is_demo) === 1 && <span className="mr-1 font-semibold text-violet-600">Demo</span>}{item.name} × {item.quantity}</span>
                          <span className="font-semibold text-gray-800">₹{Number(item.price) * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </motion.div>);
            })}
          </div>)}

      </div>
    </div>);
}
