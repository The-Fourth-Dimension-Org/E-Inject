 import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setErr("");
      try {
        const { data } = await api.get("/order/user");
        setOrders(data?.orders || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load your orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading your orders…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!orders.length) return <div className="p-6">You have no orders yet.</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">My Orders</h1>

      <div className="grid gap-3">
        {orders.map((o) => {
          const created = o?.createdAt ? new Date(o.createdAt).toLocaleString() : "-";
          const addr = o?.address || {};
          return (
            <div key={o._id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">#{o._id}</div>
                  <div className="text-xs text-gray-500">{created}</div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Status: </span>
                  <span className="font-medium">{o.status}</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium mb-1">Summary</div>
                  <div><b>Amount:</b> ৳{(o.amount ?? 0).toLocaleString("en-US")}</div>
                  <div><b>Payment:</b> {o.paymentType} {o.isPaid ? "(Paid)" : "(Unpaid)"}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                  <div className="font-medium mb-1">Items</div>
                  <ul className="list-disc pl-5">
                    {(o.items || []).map((it, i) => (
                      <li key={i}>
                        {it.productName} × {it.quantity} — ৳{(it.productPrice || 0).toLocaleString("en-US")}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <div className="font-medium">Shipping address</div>
                <div>{addr.firstName} {addr.lastName}</div>
                <div>{addr.street}</div>
                <div>{addr.city} {addr.state} {addr.zipCode}</div>
                <div>{addr.country}</div>
                <div>Phone: {addr.phone}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
