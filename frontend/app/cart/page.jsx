import { useEffect, useState } from "react";
import {
    getCart,
    createOrder,
    createPaymentOrder,
    verifyPayment,
    updateCartItem,
    removeCartItem,
} from "@/services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiShoppingCart, FiPackage, FiTruck, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import ProductImage from "@/components/ProductImage";

const loadRazorpay = async () => {
    if (window.Razorpay) return;

    await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => {
            script.remove();
            reject(new Error("Razorpay Checkout could not be loaded"));
        };
        document.body.appendChild(script);
    });

    if (!window.Razorpay) {
        throw new Error("Razorpay Checkout did not initialize");
    }
};

export default function CartPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyItem, setBusyItem] = useState(null);
    const [paying, setPaying] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
    });
    const navigate = useNavigate();
    const hasDemoItems = items.some((item) => Number(item.is_demo) === 1);
    const hasRegularItems = items.some((item) => Number(item.is_demo) !== 1);
    const hasMixedItems = hasDemoItems && hasRegularItems;
    const shippingAddressComplete = Boolean(
        shippingAddress.fullName.trim() &&
        /^\+?[0-9][0-9\s()-]{7,19}$/.test(shippingAddress.phone.trim()) &&
        shippingAddress.addressLine.trim() &&
        shippingAddress.city.trim() &&
        shippingAddress.state.trim() &&
        /^[A-Za-z0-9 -]{3,20}$/.test(shippingAddress.postalCode.trim()),
    );
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) {
            setLoading(false);
            return;
        }
        getCart(user.id)
            .then((data) => setItems(data.items || []))
            .catch((error) => toast.error(error.message || "Failed to load cart"))
            .finally(() => setLoading(false));
    }, []);
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const changeQuantity = async (item, quantity) => {
        if (quantity > item.stock) {
            toast.error(`Only ${item.stock} item(s) are in stock`);
            return;
        }
        setBusyItem(item.id);
        try {
            await updateCartItem(item.id, quantity);
            setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity } : entry));
        }
        catch (error) {
            toast.error(error.message || "Failed to update quantity");
        } finally {
            setBusyItem(null);
        }
    };
    const deleteItem = async (itemId) => {
        setBusyItem(itemId);
        try {
            await removeCartItem(itemId);
            setItems((current) => current.filter((item) => item.id !== itemId));
            toast.success("Item removed from cart");
        } catch (error) {
            toast.error(error.message || "Failed to remove item");
        } finally {
            setBusyItem(null);
        }
    };
    const handlePayment = async () => {
        if (paying) return;
        try {
            if (!items.length) {
                toast.error("Your cart is empty");
                return;
            }

            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (!user.id) {
                toast.error("Please log in before paying");
                return;
            }
            if (hasMixedItems) {
                toast.error("Please place demo test orders separately from regular products");
                return;
            }
            setPaying(true);
            if (!hasDemoItems) await loadRazorpay();

            const orderItems = items.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            }));
            const createdOrder = await createOrder({
                user_id: user.id,
                total_amount: totalAmount,
                items: orderItems,
                shipping_address: shippingAddress,
            });
            if (!createdOrder.success) {
                toast.error(createdOrder.message || "Failed to create order");
                setPaying(false);
                return;
            }

            if (createdOrder.testMode) {
                const removals = await Promise.allSettled(
                    items.map((item) => removeCartItem(item.id)),
                );
                const removalFailed = removals.some((result) => result.status === "rejected");
                if (removalFailed) {
                    toast.error("Test order created, but some cart items could not be cleared");
                } else {
                    setItems([]);
                    toast.success("Test order created. No payment or shipment was made.");
                }
                navigate("/orders");
                return;
            }

            const paymentOrder = await createPaymentOrder(createdOrder.orderId);
            if (!paymentOrder.success) {
                toast.error(paymentOrder.message || "Failed to start payment");
                setPaying(false);
                return;
            }
            if (paymentOrder.testMode) {
                toast("Sandbox payment: no real charge will be made.", { icon: "ℹ️" });
            }
            const options = {
                key: paymentOrder.key_id,
                amount: paymentOrder.order.amount,
                currency: paymentOrder.order.currency,
                name: "ShopWave",
                description: "Payment for Order",
                order_id: paymentOrder.order.id,
                handler: async function (response) {
                    try {
                        const verification = await verifyPayment(response);
                        if (verification.success) {
                            toast.success("Payment successful");
                            navigate("/orders");
                        } else {
                            toast.error(verification.message || "Payment verification failed");
                        }
                    } catch (error) {
                        toast.error(error.message || "Payment verification failed");
                    } finally {
                        setPaying(false);
                    }
                },
                modal: {
                    ondismiss: () => setPaying(false),
                },
                theme: { color: "#f97316" },
            };
            const razor = new window.Razorpay(options);
            razor.on("payment.failed", (response) => {
                setPaying(false);
                toast.error(response.error?.description || "Payment failed");
            });
            razor.open();
        }
        catch (error) {
            console.error("Payment failed:", error);
            setPaying(false);
            toast.error(error.message || "Payment failed");
        }
    };
    return (<div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 relative overflow-x-clip">

      {/* ── Warm orbs ── */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none z-0"/>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[350px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none z-0"/>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 relative z-10">

        {/* ── Heading ── */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
          <motion.span className="inline-block bg-orange-100 border border-orange-300 text-orange-600 text-sm font-semibold px-5 py-2 rounded-full mb-4 tracking-wider uppercase" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            ✦ My Cart
          </motion.span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Shopping{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Cart
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-orange-400/60"/>
            <div className="w-2 h-2 rounded-full bg-orange-500"/>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-orange-400/60"/>
          </div>
        </motion.div>

        {/* ── Empty State ── */}
        {loading ? (<p className="text-center py-28 text-gray-500">Loading cart...</p>) : items.length === 0 ? (<motion.div className="text-center py-28" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="text-6xl mb-5">🛒</p>
          <h2 className="text-2xl font-bold text-gray-700">{localStorage.getItem("user") ? "Your cart is empty" : "Log in to view your cart"}</h2>
          <p className="text-gray-400 mt-2 text-sm">Add products from the catalog to get started.</p>
          </motion.div>) : (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Cart Items ── */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (<motion.div key={item.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 hover:shadow-orange-100/50 transition-all duration-300 p-4 md:p-6 flex flex-col md:flex-row gap-5 items-center">
                  {/* Image */}
                  <div className="shrink-0 overflow-hidden rounded-xl border border-gray-100">
                    <ProductImage src={item.image} alt={item.name} className="w-36 h-36 md:w-44 md:h-44 object-cover group-hover:scale-105 transition duration-500"/>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-200">
                      {item.name}
                    </h2>
                    {Number(item.is_demo) === 1 && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
                        Demo · test order only
                      </p>
                    )}

                    <p className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">
                      ₹{item.price}
                    </p>
                    {Number(item.is_demo) === 1 && <p className="text-xs text-gray-500">Sample price</p>}

                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                      <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                        <FiTruck size={14}/>
                        {item.stock} available
                      </span>
                      <div className="inline-flex items-center gap-2 text-gray-800">
                        <button disabled={busyItem === item.id || item.quantity <= 1} onClick={() => changeQuantity(item, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} className="rounded border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><FiMinus size={12}/></button>
                        <span className="text-sm font-semibold">Qty: {item.quantity}</span>
                        <button disabled={busyItem === item.id || item.quantity >= item.stock} onClick={() => changeQuantity(item, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} className="rounded border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"><FiPlus size={12}/></button>
                      </div>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-center shrink-0">
                    <p className="text-xs text-gray-400 font-medium mb-1">Item Total</p>
                    <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-amber-600">
                      ₹{Number(item.price) * item.quantity}
                    </p>
                    <button disabled={busyItem === item.id} onClick={() => deleteItem(item.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600 disabled:opacity-50">
                      <FiTrash2 size={13}/> Remove
                    </button>
                  </div>
                </motion.div>))}
            </div>

            {/* ── Order Summary ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-7 sticky lg:top-24">

                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Order Summary
                </h2>
                {!hasDemoItems && (
                  <fieldset className="mb-6 space-y-3">
                    <legend className="mb-2 text-sm font-bold text-gray-800">Delivery address</legend>
                    <input
                      required
                      maxLength={150}
                      autoComplete="name"
                      value={shippingAddress.fullName}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, fullName: event.target.value })}
                      placeholder="Full name"
                      aria-label="Delivery full name"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={shippingAddress.phone}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, phone: event.target.value })}
                      placeholder="Phone number (include country code if needed)"
                      aria-label="Delivery phone number"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <textarea
                      required
                      maxLength={500}
                      autoComplete="street-address"
                      value={shippingAddress.addressLine}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, addressLine: event.target.value })}
                      placeholder="House number and street address"
                      aria-label="Delivery street address"
                      rows={2}
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        maxLength={120}
                        autoComplete="address-level2"
                        value={shippingAddress.city}
                        onChange={(event) => setShippingAddress({ ...shippingAddress, city: event.target.value })}
                        placeholder="City"
                        aria-label="Delivery city"
                        className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                      <input
                        required
                        maxLength={120}
                        autoComplete="address-level1"
                        value={shippingAddress.state}
                        onChange={(event) => setShippingAddress({ ...shippingAddress, state: event.target.value })}
                        placeholder="State"
                        aria-label="Delivery state"
                        className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                    <input
                      required
                      maxLength={20}
                      autoComplete="postal-code"
                      value={shippingAddress.postalCode}
                      onChange={(event) => setShippingAddress({ ...shippingAddress, postalCode: event.target.value })}
                      placeholder="Postal / ZIP code"
                      aria-label="Delivery postal code"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </fieldset>
                )}
                {hasDemoItems && (
                  <p className="my-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                    Demo items create a test order only. No payment, shipment, or stock deduction will occur.
                  </p>
                )}
                {hasMixedItems && (
                  <p className="my-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                    Place demo and regular products as separate orders.
                  </p>
                )}
                <div className="h-0.5 w-10 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full mb-5"/>

                <div className="space-y-4 mb-6">

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <FiShoppingCart size={14} className="text-gray-400"/>
                      Total Items
                    </span>
                    <span className="font-semibold text-gray-800">{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</span>
                  </div>

                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-5"/>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-bold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ₹{totalAmount}
                  </span>
                </div>

                {/* Razorpay */}
                <button onClick={handlePayment} disabled={paying || hasMixedItems || (!hasDemoItems && !shippingAddressComplete)} className="w-full bg-white border border-indigo-200 text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50">
                  {paying
                    ? hasDemoItems ? "Creating test order..." : "Waiting for payment..."
                    : hasMixedItems ? "Separate demo and regular items"
                      : hasDemoItems ? "Place test order (no payment)"
                        : "💳 Pay with Razorpay"}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                  {hasDemoItems ? "Test mode · payment gateway not contacted" : "🔒 Secure & Encrypted Checkout"}
                </p>

              </div>
            </motion.div>

          </div>)}
      </div>
    </div>);
}
