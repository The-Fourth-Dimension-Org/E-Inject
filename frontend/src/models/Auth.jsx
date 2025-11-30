 import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Auth() {
  const { register, login, setShowUserLogin } = useContext(AppContext) || {};
  const { showToast } = useToast ? useToast() : { showToast: null };

  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [reg, setReg] = useState({ name: "", email: "", password: "" });
  const [cred, setCred] = useState({ email: "", password: "" });

  const close = () => setShowUserLogin?.(false);

  const doRegister = async (e) => {
    e.preventDefault();
    if (!reg.name.trim() || !reg.email.trim() || !reg.password.trim()) {
      setErr("All fields are required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(reg.email)) {
      setErr("Enter a valid email");
      return;
    }
    if (reg.password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setErr(""); setLoading(true);
    try {
      await register({
        name: reg.name.trim(),
        email: reg.email.trim(),
        password: reg.password,
      }); // ✅ only register (no auto-login)
      showToast && showToast("Account created. Please log in.");
      setTab("login");  // switch to login tab
    } catch (e) {
      setErr(e?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async (e) => {
    e.preventDefault();
    if (!cred.email.trim() || !cred.password.trim()) {
      setErr("Email and password are required");
      return;
    }
    setErr(""); setLoading(true);
    try {
      await login({
        email: cred.email.trim(),
        password: cred.password,
      }); // ✅ real backend login
      showToast && showToast("Logged in successfully!");
      close();
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex gap-4">
            <button
              className={`pb-2 ${tab==="login" ? "font-semibold border-b-2 border-emerald-600" : "text-gray-500"}`}
              onClick={() => { setErr(""); setTab("login"); }}
            >
              Login
            </button>
            <button
              className={`pb-2 ${tab==="register" ? "font-semibold border-b-2 border-emerald-600" : "text-gray-500"}`}
              onClick={() => { setErr(""); setTab("register"); }}
            >
              Sign up
            </button>
          </div>
          <button onClick={close} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            ✕
          </button>
        </div>

        {err && <div className="px-5 pt-3 text-sm text-red-600">{err}</div>}

        {tab === "login" ? (
          <form onSubmit={doLogin} className="p-5 space-y-3">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Email"
              value={cred.email}
              onChange={(e) => setCred({ ...cred, email: e.target.value })}
            />
            <input
              type="password"
              autoComplete="current-password"
              className="w-full border rounded px-3 py-2"
              placeholder="Password"
              value={cred.password}
              onChange={(e) => setCred({ ...cred, password: e.target.value })}
            />
            <button
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={doRegister} className="p-5 space-y-3">
            <input
              name="name"
              autoComplete="name"
              className="w-full border rounded px-3 py-2"
              placeholder="Full name"
              value={reg.name}
              onChange={(e) => setReg({ ...reg, name: e.target.value })}
            />
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Email"
              value={reg.email}
              onChange={(e) => setReg({ ...reg, email: e.target.value })}
            />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              className="w-full border rounded px-3 py-2"
              placeholder="Password (min 6 chars)"
              value={reg.password}
              onChange={(e) => setReg({ ...reg, password: e.target.value })}
            />
            <button
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
