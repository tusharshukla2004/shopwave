import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HomePage from "./page.jsx";
import AuthPage from "./auth/page.jsx";
import CartPage from "./cart/page.jsx";
import CategoryPage from "./category/[category]/page.jsx";
import AdminPage from "./admin/page.jsx";
import OrdersPage from "./orders/page.jsx";
import ProductsPage from "./products/page.jsx";
import ProfilePage from "./profile/page.jsx";
import SellerPage from "./seller/page.jsx";
import WishlistPage from "./wishlist/page.jsx";

function RequireAuth({ children, roles }) {
  const token = localStorage.getItem("token");
  let role;

  try {
    role = JSON.parse(localStorage.getItem("user") || "{}").role;
  } catch {
    role = undefined;
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/admin" element={<RequireAuth roles={["ADMIN"]}><AdminPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/seller" element={<RequireAuth roles={["SELLER"]}><SellerPage /></RequireAuth>} />
        <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
        <Route path="*" element={<main className="p-10 text-center">Page not found</main>} />
      </Routes>
    </>
  );
}
