"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { createProduct, deleteProduct } from "@/services/api";
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiClipboard,
} from "react-icons/fi";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image?: string;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
}

interface InventoryItem {
  name: string;
  stock: number;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Pending:   { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", dot: "bg-yellow-400" },
  Shipped:   { bg: "bg-blue-50 border-blue-200",     text: "text-blue-600",   dot: "bg-blue-400"   },
  Delivered: { bg: "bg-green-50 border-green-200",   text: "text-green-600",  dot: "bg-green-400"  },
  Cancelled: { bg: "bg-red-50 border-red-200",       text: "text-red-600",    dot: "bg-red-400"    },
};

export default function SellerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [revenue, setRevenue] = useState<number>(0);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category_id: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    fetch(`http://localhost:5000/api/seller/products/${user.id}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));

    fetch(`http://localhost:5000/api/seller/orders/${user.id}`)
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));

    fetch(`http://localhost:5000/api/seller/revenue/${user.id}`)
      .then((res) => res.json())
      .then((data) => setRevenue(Number(data.revenue[0]?.totalRevenue || 0)));

    fetch(`http://localhost:5000/api/seller/inventory/${user.id}`)
      .then((res) => res.json())
      .then((data) => setInventory(data.inventory || []));
  }, []);

  const handleAddProduct = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const result = await createProduct({
        ...productData,
        category_id: Number(productData.category_id),
        seller_id: user.id,
      });
      toast.success(result.message);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteProduct(id);
    alert(result.message);
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const inputClass =
    "w-full border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200";

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/40 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none z-0" />

      <Sidebar role="SELLER" />

      <div className="flex-1 p-5 md:p-8 lg:ml-72 lg:p-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ✦ Seller Panel
          </motion.span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Seller{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Dashboard
            </span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60" />
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60" />
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        <div id="dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { icon: <FiDollarSign size={22} />, label: "Revenue", value: `₹${revenue}`, color: "text-green-600", iconBg: "bg-green-50 border-green-200 text-green-600" },
            { icon: <FiPackage size={22} />, label: "Products", value: products.length, color: "text-blue-600", iconBg: "bg-blue-50 border-blue-200 text-blue-600" },
            { icon: <FiTruck size={22} />, label: "Orders", value: orders.length, color: "text-orange-500", iconBg: "bg-orange-50 border-orange-200 text-orange-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 p-5 md:p-6"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-3xl md:text-4xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Add Product ── */}
        <motion.div
          id="add-product"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500">
              <FiPlus size={16} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Product Name" className={inputClass}
              onChange={(e) => setProductData({ ...productData, name: e.target.value })} />
            <input type="number" placeholder="Price" className={inputClass}
              onChange={(e) => setProductData({ ...productData, price: e.target.value })} />
            <input type="number" placeholder="Stock" className={inputClass}
              onChange={(e) => setProductData({ ...productData, stock: e.target.value })} />
            <input type="text" placeholder="Image URL" className={inputClass}
              onChange={(e) => setProductData({ ...productData, image: e.target.value })} />
            <select
              className={inputClass}
              onChange={(e) => setProductData({ ...productData, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              <option value="1">Electronics</option>
              <option value="2">Mobiles</option>
              <option value="3">Laptops</option>
              <option value="4">Headphones</option>
              <option value="5">Cameras</option>
              <option value="6">Gaming</option>
              <option value="7">Smart Watches</option>
              <option value="8">Speakers</option>
              <option value="9">Accessories</option>
            </select>
          </div>

          <textarea
            rows={4}
            placeholder="Description"
            className={`${inputClass} mt-4 resize-none`}
            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
          />

          <button
            onClick={handleAddProduct}
            className="group relative overflow-hidden mt-5 bg-gradient-to-b from-amber-400 to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-300/40 hover:shadow-lg hover:shadow-orange-400/50 transition-all duration-200 flex items-center gap-2"
          >
            <FiPlus size={16} />
            Add Product
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
          </button>
        </motion.div>

        {/* ── My Products ── */}
        <motion.div
          id="products"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500">
              <FiShoppingBag size={16} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">My Products</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6" />

          <div className="space-y-3">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{product.name}</h3>
                  <p className="text-green-600 font-bold text-sm mt-0.5">₹{product.price}</p>
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex items-center gap-1.5 bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                >
                  <FiTrash2 size={13} />
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Orders ── */}
        <motion.div
          id="orders"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-500">
              <FiTruck size={16} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6" />

          <div className="space-y-3">
            {orders.map((order, index) => {
              const sc = statusConfig[order.status] || statusConfig["Cancelled"];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200"
                >
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Order #{order.id}</h3>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-md border text-xs font-bold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {order.status}
                    </span>
                  </div>
                  <p className="text-green-600 font-extrabold text-base">₹{order.total_amount}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Inventory ── */}
        <motion.div
          id="inventory"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
              <FiClipboard size={16} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6" />

          <div className="space-y-3">
            {inventory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200"
              >
                <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                <span className="inline-flex items-center bg-green-50 border border-green-200 text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg">
                  Stock: {item.stock}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
