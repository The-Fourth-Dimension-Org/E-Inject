 import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { AppContext } from "../context/AppContext.jsx";
import api from "../lib/api";

export default function Cart() {
  const navigate = useNavigate();
  const { cart: cartItems = [], removeFromCart, updateQty, clearCart } =
    useContext(CartContext) || {};
  const { user } = useContext(AppContext) || {};
  const { showToast } = useToast();

  const total = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
        0
      )
    : 0;

  // Optional: sync cart to backend when user is logged-in
  const syncCart = async (nextCart) => {
    if (!user) return; // only sync for logged-in users
    try {
      await api.post("/cart/update", { cartItems: nextCart });
    } catch {
      // silent fail is fine for cart sync
    }
  };

  const removeItem = async (id) => {
    if (!removeFromCart) return;
    const next = cartItems.filter((i) => i.id !== id);
    removeFromCart(id);
    await syncCart(next);
  };

  const changeQty = async (id, delta) => {
    if (!updateQty) return;
    const it = cartItems.find((i) => i.id === id);
    if (!it) return;
    const nextQty = Math.max(1, (Number(it.qty) || 1) + delta);
    updateQty(id, nextQty);
    const next = cartItems.map((i) => (i.id === id ? { ...i, qty: nextQty } : i));
    await syncCart(next);
  };

  const doClear = async () => {
    clearCart?.();
    await syncCart([]);
    showToast("Cart cleared successfully!");
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">🛒 Your Cart is Empty</h1>
        <Link
          to="/products"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto pb-28 overflow-x-hidden box-border">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">🛒 Your Cart</h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 bg-white shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[80px_1fr_auto] gap-3 sm:gap-4 items-start">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover block"
                  />
                ) : null}
              </div>

              {/* Info */}
              <div className="min-w-0 max-w-full">
                <h2 className="font-semibold text-base sm:text-lg break-words">
                  {item.name}
                </h2>
                <p className="text-emerald-600 font-medium mt-1">
                  ৳{(Number(item.price) || 0).toLocaleString("en-US")}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-1 sm:mt-0 flex items-center gap-3 justify-start sm:justify-end flex-wrap sm:flex-nowrap col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="font-semibold min-w-6 text-center">{item.qty}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Bar */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-40
          sm:static sm:z-auto
          border-t
          bg-white/90 sm:bg-transparent
          backdrop-blur supports-[backdrop-filter]:bg-white/70
        "
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          <div className="py-3 sm:mt-8 sm:border-t sm:pt-4 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold">Total:</h2>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              ৳{total.toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={doClear}
          className="w-full sm:w-auto px-6 py-3 bg-zinc-500 hover:bg-zinc-700 text-white rounded-full text-lg order-2 sm:order-1"
        >
          Clear All Cart
        </button>

        <button
          onClick={() => navigate("/checkout")}
          disabled={cartItems.length === 0}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 text-lg order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
