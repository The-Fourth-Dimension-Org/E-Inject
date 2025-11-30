 import React, { useEffect, useState } from "react";
import api from "../../lib/api";

const STATUSES = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/order/seller"); // admin cookie required
      setOrders(data?.orders || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.patch("/order/update-status", { orderId, status });
      const updated = data?.order;
      setOrders(prev => prev.map(o => (o._id === orderId ? (updated || { ...o, status }) : o)));
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading orders…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orders.length) return <div className="p-6">No orders yet.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Orders (Admin)</h1>
        <p className="text-sm text-gray-500">Total: {orders.length}</p>
      </div>

      <div className="grid gap-3">
        {orders.map((o) => {
          const created = o?.createdAt ? new Date(o.createdAt).toLocaleString() : "-";
          const addr = o?.address || {};
          const customerName = [addr.firstName, addr.lastName].filter(Boolean).join(" ") || "—";
          const phone = addr.phone || "—";

          return (
            <div key={o._id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">#{o._id}</div>
                  <div className="text-xs text-gray-500">{created}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="border rounded px-2 py-1"
                    disabled={updatingId === o._id}
                    title="Update order status"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium mb-1">Customer</div>
                  <div><b>Name:</b> {customerName}</div>
                  <div><b>Phone:</b> {phone}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium mb-1">Summary</div>
                  <div><b>Amount:</b> ৳{(o.amount ?? 0).toLocaleString("en-US")}</div>
                  <div><b>Payment:</b> {o.paymentType} {o.isPaid ? "(Paid)" : "(Unpaid)"}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium mb-1">Ship to</div>
                  <div>{addr.street}</div>
                  <div>{addr.city} {addr.state} {addr.zipCode}</div>
                  <div>{addr.country}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium mb-1">Items</div>
                <div className="rounded-lg border overflow-hidden">
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
                      {(o.items || []).map((it, idx) => {
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
                      {(!o.items || o.items.length === 0) && (
                        <tr>
                          <td className="px-3 py-2 border-b" colSpan={4}>No items</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
