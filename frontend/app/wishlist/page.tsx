"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getWishlist, removeWishlist } from "@/services/api";
import { motion } from "framer-motion";
import { FiShoppingCart, FiTrash2, FiTruck } from "react-icons/fi";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  image: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.id) {
      getWishlist(user.id).then((data) => {
        setItems(data.wishlist || []);
      });
    }
  }, []);

  const handleDelete = async (id: number) => {
    await removeWishlist(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Removed from wishlist");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 relative overflow-hidden">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-pink-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block bg-red-50 border border-red-200 text-red-500 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ❤️ Saved Items
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-rose-500">
              Wishlist
            </span>
          </h1>

          {items.length > 0 && (
            <p className="text-base text-gray-500 mt-3">
              {items.length} item{items.length !== 1 ? "s" : ""} saved
            </p>
          )}

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-300" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-400/60" />
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
            <p className="text-6xl mb-5">❤️</p>
            <h2 className="text-2xl font-bold text-gray-700">No items in wishlist</h2>
            <p className="mt-2 text-gray-400 text-sm">
              Save products here for later.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-red-100/60 hover:border-red-200 transition-all duration-300"
              >
                {/* ── Image ── */}
                <div className="relative overflow-hidden bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-44 md:h-52 object-cover group-hover:scale-105 transition duration-700"
                  />

                  {/* Wishlist heart badge */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md text-sm">
                    ❤️
                  </div>
                </div>

                {/* ── Content ── */}
                <div className="p-4">

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">★</span>
                    ))}
                    <span className="text-gray-400 text-xs ml-1">(4.9)</span>
                  </div>

                  <h2 className="text-sm font-bold text-gray-800 group-hover:text-red-500 transition-colors duration-200 line-clamp-1">
                    {item.name}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1.5 leading-5 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-extrabold text-gray-900">
                      ₹{item.price}
                    </p>
                    <span className="inline-flex items-center bg-green-50 border border-green-200 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-md">
                      Stock: {item.stock}
                    </span>
                  </div>

                  <p className="text-green-600 text-xs font-semibold mt-2 flex items-center gap-1">
                    <FiTruck size={12} />
                    Free Delivery
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-gray-100 my-3" />

                  {/* Add to Cart */}
                  <button className="group/btn relative overflow-hidden w-full bg-gradient-to-b from-amber-400 to-orange-500 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md hover:shadow-orange-300/40 transition-all duration-200 flex items-center justify-center gap-2">
                    <FiShoppingCart size={14} />
                    Add To Cart
                    <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-full mt-2 bg-white border border-red-200 text-red-500 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FiTrash2 size={14} />
                    Remove
                  </button>

                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
