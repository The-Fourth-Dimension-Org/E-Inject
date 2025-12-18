import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 AppContext initializing...");
    
    const checkAuth = async () => {
      try {
        // Check user auth
        const { data: userData } = await api.get("/user/is-auth");
        if (userData?.success) {
          setUser(userData.user);
          console.log("✅ User authenticated:", userData.user?.email);
        }
      } catch (userError) {
        console.log("👤 User not authenticated");
      }
      
      try {
        // Check seller/admin auth
        const { data: sellerData } = await api.get("/seller/is-auth");
        if (sellerData?.success) {
          setIsSeller(true);
          console.log("✅ Admin authenticated");
        }
      } catch (sellerError) {
        console.log("👨‍💼 Admin not authenticated");
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // User registration
  const register = async (payload) => {
    const { data } = await api.post("/user/register", payload);
    return data;
  };

  // User login
  const login = async (payload) => {
    const { data } = await api.post("/user/login", payload);
    if (data?.success) {
      const authRes = await api.get("/user/is-auth");
      if (authRes.data?.success) {
        setUser(authRes.data.user);
      }
    }
    return data;
  };

  // User logout
  const logout = async () => {
    await api.get("/user/logout");
    setUser(null);
  };

  // Admin login - FIXED
  const adminLogin = async ({ email, password }) => {
    try {
      console.log("🔑 Attempting admin login...");
      
      const { data } = await api.post("/seller/login", { email, password });
      
      if (data?.success) {
        // Verify auth
        const { data: authData } = await api.get("/seller/is-auth");
        if (authData?.success) {
          setIsSeller(true);
          setAdminEmail(email);
          console.log("✅ Admin login successful");
          return data;
        }
      }
      
      throw new Error(data?.message || "Login failed");
      
    } catch (error) {
      console.error("❌ Admin login error:", error);
      setIsSeller(false);
      setAdminEmail("");
      throw error;
    }
  };

  // Admin logout
  const adminLogout = async () => {
    try {
      await api.get("/seller/logout");
    } finally {
      setIsSeller(false);
      setAdminEmail("");
      console.log("👋 Admin logged out");
    }
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    adminEmail,
    setAdminEmail,
    showUserLogin,
    setShowUserLogin,
    loading,
    register,
    login,
    logout,
    adminLogin,
    adminLogout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
