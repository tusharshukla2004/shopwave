"use client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiGrid,
  FiPlusCircle,
  FiShoppingBag,
  FiPackage,
  FiArchive,
  FiDollarSign,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

interface SidebarProps {
  role: "SELLER" | "ADMIN";
}

export default function Sidebar({ role }: SidebarProps) {
  const [active, setActive] = useState("dashboard");
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    window.location.href = "/auth";
  };

  const sellerLinks = [
    { id: "dashboard",    href: "#dashboard",    icon: <FiGrid size={17} />,       label: "Dashboard"   },
    { id: "add-product",  href: "#add-product",  icon: <FiPlusCircle size={17} />, label: "Add Product" },
    { id: "products",     href: "#products",     icon: <FiShoppingBag size={17} />,label: "My Products" },
    { id: "orders",       href: "#orders",       icon: <FiPackage size={17} />,    label: "Orders"      },
    { id: "inventory",    href: "#inventory",    icon: <FiArchive size={17} />,    label: "Inventory"   },
    { id: "revenue",      href: "#dashboard",    icon: <FiDollarSign size={17} />, label: "Revenue"     },
  ];

  const adminLinks = [
    { id: "dashboard", href: "#dashboard", icon: <FiGrid size={17} />,        label: "Dashboard" },
    { id: "users",     href: "#users",     icon: <FiPlusCircle size={17} />,  label: "Users"     },
    { id: "products",  href: "#products",  icon: <FiShoppingBag size={17} />, label: "Products"  },
    { id: "orders",    href: "#orders",    icon: <FiPackage size={17} />,     label: "Orders"    },
    { id: "revenue",   href: "#dashboard", icon: <FiDollarSign size={17} />,  label: "Revenue"   },
  ];

  const links = role === "SELLER" ? sellerLinks : adminLinks;

  return (
    <>
      {/* ── Mobile Hamburger ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-5 left-5 z-50 w-10 h-10 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-md flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-all duration-200"
        >
          <FiMenu size={20} />
        </button>
      )}

      {/* ── Sidebar Panel ── */}
      <div
        className={`
          fixed top-0 left-0 z-50
          w-64 h-screen
          bg-gray-900 text-white
          flex flex-col
          overflow-y-auto
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shrink-0" />

        {/* Logo + Close */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/8">
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
            ShopWave
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/8 text-gray-400 hover:text-white transition-all duration-200"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4">
          <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            {role === "SELLER" ? "Seller Panel" : "Admin Panel"}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 pb-4 space-y-1">
          {links.map((link) => {
            const isActive = active === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setActive(link.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${isActive
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/8 border border-transparent"
                  }`}
              >
                {/* Icon box */}
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                  ${isActive
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  {link.icon}
                </span>
                {link.label}

                {/* Active indicator */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/8 mb-4" />

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-transparent hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 group"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-all duration-200">
              <FiLogOut size={17} />
            </span>
            Logout
          </button>
        </div>
      </div>

      {/* ── Mobile Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
