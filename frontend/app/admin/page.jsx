import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { getAdminDashboard, getAdminUsers, getAdminProducts, getAdminOrders, getCategories, createCategory, updateUserRole, updateOrderStatus, deleteAdminProduct, } from "@/services/api";
import { motion } from "framer-motion";
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrash2, FiShield, FiTag, } from "react-icons/fi";
const statusConfig = {
    PENDING: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", dot: "bg-yellow-400" },
    PAID: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600", dot: "bg-blue-400" },
    SHIPPED: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-600", dot: "bg-indigo-400" },
    DELIVERED: { bg: "bg-green-50 border-green-200", text: "text-green-600", dot: "bg-green-400" },
    CANCELLED: { bg: "bg-red-50 border-red-200", text: "text-red-600", dot: "bg-red-400" },
    EXPIRED: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", dot: "bg-gray-400" },
};
export default function AdminPage() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [dashboard, setDashboard] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
    });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    useEffect(() => {
        Promise.all([getAdminDashboard(), getAdminUsers(), getAdminProducts(), getAdminOrders(), getCategories()])
            .then(([dashboardData, userData, productData, orderData, categoryData]) => {
                setDashboard(dashboardData);
                setUsers(userData.users || []);
                setProducts(productData.products || []);
                setOrders(orderData.orders || []);
                setCategories(categoryData.categories || []);
            })
            .catch((error) => toast.error(error.message || "Failed to load admin dashboard"));
    }, []);
    const handleRoleChange = async (id, role) => {
        try {
            const result = await updateUserRole(id, role);
            toast.success(result.message);
            setUsers((prev) => prev.map((user) => user.id === id ? { ...user, role } : user));
        } catch (error) {
            toast.error(error.message || "Failed to update user role");
        }
    };
    const handleDeleteProduct = async (id) => {
        try {
            const result = await deleteAdminProduct(id);
            toast.success(result.message);
            setProducts((prev) => prev.filter((product) => product.id !== id));
        } catch (error) {
            toast.error(error.message || "Failed to delete product");
        }
    };
    const handleCreateCategory = async () => {
        const name = categoryName.trim();
        if (!name) {
            toast.error("Category name is required");
            return;
        }
        try {
            const result = await createCategory({ name });
            setCategoryName("");
            toast.success(result.message);
            try {
                const categoryData = await getCategories();
                setCategories(categoryData.categories || []);
            } catch (error) {
                toast.error(error.message || "Category created, but the list could not be refreshed");
            }
        } catch (error) {
            toast.error(error.message || "Failed to create category");
        }
    };
    const handleOrderStatusChange = async (id, status) => {
        try {
            const result = await updateOrderStatus(id, status);
            toast.success(result.message);
            setOrders((prev) => prev.map((order) => order.id === id ? { ...order, status } : order));
        } catch (error) {
            toast.error(error.message || "Failed to update order status");
        }
    };
    const stats = [
        { icon: <FiUsers size={20}/>, label: "Total Users", value: dashboard.totalUsers, color: "text-blue-600", iconBg: "bg-blue-50 border-blue-200 text-blue-600" },
        { icon: <FiShoppingBag size={20}/>, label: "Products", value: dashboard.totalProducts, color: "text-green-600", iconBg: "bg-green-50 border-green-200 text-green-600" },
        { icon: <FiPackage size={20}/>, label: "Orders", value: dashboard.totalOrders, color: "text-orange-500", iconBg: "bg-orange-50 border-orange-200 text-orange-500" },
        { icon: <FiDollarSign size={20}/>, label: "Revenue", value: `₹${dashboard.totalRevenue}`, color: "text-red-500", iconBg: "bg-red-50 border-red-200 text-red-500" },
    ];
    const sectionTitles = {
        dashboard: "Dashboard",
        users: "Users",
        categories: "Categories",
        products: "Products",
        orders: "Orders",
        revenue: "Revenue",
    };
    const sectionHead = (icon, label, iconBg, lineColor) => (<>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{label}</h2>
      </div>
      <div className={`h-0.5 w-10 rounded-full mb-6 ${lineColor}`}/>
    </>);
    return (<div className="flex min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/40 rounded-full blur-[130px] pointer-events-none z-0"/>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none z-0"/>

      <Sidebar role="ADMIN" activeSection={activeSection} onSectionChange={setActiveSection}/>

      <div className="flex-1 p-5 md:p-8 lg:ml-64 lg:p-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.span className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <FiShield className="inline mr-1.5 mb-0.5" size={13}/>
            Admin Panel
          </motion.span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Admin{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              {sectionTitles[activeSection]}
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60"/>
            <div className="w-2 h-2 rounded-full bg-orange-500"/>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60"/>
          </div>
        </motion.div>

        {/* ── Stats Cards ── */}
        {activeSection === "dashboard" && (
        <div id="dashboard" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (<motion.div key={i} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }} whileHover={{ y: -4 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 p-5 md:p-6">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-3xl md:text-4xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
            </motion.div>))}
        </div>
        )}

        {/* ── Users Management ── */}
        {activeSection === "users" && (
        <motion.div id="users" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7">
          {sectionHead(<FiUsers size={16}/>, "Users Management", "bg-blue-50 border-blue-200 text-blue-500", "bg-gradient-to-r from-blue-400 to-blue-600")}

          <div className="space-y-3">
            {users.map((user, index) => (<motion.div key={user.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{user.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                </div>
                <select value={user.role} className="w-full sm:w-44 bg-white border border-gray-200 text-gray-700 text-sm p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200" onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="SELLER">SELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </motion.div>))}
          </div>
        </motion.div>
        )}

        {/* ── Category Management ── */}
        {activeSection === "categories" && (
        <motion.div id="categories" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7">
          {sectionHead(<FiTag size={16}/>, "Category Management", "bg-orange-50 border-orange-200 text-orange-500", "bg-gradient-to-r from-orange-400 to-amber-500")}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              type="text"
              value={categoryName}
              maxLength={150}
              placeholder="New category name"
              aria-label="New category name"
              onChange={(event) => setCategoryName(event.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700"
            />
            <button onClick={handleCreateCategory} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600">
              Add Category
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.id} className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">
                {category.name}
              </span>
            ))}
          </div>
        </motion.div>
        )}

        {/* ── Product Management ── */}
        {activeSection === "products" && (
        <motion.div id="products" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7">
          {sectionHead(<FiShoppingBag size={16}/>, "Product Management", "bg-green-50 border-green-200 text-green-600", "bg-gradient-to-r from-green-400 to-green-600")}

          <div className="space-y-3">
            {products.map((product, index) => (<motion.div key={product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{product.name}</h3>
                  <p className="text-green-600 font-bold text-sm mt-0.5">₹{product.price}</p>
                </div>
                <button onClick={() => handleDeleteProduct(product.id)} className="flex items-center gap-1.5 bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200">
                  <FiTrash2 size={13}/>
                  Delete
                </button>
              </motion.div>))}
          </div>
        </motion.div>
        )}

        {/* ── Orders ── */}
        {activeSection === "orders" && (
        <motion.div id="orders" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7">
          {sectionHead(<FiPackage size={16}/>, "Orders", "bg-yellow-50 border-yellow-200 text-yellow-500", "bg-gradient-to-r from-yellow-400 to-amber-500")}

          <div className="space-y-3">
            {orders.map((order, index) => {
            const sc = statusConfig[String(order.status).toUpperCase()] || statusConfig.PENDING;
            return (<motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Order #{order.id}</h3>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-md border text-xs font-bold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-green-600 font-extrabold text-base">₹{order.total_amount}</p>
                  <select
                    value={order.status}
                    aria-label={`Status for order ${order.id}`}
                    onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                  >
                    {[order.status, ...(order.status === "PENDING"
                      ? ["CANCELLED"]
                      : order.status === "PAID"
                        ? ["SHIPPED"]
                        : order.status === "SHIPPED"
                          ? ["DELIVERED"]
                          : [])].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </motion.div>);
        })}
          </div>
        </motion.div>
        )}

        {activeSection === "revenue" && (
          <motion.div id="revenue" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500">
              <FiDollarSign size={20}/>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-1 text-4xl font-extrabold text-red-500">₹{dashboard.totalRevenue}</p>
          </motion.div>
        )}

      </div>
    </div>);
}
