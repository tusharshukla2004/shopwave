"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.products.filter(
          (product: Product) =>
            product.category.toLowerCase() === category.toLowerCase()
        );
        setProducts(filtered);
      });
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 relative overflow-hidden">

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
            ✦ Browsing Category
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              {category}
            </span>
          </h1>

          <p className="text-base text-gray-500 mt-3">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60" />
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-300" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60" />
          </div>
        </motion.div>

        {/* ── Products Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-orange-100/60 hover:border-orange-200 transition-all duration-300"
            >
              {/* ── Image ── */}
              <div className="relative overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-44 md:h-52 w-full object-cover group-hover:scale-105 transition duration-700"
                />

                {/* Category pill */}
                <div className="absolute top-3 left-3 bg-orange-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                  {product.category}
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

                <h2 className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1">
                  {product.name}
                </h2>

                <p className="text-xs text-gray-400 mt-1.5 leading-5 line-clamp-2">
                  {product.description}
                </p>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-3" />

                <div className="flex items-center justify-between">
                  <p className="text-xl font-extrabold text-gray-900">
                    ₹{product.price}
                  </p>
                  <span className="text-green-600 text-xs font-semibold">
                    🚚 Free Delivery
                  </span>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Empty State ── */}
        {products.length === 0 && (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-5xl mb-4">📦</p>
            <p className="text-xl font-bold text-gray-700">No products found</p>
            <p className="text-gray-400 mt-2 text-sm">
              No products available in "{category}" category right now.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
