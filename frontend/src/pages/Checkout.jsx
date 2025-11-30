 import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { AppContext } from "../context/AppContext.jsx";
import api from "../lib/api";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart: items = [], clearCart, cartTotal: subtotal = 0 } =
    useContext(CartContext) || {};
  const { showToast } = useToast ? useToast() : { showToast: null };
  const { user } = useContext(AppContext) || {};

  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    payment: "cod",
    note: "",
  });

  const shipping = useMemo(() => (items.length > 0 ? 60 : 0), [items.length]);
  const grandTotal = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^[0-9+ -]{8,20}$/.test(form.phone)) return "Valid phone is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.city.trim()) return "City is required";
    if (!form.postcode.trim()) return "Postcode is required";
    if (items.length === 0) return "Your cart is empty";
    return null;
  };

  const placeOrder = async () => {
    const err = validate();
    if (err) {
      showToast ? showToast(err, { duration: 2000 }) : alert(err);
      return;
    }
    setPlacing(true);
    try {
      // 1) Create/Save address (backend requires some extra fields)
      const [firstName, ...rest] = form.name.trim().split(" ");
      const lastName = rest.join(" ") || ".";
      const addressPayload = {
        firstName,
        lastName,
        email: user?.email || "guest@example.com",
        street: form.address.trim(),
        city: form.city.trim(),
        state: "N/A",
        zipCode: String(form.postcode).trim(),
        country: "Bangladesh",
        phone: form.phone.trim(),
      };

      await api.post("/address/add", { address: addressPayload });

      // 2) Fetch latest address id (controller already sorts desc)
      const adrRes = await api.get("/address/get");
      const addresses = adrRes?.data?.addresses || [];
      if (!addresses.length) throw new Error("No address found after saving.");
      const addressId = addresses[0]._id;

      // 3) Build items for backend
      const orderItems = items.map((it) => ({
        productName: it.name,
        productPrice: Number(it.price) || 0,
        productImage: it.image_url || "",
        quantity: Number(it.qty) || 1,
      }));
      if (shipping > 0) {
        orderItems.push({
          productName: "Shipping",
          productPrice: shipping,
          productImage: "",
          quantity: 1,
        });
      }

      // 4) Place COD order
      const res = await api.post("/order/cod", {
        items: orderItems,
        addressId,
      });

      const orderId = res?.data?.orderId;
      if (!orderId) throw new Error("Order ID missing from response.");

      // 5) Cleanup & go success
      clearCart?.();
      showToast && showToast("Order placed successfully!");
      navigate(`/order-success/${orderId}`);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to place order. Please login and try again.";
      showToast ? showToast(msg, { duration: 2500 }) : alert(msg);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 outline-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 outline-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">City</label>
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 outline-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Postcode</label>
              <input
                name="postcode"
                value={form.postcode}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 outline-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Payment Method</label>
              <select
                name="payment"
                value={form.payment}
                onChange={onChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white outline-emerald-500"
              >
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="digital" disabled>
                  Digital Payment (Coming Soon)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Order Note (optional)</label>
            <input
              name="note"
              value={form.note}
              onChange={onChange}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 outline-emerald-500"
            />
          </div>
        </div>

        <div className="border rounded-xl p-4 bg-white shadow-sm h-max">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="space-y-3 max-h-64 overflow-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded" />
                  )}
                  <div className="text-sm">
                    <div className="font-medium line-clamp-1">{item.name}</div>
                    <div className="text-gray-500">x {item.qty}</div>
                  </div>
                </div>
                <div className="font-medium">
                  ৳{(item.price * item.qty).toLocaleString("en-US")}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>৳{subtotal.toLocaleString("en-US")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>৳{shipping.toLocaleString("en-US")}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total</span>
              <span className="text-emerald-700">
                ৳{grandTotal.toLocaleString("en-US")}
              </span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-lg disabled:opacity-60"
          >
            {placing ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
