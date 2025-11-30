 import React, { useEffect, useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { createPortal } from "react-dom";
import { CartContext } from "../context/CartContext.jsx";

import logo from "../assets/logo.svg";
import search_icon from "../assets/search_icon.svg";
import cart_icon from "../assets/cart_icon.svg";
import profile_icon from "../assets/profile_icon.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  const { user, setShowUserLogin, logout } = useContext(AppContext) || {};
  const { cart } = useContext(CartContext) || {};
  const cartCount = Array.isArray(cart) ? cart.reduce((n, it) => n + (it.qty || 0), 0) : 0;

  // Focus search when opened
  useEffect(() => {
    if (showSearch) {
      desktopInputRef.current?.focus();
      mobileInputRef.current?.focus();
    }
  }, [showSearch]);

  // Lock body scroll for mobile drawer
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownOpen) return;
      const triggers = document.querySelectorAll(".profile-trigger");
      const menu = document.querySelector(".profile-dropdown");
      const inTrigger = Array.from(triggers).some((t) => t.contains(e.target));
      const inMenu = menu && menu.contains(e.target);
      if (!inTrigger && !inMenu) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [dropdownOpen]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
    setShowSearch(false);
  };

  const doLogout = async () => {
    try {
      await logout?.(); // backend cookie clear + state reset
    } finally {
      setDropdownOpen(false);
      navigate("/");
    }
  };

  return (
    <nav className="sticky top-0 z-[1000] bg-white border-b border-gray-300 relative transition-all shadow-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4">
        <Link to="/" onClick={() => { setMobileOpen(false); setDropdownOpen(false); }}>
          <img src={logo} alt="E-INJECT" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-8">
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          <Link to="/account">My Account</Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className={`hidden lg:flex items-center text-sm gap-2 rounded-full relative transition-all duration-200 ${
              showSearch ? "border border-gray-300 px-3 w-[18rem]" : "px-1 w-8"
            }`}
            role="search"
          >
            <button
              type="button"
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Toggle search"
              className="flex items-center justify-center"
              title="Search"
            >
              <img src={search_icon} alt="Search" className="w-5 h-5" />
            </button>

            {showSearch && (
              <input
                ref={desktopInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 transition-all duration-200"
                type="text"
                placeholder="Search products"
                autoFocus
              />
            )}
          </form>

          {/* Cart (Desktop) */}
          <Link to="/cart" className="relative cursor-pointer" title="Cart" aria-label="Cart">
            <img src={cart_icon} alt="Cart" className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs text-white bg-green-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile/Login (Desktop) */}
          {user ? (
            <button
              className="relative cursor-pointer profile-trigger"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Profile"
              title="Profile"
            >
              <img src={profile_icon} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            </button>
          ) : (
            <button
              onClick={() => setShowUserLogin?.(true)}
              className="cursor-pointer px-8 py-2 bg-green-800 hover:bg-green-900 transition text-white rounded-full"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile: Cart + Profile + Hamburger */}
        <div className="sm:hidden flex items-center gap-4">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative"
            aria-label="Cart"
            title="Cart"
            onClick={() => { setMobileOpen(false); setDropdownOpen(false); }}
          >
            <img src={cart_icon} alt="Cart" className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-[10px] leading-none text-white bg-green-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile (Mobile) */}
          {user && (
            <button
              onClick={() => { setDropdownOpen((p) => !p); setMobileOpen(false); }}
              aria-label="Profile"
              title="Profile"
              className="flex items-center justify-center profile-trigger"
            >
              <img src={profile_icon} alt="Profile" className="w-6 h-6 rounded-full" />
            </button>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="21" height="1.5" rx=".75" fill="#426287" />
              <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
              <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-gray-200 ${
          mobileOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col items-start gap-3 text-sm">
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMobileOpen(false)}>All Products</Link>
          <Link to="/account" onClick={() => setMobileOpen(false)}>My Account</Link>

          {/* Mobile search */}
          <form
            onSubmit={handleSearch}
            className={`flex items-center gap-2 rounded-full w-full relative transition-all duration-200 ${
              showSearch ? "border border-gray-300 px-3 py-2" : "px-1 py-1"
            }`}
            role="search"
          >
            <button
              type="button"
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Toggle search"
              className="flex items-center justify-center"
              title="Search"
            >
              <img src={search_icon} alt="Search" className="w-5 h-5" />
            </button>

            {showSearch && (
              <input
                ref={mobileInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 transition-all duration-200"
                type="text"
                placeholder="Search products"
                autoFocus
              />
            )}
          </form>

          {/* Login only (when logged out) */}
          {!user && (
            <button
              onClick={() => setShowUserLogin?.(true)}
              className="px-8 py-2 bg-green-800 hover:bg-green-900 text-white rounded-full"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Profile dropdown → shows user name + email */}
      {user && dropdownOpen &&
        createPortal(
          <div
            className="fixed top-[72px] right-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-[99999] profile-dropdown"
          >
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-medium text-gray-900">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || ""}</div>
            </div>
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => { setDropdownOpen(false); navigate("/account"); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setDropdownOpen(false); navigate("/orders"); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-y border-gray-100"
                >
                  My Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={doLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>,
          document.body
        )
      }
    </nav>
  );
};

export default Navbar;
