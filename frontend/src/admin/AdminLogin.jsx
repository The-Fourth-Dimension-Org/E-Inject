 import React, { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

export default function AdminLogin(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const { adminLogin, setUser } = useContext(AppContext) || {};
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const next = sp.get("next") || "/admin";


  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await adminLogin?.({ email, password });   // sets isSeller + adminEmail
      
      setUser?.((u)=> u || { name:"Admin", email }); // only for header display
      navigate(next, { replace:true });
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border rounded-xl p-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Admin Login</h1>

        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

        <label className="text-sm text-gray-600">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 mb-3 w-full border rounded px-3 py-2"/>

        <label className="text-sm text-gray-600">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2"/>

        <button disabled={loading} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
