 
 import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import MyOrders from "./pages/orders";
import Auth from "./models/Auth";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import { useEffect, useContext } from "react";
import { AppContext } from "./context/AppContext";
import Account from "./pages/Account";

// Admin imports
import AdminRoute from "./admin/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AdminOrders from "./admin/pages/Orders";
import AdminUsers from "./admin/pages/Users";
 


const App = () => {
  const { showUserLogin } = useContext(AppContext) || {};
  const location = useLocation();

  const isSellerPath = location.pathname.includes("seller");
  const isAdminPath = location.pathname.startsWith("/admin");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = showUserLogin ? "hidden" : "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showUserLogin]);

  return (
    <div>
      {isSellerPath || isAdminPath ? null : <Navbar />}
      {showUserLogin && <Auth />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/account" element={<Account />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
           
        </Route>

        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>

      {isSellerPath || isAdminPath ? null : (
        <Footer
          projectName="E-Inject"
          facebookUrl="https://www.facebook.com/saim.h.h39"
          instagramUrl="https://www.instagram.com/saimhosen39/"
          linkedinUrl="https://www.linkedin.com/in/saim-hosen-hridoy-1511a8283/"
          twitterUrl="https://twitter.com/"
          githubUrl=" https://github.com/The-Fourth-Dimension-Org"
        />
      )}
    </div>
  );
};

export default App;
 
