"use client";

import { useEffect, useState } from "react";
import { addToCart, addToWishlist } from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiSearch, FiShoppingCart, FiHeart } from "react-icons/fi";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  category_id: number;
}

const CATEGORIES = ["All", "Mobiles", "Laptops", "Headphones", "Gaming"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch((error) => console.log(error));
  }, []);

  const handleAddToCart = async (productId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        toast.error("Please login first");
        return;
      }
      const result = await addToCart({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      });
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const handleWishlist = async (productId: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const result = await addToWishlist({
      user_id: user.id,
      product_id: productId,
    });
    toast.success(result.message);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "All" || product.category === selectedCategory)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">

      {/* ── Subtle warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ✦ Best Deals Await
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Explore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Products
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
            Discover premium products with amazing deals.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60" />
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-300" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60" />
          </div>
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="relative w-full lg:w-1/2">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search Products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-white text-gray-800 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder-gray-400 transition-all duration-200"
            />
          </div>
        </motion.div>

        {/* ── Category Filter ── */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-gradient-to-b from-amber-400 to-orange-500 text-white border-orange-500 shadow-md shadow-orange-300/40"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ── Products Grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-orange-100/60 hover:border-orange-200 transition-all duration-300"
            >
              {/* ── Image ── */}
              <div className="relative overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-44 md:h-48 object-cover group-hover:scale-105 transition duration-700"
                />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                  20% OFF
                </div>

                {/* Wishlist quick button */}
                <button
                  onClick={() => handleWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50"
                >
                  <FiHeart size={14} className="text-gray-400 hover:text-red-500 transition-colors" />
                </button>
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

                <h2 className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1">
                  {product.name}
                </h2>

                <p className="text-xs text-gray-400 mt-1 leading-5 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xl font-extrabold text-gray-900">
                    ₹{product.price}
                  </p>
                  <span className="inline-flex items-center bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                    Stock: {product.stock}
                  </span>
                </div>

                <p className="text-green-600 text-xs font-semibold mt-2">
                  🚚 Free Delivery
                </p>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-3" />

                {/* Buttons */}
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="group/btn relative overflow-hidden w-full bg-gradient-to-b from-amber-400 to-orange-500 text-white py-2.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md hover:shadow-orange-300/40 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FiShoppingCart size={15} />
                  Add To Cart
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                </button>

                <button
                  onClick={() => handleWishlist(product.id)}
                  className="w-full mt-2 bg-white border border-red-200 text-red-500 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FiHeart size={15} />
                  Add To Wishlist
                </button>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
