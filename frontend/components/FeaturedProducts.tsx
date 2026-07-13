"use client";

import { useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_API_URL);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-gray-50 py-12 md:py-24">

      {/* ── Subtle warm orbs ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/50 rounded-full blur-[110px] pointer-events-none" />

      {/* ── Dot Grid Overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">

        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-5 tracking-wider uppercase"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ✦ Handpicked For You
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Featured{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Products
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-500 mt-4 max-w-xl mx-auto">
            Discover our most popular products with premium quality and amazing prices.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60" />
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-300" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60" />
          </div>
        </motion.div>

        {/* ── Products Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8 }}
              className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/60 transition-all duration-400"
            >
              {/* Hover top glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-50/60 via-transparent to-amber-50/40 rounded-2xl pointer-events-none" />

              {/* ── Image ── */}
              <div className="relative overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-48 w-full object-cover group-hover:scale-105 transition duration-700 ease-in-out"
                />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                  20% OFF
                </div>

                {/* Wishlist button top right */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-orange-50">
                  <span className="text-gray-400 hover:text-red-500 transition-colors text-sm">♡</span>
                </div>
              </div>

              {/* ── Content ── */}
              <div className="p-4 relative z-10">

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xs">★</span>
                  ))}
                  <span className="text-gray-400 text-xs ml-1">(4.9)</span>
                </div>

                <h2 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
                  {product.name}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  Premium Quality Product
                </p>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-3" />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl font-extrabold text-gray-900">
                      ₹{product.price}
                    </p>
                    <p className="text-green-600 text-xs font-semibold mt-0.5">
                      🚚 Free Delivery
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.08 }}
                    className="relative overflow-hidden bg-gradient-to-b from-amber-400 to-orange-500 p-2.5 rounded-lg text-white shadow-md shadow-orange-300/40 hover:shadow-orange-400/60 transition-shadow duration-300"
                  >
                    <FiShoppingCart size={18} />
                    <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                  </motion.button>
                </div>

                {/* Add to Cart full button — Amazon style */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="mt-3 w-full bg-gradient-to-b from-amber-400 to-orange-500 text-white text-sm font-bold py-2 rounded-lg shadow-sm hover:shadow-md hover:shadow-orange-300/40 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all"
                >
                  Add to Cart
                </motion.button>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
