"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  return count;
}

function StatCounter({ target, suffix, label, delay }: { target: number; suffix: string; label: string; delay: number }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(target, 2000, started);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="flex flex-col items-start"
    >
      <span className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 tabular-nums">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm text-gray-500 mt-1 font-medium">{label}</span>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 text-gray-900 flex items-center py-16 lg:py-0">

      {/* ── Subtle warm orbs ── */}
      <div className="absolute top-[-60px] left-[-60px] w-[450px] h-[450px] bg-orange-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-40px] right-[-40px] w-[500px] h-[500px] bg-amber-100/60 rounded-full blur-[130px] pointer-events-none" />

      {/* ── Subtle grid pattern ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full pt-10">

        {/* ────── LEFT SIDE ────── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-orange-100 border border-orange-300 px-5 py-2 rounded-full text-sm text-orange-700 font-semibold mb-7 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            Limited Time Offer — Up To 50% OFF
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] tracking-tight text-gray-900"
          >
            Shop The
            <br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
                Future
              </span>
              {/* Animated underline */}
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.1, duration: 0.7, ease: "easeOut" }}
              />
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-7 text-lg md:text-xl text-gray-500 leading-relaxed max-w-lg"
          >
            Discover premium electronics, smartphones, laptops and accessories
            with unbeatable prices and lightning-fast delivery.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
          >
            <Link
              href="/products"
              className="group relative overflow-hidden bg-gradient-to-b from-amber-400 to-orange-500 px-6 py-3 rounded-xl text-base font-bold text-white shadow-lg shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-[1.03] transition-all duration-300 text-center border border-orange-600/20"
            >
              <span className="relative z-10">Shop Now →</span>
              {/* Shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]" />
            </Link>

            <Link
              href="/auth"
              className="bg-white border border-gray-300 px-6 py-3 rounded-xl text-base font-bold text-gray-800 hover:bg-gray-50 hover:border-orange-400 hover:text-orange-600 transition-all duration-300 text-center shadow-sm"
            >
              Join Us
            </Link>
          </motion.div>

          {/* Stats — no boxes, animated counters */}
          <div className="flex items-center gap-8 mt-14 flex-wrap">
            <StatCounter target={10000} suffix="+" label="Happy Customers" delay={900} />
            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <StatCounter target={500} suffix="+" label="Products" delay={1100} />
            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <div className="flex flex-col items-start">
              <span className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                24/7
              </span>
              <span className="text-sm text-gray-500 mt-1 font-medium">Support</span>
            </div>
          </div>
        </motion.div>

        {/* ────── RIGHT SIDE ────── */}
        <motion.div
          className="relative flex justify-center mt-10 lg:mt-0"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Soft glow behind image */}
          <div className="absolute inset-0 m-auto w-[300px] h-[300px] md:w-[420px] md:h-[420px] rounded-full bg-orange-200/50 blur-3xl pointer-events-none" />

          {/* Product Image */}
          <motion.div
            whileHover={{ scale: 1.04, rotate: 0.8 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            {/* Decorative border ring */}
            <div className="absolute -inset-3 rounded-[38px] bg-gradient-to-br from-orange-300/40 via-transparent to-amber-300/40 blur-sm pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
              alt="Hero"
              className="relative w-full max-w-[300px] md:max-w-[420px] lg:max-w-[480px] rounded-[30px] shadow-2xl shadow-gray-300/80 object-cover border border-gray-100"
            />
          </motion.div>

          {/* Floating Card — Sale */}
          <motion.div
            className="absolute top-6 -left-4 md:top-12 md:-left-12 z-20 bg-white border border-orange-200 p-3 md:p-5 rounded-2xl shadow-xl shadow-orange-100/60 min-w-[90px] md:min-w-[110px]"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                Flash Deal
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-amber-600">
              50%
            </h3>
            <p className="text-gray-600 text-sm font-medium">OFF Sale</p>
          </motion.div>

          {/* Floating Card — Delivery */}
          <motion.div
            className="absolute bottom-6 -right-4 md:bottom-12 md:-right-12 z-20 bg-white border border-green-200 p-3 md:p-5 rounded-2xl shadow-xl shadow-green-100/60 min-w-[90px] md:min-w-[120px]"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚚</span>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
            </div>
            <p className="text-green-600 font-bold text-sm">Free Delivery</p>
            <p className="text-gray-400 text-xs mt-0.5">On orders above ₹499</p>
          </motion.div>

          {/* Floating Card — Rating */}
          <motion.div
            className="absolute top-[45%] -right-2 md:-right-8 z-20 bg-white border border-yellow-200 p-3 md:p-4 rounded-2xl shadow-xl shadow-yellow-100/60"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
            <p className="text-gray-800 font-bold text-sm mt-0.5">4.9 / 5</p>
            <p className="text-gray-400 text-[10px]">2.4k Reviews</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
