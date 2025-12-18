import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { adminLogin, setUser } = useContext(AppContext) || {};
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get("next") || "/admin";

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    
    console.log("🔐 Admin login attempt:", email);
    
    try {
      await adminLogin?.({ email, password });
      
      setUser?.((u) => u || { name: "Admin", email });
      
      console.log("✅ Login successful, navigating to:", next);
      navigate(next, { replace: true });
      
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Login failed. Please check your credentials.";
      console.error("❌ Login error:", errorMessage);
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h1>

        {err && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            ⚠️ {err}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            placeholder="admin@example.com"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is the admin panel. Only authorized personnel can access this area.
          </p>
        </div>
      </form>
    </div>
  );
}
