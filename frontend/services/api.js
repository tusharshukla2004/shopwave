const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options) {
    const headers = new Headers(options?.headers || {});
    const token = localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

const jsonOptions = (method, data) => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
});

export async function registerUser(data) {
    return request("/auth/register", jsonOptions("POST", data));
}
export async function loginUser(data) {
    return request("/auth/login", jsonOptions("POST", data));
}
export async function getCategories() {
    return request("/categories");
}
export async function createCategory(data) {
    return request("/categories", jsonOptions("POST", data));
}
export async function getProducts() {
    return request("/products");
}
export async function addToCart(data) {
    return request("/cart", jsonOptions("POST", data));
}
export async function addToWishlist(data) {
    return request("/wishlist", jsonOptions("POST", data));
}
export async function createPaymentOrder(orderId) {
    return request("/payment/create-order", jsonOptions("POST", { order_id: orderId }));
}
export async function verifyPayment(data) {
    return request("/payment/verify", jsonOptions("POST", data));
}
export async function getCart(userId) {
    return request(`/cart/${userId}`);
}
export async function updateCartItem(itemId, quantity) {
    return request(`/cart/${itemId}`, jsonOptions("PUT", { quantity }));
}
export async function removeCartItem(itemId) {
    return request(`/cart/${itemId}`, { method: "DELETE" });
}
export async function createOrder(data) {
    return request("/orders", jsonOptions("POST", data));
}
export async function getOrders(userId) {
    return request(`/orders/${userId}`);
}
export async function getOrderDetails(orderId) {
    return request(`/orders/order/${orderId}`);
}
export async function updateOrderStatus(orderId, status) {
    return request(`/orders/${orderId}`, jsonOptions("PUT", { status }));
}
export async function getWishlist(userId) {
    return request(`/wishlist/${userId}`);
}
export async function removeWishlist(id) {
    return request(`/wishlist/${id}`, { method: "DELETE" });
}
export async function createProduct(data) {
    return request("/products", jsonOptions("POST", data));
}
export async function updateProduct(id, data) {
    return request(`/products/${id}`, jsonOptions("PUT", data));
}
export async function deleteProduct(id) {
    return request(`/products/${id}`, { method: "DELETE" });
}
export async function getAdminUsers() {
    return request("/admin/users");
}
export async function getAdminProducts() {
    return request("/admin/products");
}
export async function getAdminOrders() {
    return request("/admin/orders");
}
export async function getAdminDashboard() {
    return request("/admin/dashboard");
}
export async function getSellerProducts(userId) {
    return request(`/seller/products/${userId}`);
}
export async function getSellerOrders(userId) {
    return request(`/seller/orders/${userId}`);
}
export async function getSellerRevenue(userId) {
    return request(`/seller/revenue/${userId}`);
}
export async function getSellerInventory(userId) {
    return request(`/seller/inventory/${userId}`);
}
export async function updateUserRole(id, role) {
    return request(`/admin/users/${id}`, jsonOptions("PUT", { role }));
}
export async function deleteAdminProduct(id) {
    return request(`/admin/products/${id}`, { method: "DELETE" });
}
