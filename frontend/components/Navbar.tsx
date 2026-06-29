"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUser,
  FiShoppingCart,
  FiHeart,
  FiPackage,
  FiLogOut,
  FiGrid,
  FiShield,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

export default function Navbar() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setIsLoggedIn(!!token);
    setRole(user.role || "");

    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    window.location.href = "/auth";
  };

  return (
    <>
      {/* ── Top promo bar ── */}

      <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg border-b border-white/10">

        {/* ── Main Bar ── */}
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 shrink-0"
          >
            ShopWave
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
            >
              <FiHome size={15} />
              Home
            </Link>

            {!isLoggedIn ? (
              <Link
                href="/auth"
                className="ml-2 bg-gradient-to-b from-amber-400 to-orange-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.03] transition-all duration-200"
              >
                Login / Register
              </Link>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                >
                  <FiUser size={15} />
                  Profile
                </Link>

                {role === "CUSTOMER" && (
                  <>
                    <Link
                      href="/products"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                    >
                      <FiGrid size={15} />
                      Products
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCategories(!showCategories)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                      >
                        Categories
                        <FiChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showCategories && (
                        <div className="absolute top-11 left-0 bg-gray-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 w-52 py-2 z-50 overflow-hidden">
                          {/* Orange top accent */}
                          <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 to-amber-400 mb-2" />

                          <Link
                            href="/products"
                            onClick={() => setShowCategories(false)}
                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-colors duration-150"
                          >
                            All Products
                          </Link>

                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/category/${category.name}`}
                              onClick={() => setShowCategories(false)}
                              className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-colors duration-150"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href="/cart"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                    >
                      <FiShoppingCart size={15} />
                      Cart
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                    >
                      <FiHeart size={15} />
                      Wishlist
                    </Link>

                    <Link
                      href="/orders"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                    >
                      <FiPackage size={15} />
                      Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 ml-1 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                    >
                      <FiLogOut size={15} />
                      Logout
                    </button>
                  </>
                )}

                {role === "SELLER" && (
                  <Link
                    href="/seller"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                  >
                    <FiGrid size={15} />
                    Seller Dashboard
                  </Link>
                )}

                {role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                  >
                    <FiShield size={15} />
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          {!(pathname.startsWith("/seller") || pathname.startsWith("/admin")) && (
<div className="lg:hidden">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/8 border border-white/10 text-white hover:border-orange-400/50 hover:text-orange-400 transition-all duration-200"
            >
              {mobileMenu ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
)}
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenu && (
          <div className="lg:hidden bg-gray-900 border-t border-white/10 px-5 py-4 space-y-1">

            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
              onClick={() => setMobileMenu(false)}
            >
              <FiHome size={15} />
              Home
            </Link>

            {isLoggedIn && (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                onClick={() => setMobileMenu(false)}
              >
                <FiUser size={15} />
                Profile
              </Link>
            )}

            {role === "CUSTOMER" && (
              <>
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                  onClick={() => setMobileMenu(false)}
                >
                  <FiGrid size={15} />
                  Products
                </Link>

                <button
                  onClick={() => setShowMobileCategories(!showMobileCategories)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                >
                  <FiChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${showMobileCategories ? "rotate-180" : ""}`}
                  />
                  Categories
                </button>

                {showMobileCategories && (
                  <div className="ml-4 border-l border-orange-500/30 pl-3 space-y-1">
                    <Link
                      href="/products"
                      onClick={() => setMobileMenu(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                    >
                      All Products
                    </Link>

                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.name}`}
                        onClick={() => setMobileMenu(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                  onClick={() => setMobileMenu(false)}
                >
                  <FiShoppingCart size={15} />
                  Cart
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                  onClick={() => setMobileMenu(false)}
                >
                  <FiHeart size={15} />
                  Wishlist
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                  onClick={() => setMobileMenu(false)}
                >
                  <FiPackage size={15} />
                  Orders
                </Link>
              </>
            )}

            {role === "SELLER" && (
              <Link
                href="/seller"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                onClick={() => setMobileMenu(false)}
              >
                <FiGrid size={15} />
                Seller Dashboard
              </Link>
            )}

            {role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/8 hover:text-orange-400 transition-all duration-200"
                onClick={() => setMobileMenu(false)}
              >
                <FiShield size={15} />
                Admin Dashboard
              </Link>
            )}

            {/* Bottom auth buttons */}
            <div className="pt-2 border-t border-white/10 mt-2">
              {!isLoggedIn ? (
                <Link
                  href="/auth"
                  className="block w-full text-center bg-gradient-to-b from-amber-400 to-orange-500 text-white font-bold py-2.5 rounded-lg text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200"
                  onClick={() => setMobileMenu(false)}
                >
                  Login / Register
                </Link>
              ) : (
                role === "CUSTOMER" && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold py-2.5 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    <FiLogOut size={15} />
                    Logout
                  </button>
                )
              )}
            </div>

          </div>
        )}
      </nav>
    </>
  );
}
