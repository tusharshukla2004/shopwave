import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import {
    createProduct,
    deleteProduct,
    getCategories,
    getSellerInventory,
    getSellerOrders,
    getSellerProducts,
    getSellerRevenue,
    updateProduct,
} from "@/services/api";
import { motion } from "framer-motion";
import { FiDollarSign, FiPackage, FiTruck, FiPlus, FiTrash2, FiShoppingBag, FiClipboard, FiEdit2, } from "react-icons/fi";
const statusConfig = {
    PENDING: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", dot: "bg-yellow-400" },
    PAID: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600", dot: "bg-blue-400" },
    SHIPPED: { bg: "bg-blue-50 border-blue-200", text: "text-blue-600", dot: "bg-blue-400" },
    DELIVERED: { bg: "bg-green-50 border-green-200", text: "text-green-600", dot: "bg-green-400" },
    CANCELLED: { bg: "bg-red-50 border-red-200", text: "text-red-600", dot: "bg-red-400" },
};
export default function SellerPage() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [editingProductId, setEditingProductId] = useState(null);
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
        if (!user.id) {
            toast.error("Please log in to open the seller dashboard");
            return;
        }
        Promise.all([
            getSellerProducts(user.id),
            getSellerOrders(user.id),
            getSellerRevenue(user.id),
            getSellerInventory(user.id),
            getCategories(),
        ])
            .then(([productData, orderData, revenueData, inventoryData, categoryData]) => {
                setProducts(productData.products || []);
                setOrders(orderData.orders || []);
                setRevenue(Number(revenueData.revenue[0]?.totalRevenue || 0));
                setInventory(inventoryData.inventory || []);
                setCategories(categoryData.categories || []);
            })
            .catch((error) => toast.error(error.message || "Failed to load seller dashboard"));
    }, []);
    const handleAddProduct = async () => {
        if (!productData.name.trim()) {
            toast.error("Product name is required");
            return;
        }
        if (!productData.price || Number(productData.price) <= 0) {
            toast.error("Please enter a valid price");
            return;
        }
        if (!Number.isInteger(Number(productData.stock)) || Number(productData.stock) < 0) {
            toast.error("Please enter a valid stock quantity");
            return;
        }
        if (!productData.category_id) {
            toast.error("Please select a category");
            return;
        }
        if (!productData.image.trim()) {
            toast.error("Product image is required");
            return;
        }
        if (!productData.description.trim()) {
            toast.error("Product description is required");
            return;
        }
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const payload = {
                ...productData,
                category_id: Number(productData.category_id),
            };
            const result = editingProductId
                ? await updateProduct(editingProductId, payload)
                : await createProduct(payload);
            toast.success(result.message);
            setProductData({ name: "", description: "", price: "", stock: "", image: "", category_id: "" });
            setEditingProductId(null);
            try {
                const [productResult, inventoryResult] = await Promise.all([
                    getSellerProducts(user.id),
                    getSellerInventory(user.id),
                ]);
                setProducts(productResult.products || []);
                setInventory(inventoryResult.inventory || []);
            } catch (error) {
                toast.error(error.message || "Product saved, but dashboard data could not be refreshed");
            }
        }
        catch (error) {
            toast.error(error.message || `Failed to ${editingProductId ? "update" : "add"} product`);
        }
    };
    const handleEdit = (product) => {
        setProductData({
            name: product.name,
            description: product.description,
            price: String(product.price),
            stock: String(product.stock),
            image: product.image,
            category_id: String(product.category_id),
        });
        setEditingProductId(product.id);
        setActiveSection("add-product");
    };
    const cancelEdit = () => {
        setEditingProductId(null);
        setProductData({ name: "", description: "", price: "", stock: "", image: "", category_id: "" });
    };
    const handleDelete = async (id) => {
        try {
            const result = await deleteProduct(id);
            toast.success(result.message);
            setProducts((prev) => prev.filter((product) => product.id !== id));
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            try {
                const inventoryResult = await getSellerInventory(user.id);
                setInventory(inventoryResult.inventory || []);
            } catch (error) {
                toast.error(error.message || "Product deleted, but inventory could not be refreshed");
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete product");
        }
    };
    const inputClass = "w-full border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200";
    const sectionTitles = {
        dashboard: "Dashboard",
        "add-product": editingProductId ? "Edit Product" : "Add Product",
        products: "My Products",
        orders: "Orders",
        inventory: "Inventory",
        revenue: "Revenue",
    };
    return (<div className="flex min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/40 rounded-full blur-[130px] pointer-events-none z-0"/>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none z-0"/>

      <Sidebar role="SELLER" activeSection={activeSection} onSectionChange={setActiveSection}/>

      <div className="flex-1 p-5 md:p-8 lg:ml-72 lg:p-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.span className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            ✦ Seller Panel
          </motion.span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Seller{" "}
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
        <div id="dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { icon: <FiDollarSign size={22}/>, label: "Revenue", value: `₹${revenue}`, color: "text-green-600", iconBg: "bg-green-50 border-green-200 text-green-600" },
            { icon: <FiPackage size={22}/>, label: "Products", value: products.length, color: "text-blue-600", iconBg: "bg-blue-50 border-blue-200 text-blue-600" },
            { icon: <FiTruck size={22}/>, label: "Orders", value: orders.length, color: "text-orange-500", iconBg: "bg-orange-50 border-orange-200 text-orange-500" },
        ].map((stat, i) => (<motion.div key={i} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }} whileHover={{ y: -4 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 p-5 md:p-6">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-3xl md:text-4xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
            </motion.div>))}
        </div>
        )}

        {/* ── Add Product ── */}
        {activeSection === "add-product" && (
        <motion.div id="add-product" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500">
              <FiPlus size={16}/>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{editingProductId ? "Edit Product" : "Add Product"}</h2>
            <p className="text-red-400 text-sm font-medium mb-5">
  * All fields marked are required before submitting the product.
    </p>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full mb-6"/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
          <label className="text-gray-700 font-medium">
  Product Name <span className="text-red-500">*</span>
    </label>
            <input type="text" placeholder="Enter product name" className={inputClass} value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })}/>
              </div>

              <div>
            <label className="text-gray-700 font-medium">
  Price <span className="text-red-500">*</span>
    </label>
            <input type="number" min="0.01" step="0.01" placeholder="Enter price" className={inputClass} value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })}/>
              </div>

            <div>
            <label className="text-gray-700 font-medium">
  Stock Quantity <span className="text-red-500">*</span>
    </label>
            <input type="number" min="0" step="1" placeholder="Enter stock quantity" className={inputClass} value={productData.stock} onChange={(e) => setProductData({ ...productData, stock: e.target.value })}/>
              </div>

              <div>
            <label className="text-gray-700 font-medium">
  Image URL <span className="text-red-500">*</span>
    </label>
            <input type="url" placeholder="Enter image URL" className={inputClass} value={productData.image} onChange={(e) => setProductData({ ...productData, image: e.target.value })}/>
              </div>

              <div>
            <label className="text-gray-700 font-medium">
  Category <span className="text-red-500">*</span>
    </label>
            <select value={productData.category_id} className={inputClass} onChange={(e) => setProductData({ ...productData, category_id: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            </div>
          </div>
          
    <label className="text-gray-700 font-medium mb-2 block">
  Description <span className="text-red-500">*</span>
    </label>
          <textarea rows={4} placeholder="Enter product description" className={`${inputClass} mt-4 resize-none`} value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })}/>

          <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleAddProduct} className="group relative overflow-hidden mt-5 bg-gradient-to-b from-amber-400 to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-orange-300/40 hover:shadow-lg hover:shadow-orange-400/50 transition-all duration-200 flex items-center gap-2">
            {editingProductId ? <FiEdit2 size={16}/> : <FiPlus size={16}/>}
            {editingProductId ? "Save Changes" : "Add Product"}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"/>
          </button>
          {editingProductId && <button type="button" onClick={cancelEdit} className="mt-5 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>}
          </div>
        </motion.div>
        )}

        {/* ── My Products ── */}
        {activeSection === "products" && (
        <motion.div id="products" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500">
              <FiShoppingBag size={16}/>
            </div>
            <h2 className="text-lg font-bold text-gray-900">My Products</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6"/>

          <div className="space-y-3">
            {products.map((product, index) => (<motion.div key={product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06, duration: 0.4 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{product.name}</h3>
                  <p className="text-green-600 font-bold text-sm mt-0.5">₹{product.price}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="flex items-center gap-1.5 bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200">
                    <FiEdit2 size={13}/>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1.5 bg-white border border-red-200 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200">
                    <FiTrash2 size={13}/>
                    Delete
                  </button>
                </div>
              </motion.div>))}
          </div>
        </motion.div>
        )}

        {/* ── Orders ── */}
        {activeSection === "orders" && (
        <motion.div id="orders" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 mb-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-500">
              <FiTruck size={16}/>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6"/>

          <div className="space-y-3">
            {orders.map((order, index) => {
            const sc = statusConfig[String(order.status).toUpperCase()] || statusConfig.PENDING;
            return (<motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06, duration: 0.4 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Order #{order.id}</h3>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-md border text-xs font-bold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-green-600 font-extrabold text-base">₹{order.total_amount}</p>
                  {order.shipping_address && (
                    <address className="text-xs not-italic leading-5 text-gray-600">
                      <span className="font-semibold">{order.shipping_address.fullName}</span>
                      {" · "}{order.shipping_address.phone}
                      <br />
                      {order.shipping_address.addressLine}, {order.shipping_address.city},{" "}
                      {order.shipping_address.state} {order.shipping_address.postalCode}
                    </address>
                  )}
                </motion.div>);
        })}
          </div>
        </motion.div>
        )}

        {/* ── Inventory ── */}
        {activeSection === "inventory" && (
        <motion.div id="inventory" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
              <FiClipboard size={16}/>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
          </div>
          <div className="h-0.5 w-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6"/>

          <div className="space-y-3">
            {inventory.map((item, index) => (<motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06, duration: 0.4 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200">
                <h3 className="text-sm font-bold text-gray-800">{item.name}</h3>
                <span className="inline-flex items-center bg-green-50 border border-green-200 text-green-600 text-xs font-bold px-3 py-1.5 rounded-lg">
                  Stock: {item.stock}
                </span>
              </motion.div>))}
          </div>
        </motion.div>
        )}

        {activeSection === "revenue" && (
          <motion.div id="revenue" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-green-200 bg-green-50 text-green-600">
              <FiDollarSign size={22}/>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-1 text-4xl font-extrabold text-green-600">₹{revenue}</p>
          </motion.div>
        )}

      </div>
    </div>);
}
