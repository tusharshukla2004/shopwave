"use client";

import { motion, Variants } from "framer-motion";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6},
  }),
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900 text-white">

      {/* ── Top orange accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

      {/* ── Subtle warm orbs ── */}
      <div className="absolute top-0 left-1/3 w-[400px] h-[300px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[250px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Dot Grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #d97706 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 py-16 relative z-10">

        <div className="grid md:grid-cols-4 gap-12">

          {/* ── Logo & Socials ── */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 mb-2">
              ShopWave
            </h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full mb-5" />

            <p className="text-gray-400 leading-7 text-sm">
              Discover premium electronics, gadgets, and accessories with
              unbeatable prices and lightning-fast delivery.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 mt-8">
              {[FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiGithub].map(
                (Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-orange-400 hover:border-orange-400/50 hover:bg-orange-500/10 transition-all duration-300 text-base"
                  >
                    <Icon />
                  </motion.a>
                )
              )}
            </div>
          </motion.div>

          {/* ── Quick Links ── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-2 text-white tracking-wide uppercase">
              Quick Links
            </h3>
            <div className="h-0.5 w-8 bg-orange-500 rounded-full mb-5" />

            <div className="space-y-3">
              {["Home", "Products", "Categories", "Contact Us"].map((link) => (
                <p
                  key={link}
                  className="group flex items-center gap-2 text-gray-400 hover:text-orange-400 cursor-pointer transition-colors duration-300 text-sm"
                >
                  <span className="h-px w-0 group-hover:w-4 bg-orange-400 transition-all duration-300 rounded" />
                  {link}
                </p>
              ))}
            </div>
          </motion.div>

          {/* ── Support ── */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-2 text-white tracking-wide uppercase">
              Support
            </h3>
            <div className="h-0.5 w-8 bg-orange-500 rounded-full mb-5" />

            <div className="space-y-3">
              {["Help Center", "Shipping Info", "Privacy Policy", "Terms & Conditions"].map((link) => (
                <p
                  key={link}
                  className="group flex items-center gap-2 text-gray-400 hover:text-orange-400 cursor-pointer transition-colors duration-300 text-sm"
                >
                  <span className="h-px w-0 group-hover:w-4 bg-orange-400 transition-all duration-300 rounded" />
                  {link}
                </p>
              ))}
            </div>
          </motion.div>

          {/* ── Contact ── */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-2 text-white tracking-wide uppercase">
              Contact
            </h3>
            <div className="h-0.5 w-8 bg-orange-500 rounded-full mb-5" />

            <div className="space-y-4">
              {[
                { Icon: FiMail, text: "support@shopwave.com" },
                { Icon: FiPhone, text: "+91 9876543210" },
                { Icon: FiMapPin, text: "Prayagraj, Uttar Pradesh" },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="group flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors duration-300 cursor-pointer text-sm"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-orange-400/50 group-hover:bg-orange-500/10 transition-all duration-300 text-base shrink-0">
                    <Icon />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* ── Bottom Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-sm">
            © 2026 ShopWave. All Rights Reserved.
          </p>

          <p className="text-gray-500 text-sm">
            Built with <span className="text-red-400">❤️</span> using Next.js + Node.js + MySQL
          </p>
        </motion.div>

      </div>
    </footer>
  );
}
