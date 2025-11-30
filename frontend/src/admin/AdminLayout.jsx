 import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import profile_icon from "../assets/profile_icon.png";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, adminEmail, adminLogout } = useContext(AppContext) || {};
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 ${
      isActive ? "bg-emerald-100 text-emerald-800" : "text-gray-700"
    }`;

  const doLogout = async () => {
    try {
      await adminLogout?.();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/admin/products?q=${encodeURIComponent(term)}` : "/admin/products");
    setMenuOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!menuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const initials =
    (user?.name || "Admin")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      {/* Backdrop (mobile/tablet) */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Drawer (mobile/tablet) */}
      <aside
        className={[
          "fixed z-50 inset-y-0 left-0 w-64 bg-white border-r shadow-sm transition-transform lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Mobile admin sidebar"
      >
        <div className="p-4">
          <div className="text-xl font-bold text-emerald-700 mb-4">E-Inject Admin</div>
          <nav className="flex flex-col gap-1">
            <NavLink onClick={() => setSidebarOpen(false)} className={link} to="/admin" end>Dashboard</NavLink>
            <NavLink onClick={() => setSidebarOpen(false)} className={link} to="/admin/products">Products</NavLink>
            <NavLink onClick={() => setSidebarOpen(false)} className={link} to="/admin/orders">Orders</NavLink>
            <NavLink onClick={() => setSidebarOpen(false)} className={link} to="/admin/users">Users</NavLink>
          </nav>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="border-r bg-white p-4 hidden lg:block">
        <div className="text-xl font-bold text-emerald-700 mb-4">E-Inject Admin</div>
        <nav className="flex flex-col gap-1">
          <NavLink className={link} to="/admin" end>Dashboard</NavLink>
          <NavLink className={link} to="/admin/products">Products</NavLink>
          <NavLink className={link} to="/admin/orders">Orders</NavLink>
          <NavLink className={link} to="/admin/users">Users</NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-[5] bg-white border-b">
          <div className="h-[56px] px-4 lg:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border hover:bg-gray-50"
                aria-label="Toggle sidebar"
                aria-expanded={sidebarOpen}
                title="Toggle sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <div className="font-semibold text-gray-900">Admin Panel</div>
            </div>

            {/* Search */}
            <form onSubmit={onSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-2">
              <div className="flex items-center gap-2 w-full border rounded-full px-3 py-1.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products"
                  className="w-full outline-none text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-full text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Avatar */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Admin menu"
              >
                <span className="relative inline-flex w-8 h-8 rounded-full overflow-hidden border">
                  {profile_icon ? (
                    <img src={profile_icon} alt="Admin avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full grid place-items-center bg-emerald-600 text-white text-xs">
                      {initials}
                    </span>
                  )}
                </span>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-gray-900">Admin</span>
                  <span className="text-[11px] text-gray-500">
                    {adminEmail || "admin@example.com"}
                  </span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-500">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg z-10">
                  <div className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">Admin</div>
                    <div className="text-xs text-gray-500 truncate">
                      {adminEmail || "admin@example.com"}
                    </div>
                  </div>
                  <div className="border-t">
                    {/* ⚠️ Settings option removed */}
                    <button
                      onClick={doLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6 bg-gray-50 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
