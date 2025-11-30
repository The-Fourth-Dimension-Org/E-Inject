 
 import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [adminEmail, setAdminEmail] = useState(""); // 👈 NEW
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/user/is-auth");
        if (data?.success) setUser(data.user);
      } catch {}
      try {
        const { data } = await api.get("/seller/is-auth");
        if (data?.success) {
          setIsSeller(true);
 
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Register: only account create
  const register = async (payload) => {
    await api.post("/user/register", payload);
  };

  // Login: cookie set + profile load
  const login = async (payload) => {
    await api.post("/user/login", payload);
    const { data } = await api.get("/user/is-auth");
    if (data?.success) setUser(data.user);
  };

  const logout = async () => {
    await api.get("/user/logout");
    setUser(null);
  };

  // Admin auth
  const adminLogin = async ({ email, password }) => {
    await api.post("/seller/login", { email, password });
    const { data } = await api.get("/seller/is-auth");
    if (data?.success) {
      setIsSeller(true);
      setAdminEmail(email); //  remember admin email
    }
  };

  const adminLogout = async () => {
    await api.get("/seller/logout");
    setIsSeller(false);
    setAdminEmail(""); //  clear
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    adminEmail,          // expose
    setAdminEmail,       // (optional)
    showUserLogin,
    setShowUserLogin,
    loading,

    register,
    login,
    logout,
    adminLogin,          // use these in AdminLogin
    adminLogout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
 
 