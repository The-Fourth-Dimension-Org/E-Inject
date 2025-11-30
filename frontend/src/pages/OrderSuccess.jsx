 // src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";

// ✅ Delivery banners (desktop = horizontal, mobile = vertical)
import deliveryBanner from "../assets/bottom_banner_image.png";
import deliveryMobile from "../assets/bottom_banner_image_sm.png";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // /api/order/:orderId  -> baseURL already in api instance
        const { data } = await api.get(`/order/${id}`);
        if (data?.success) setOrder(data.order);
        else setErr("Order not found");
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading your order details...</div>;
  if (err) return <div className="p-8 text-center text-red-600">{err}</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  const addr = order.address || {};
  const created = order?.createdAt ? new Date(order.createdAt).toLocaleString() : "-";

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      {/* ✅ Success icon */}
      <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <span className="text-2xl">✅</span>
      </div>

      {/* ✅ Heading */}
      <h1 className="text-2xl font-bold mt-4 text-emerald-700">Order placed successfully!</h1>
      <p className="text-gray-600 mt-1">
        Your order ID is <b>{id}</b>.
      </p>

      {/* ✅ Delivery message */}
      <h2 className="text-xl font-semibold text-gray-800 mt-6">🚚 Your order is on the way!</h2>

      {/* 🖼️ Responsive Delivery Banner (desktop=horizontal, mobile=vertical) */}
      <div className="mt-4 w-full rounded-xl overflow-hidden shadow-lg">
        <picture>
          <source media="(max-width: 768px)" srcSet={deliveryMobile} />
          <img src={deliveryBanner} alt="Fast Delivery" className="w-full h-auto object-cover" />
        </picture>
      </div>

      {/* ✅ Order Summary */}
      <div className="mt-6 border rounded-xl p-4 text-left bg-white shadow-sm">
        <h2 className="font-semibold mb-2">Summary</h2>
        <div className="text-sm text-gray-700">
          <div><b>Date:</b> {created}</div>
          <div><b>Status:</b> {order.status}</div>
          <div><b>Payment:</b> {order.paymentType} {order.isPaid ? "(Paid)" : "(Unpaid)"}</div>
          <div className="mt-2"><b>Total:</b> ৳{(order.amount ?? 0).toLocaleString("en-US")}</div>
        </div>
      </div>

      {/* ✅ Address */}
      <div className="mt-4 border rounded-xl p-4 text-left bg-white shadow-sm">
        <h2 className="font-semibold mb-2">Shipping Address</h2>
        <div className="text-sm text-gray-700">
          <div>{addr.firstName} {addr.lastName}</div>
          <div>{addr.street}</div>
          <div>{addr.city} {addr.state} {addr.zipCode}</div>
          <div>{addr.country}</div>
          <div>Phone: {addr.phone}</div>
        </div>
      </div>

      {/* ✅ Items */}
      <div className="mt-4 border rounded-xl p-4 text-left bg-white shadow-sm">
        <h2 className="font-semibold mb-2">Items</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 border-b">Product</th>
              <th className="text-right px-3 py-2 border-b">Price</th>
              <th className="text-right px-3 py-2 border-b">Qty</th>
              <th className="text-right px-3 py-2 border-b">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((it, idx) => {
              const subtotal = (it.productPrice || 0) * (it.quantity || 0);
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{it.productName}</td>
                  <td className="px-3 py-2 border-b text-right">৳{(it.productPrice || 0).toLocaleString("en-US")}</td>
                  <td className="px-3 py-2 border-b text-right">{it.quantity}</td>
                  <td className="px-3 py-2 border-b text-right">৳{subtotal.toLocaleString("en-US")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Actions */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link to="/orders" className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50">
          View My Orders
        </Link>
        <Link to="/products" className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
