"use client";

import { useEffect, useState } from "react";
import { getCart, createOrder } from "@/services/api";
import { useRouter } from "next/navigation";
import { createPaymentOrder } from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiShoppingCart, FiPackage, FiTag, FiTruck } from "react-icons/fi";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      getCart(user.id).then((data) => {
        setItems(data.items || []);
      });
    }
  }, []);

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));
      const result = await createOrder({
        user_id: user.id,
        total_amount: totalAmount,
        items: orderItems,
      });
      if (result.success) {
        toast.success(result.message);
        router.push("/orders");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create order");
    }
  };

  const handlePayment = async () => {
    try {
      const order = await createPaymentOrder(totalAmount);
      const options = {
        key: "rzp_test_T2zWJuK4tG8cX1",
        amount: order.amount,
        currency: order.currency,
        name: "ShopWave",
        description: "Payment for Order",
        order_id: order.id,
        handler: function (response: any) {
          toast.success("Payment Successful");
          console.log(response);
        },
        theme: { color: "#f97316" },
      };
      const razor = new (window as any).Razorpay(options);
      razor.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 relative overflow-hidden">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-10"
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
            ✦ My Cart
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Shopping{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Cart
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60" />
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60" />
          </div>
        </motion.div>

        {/* ── Empty State ── */}
        {items.length === 0 ? (
          <motion.div
            className="text-center py-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-6xl mb-5">🛒</p>
            <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
            <p className="text-gray-400 mt-2 text-sm">Add some products to get started!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 hover:shadow-orange-100/50 transition-all duration-300 p-4 md:p-6 flex flex-col md:flex-row gap-5 items-center"
                >
                  {/* Image */}
                  <div className="shrink-0 overflow-hidden rounded-xl border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-36 h-36 md:w-44 md:h-44 object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-200">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
                      ₹{item.price}
                    </p>

                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                        <FiTruck size={14} />
                        Free Delivery
                      </span>
                      <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-md">
                        <FiPackage size={12} />
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-center shrink-0">
                    <p className="text-xs text-gray-400 font-medium mb-1">Item Total</p>
                    <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-amber-600">
                      ₹{Number(item.price) * item.quantity}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            >
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 sticky lg:top-24">

                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Order Summary
                </h2>
                <div className="h-0.5 w-10 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full mb-5" />

                <div className="space-y-4 mb-6">

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <FiShoppingCart size={14} className="text-gray-400" />
                      Total Items
                    </span>
                    <span className="font-semibold text-gray-800">{items.length}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <FiTag size={14} className="text-gray-400" />
                      Discount
                    </span>
                    <span className="font-bold text-green-600">− ₹500</span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <FiTruck size={14} className="text-gray-400" />
                      Delivery
                    </span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>

                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-5" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{totalAmount}
                  </span>
                </div>

                {/* Place Order */}
                <button
                  onClick={handleCheckout}
                  className="group relative overflow-hidden w-full bg-gradient-to-b from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-300/40 hover:shadow-lg hover:shadow-orange-400/50 transition-all duration-200"
                >
                  <span className="relative z-10">✓ Place Order</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                </button>

                {/* Razorpay */}
                <button
                  onClick={handlePayment}
                  className="w-full mt-3 bg-white border border-indigo-200 text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200"
                >
                  💳 Pay with Razorpay
                </button>

                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                  🔒 Secure & Encrypted Checkout
                </p>

              </div>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
