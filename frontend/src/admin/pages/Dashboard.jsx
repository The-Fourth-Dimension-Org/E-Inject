 import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

/** Small stat card */
const StatCard = ({ title, value, sub, icon }) => (
  <div className="rounded-2xl border bg-white shadow-sm p-4 relative overflow-hidden">
    <div className="pointer-events-none absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-100/60" />
    <div className="flex items-start justify-between relative">
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
        {sub && <div className="text-[11px] text-gray-500 mt-1">{sub}</div>}
      </div>
      {icon}
    </div>
  </div>
);

const IconBox = ({ path }) => (
  <div className="w-10 h-10 rounded-xl bg-emerald-50 grid place-items-center border border-emerald-100">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d={path} stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 🔄 Load from backend (admin)
  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await api.get("/order/seller"); // requires seller cookie
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e) {
      const msg =
        e?.response?.status === 401
          ? "Unauthorized (401) – Admin login required."
          : e?.response?.data?.message || "Failed to load orders.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Optional: auto-refresh every 30s (remove if you don't want it)
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 📊 KPIs (dynamic)
  const kpis = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((s, o) => s + (Number(o.amount) || 0), 0);
    const pending = orders.filter((o) => o.status === "Order Placed" || o.status === "Processing").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    return { total, revenue, pending, delivered };
  }, [orders]);

  // 🧮 status chips
  const statusCounts = useMemo(() => {
    const all = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    const map = Object.fromEntries(all.map((s) => [s, 0]));
    for (const o of orders) {
      if (map[o.status] !== undefined) map[o.status] += 1;
    }
    return map;
  }, [orders]);

  // 🧾 latest 8 orders
  const latest = useMemo(() => orders.slice(0, 8), [orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">Live snapshot of store performance</p>
        </div>
        <button
          onClick={load}
          className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          {err} {err.includes("login") ? "Go to Admin Login and try again." : ""}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border bg-white overflow-hidden">
              <div className="h-full w-full animate-pulse bg-gray-100" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Orders"
              value={kpis.total}
              icon={<IconBox path="M3 7h18M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />}
            />
            <StatCard
              title="Revenue (BDT)"
              value={`৳${kpis.revenue.toLocaleString("en-US")}`}
              sub="Sum of paid & COD totals"
              icon={<IconBox path="M12 1v22M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7" />}
            />
            <StatCard
              title="Pending / Processing"
              value={kpis.pending}
              icon={<IconBox path="M12 6v6l4 2" />}
            />
            <StatCard
              title="Delivered"
              value={kpis.delivered}
              icon={<IconBox path="M20 6 9 17l-5-5" />}
            />
          </div>

          {/* Status mini-table */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Order Status</h2>
              <span className="text-xs text-gray-500">Total {orders.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {Object.entries(statusCounts).map(([name, count]) => (
                <div
                  key={name}
                  className="rounded-lg border bg-gray-50 px-3 py-2 flex items-center justify-between"
                  title={name}
                >
                  <span className="text-xs capitalize text-gray-600">{name}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest orders list */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Latest Orders</h2>
              <a href="/admin/orders" className="text-sm text-emerald-700 hover:underline">
                View all
              </a>
            </div>

            {latest.length === 0 ? (
              <div className="text-sm text-gray-600">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="py-2 pr-3">Order</th>
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((o) => (
                      <tr key={o._id} className="border-t">
                        <td className="py-2 pr-3 font-medium">#{o._id.slice(-6)}</td>
                        <td className="py-2 pr-3">
                          {/* address is populated in backend; safe fallbacks */}
                          {o.address?.firstName} {o.address?.lastName}
                          <div className="text-xs text-gray-500">{o.address?.phone}</div>
                        </td>
                        <td className="py-2 pr-3 font-semibold">৳{(Number(o.amount) || 0).toLocaleString("en-US")}</td>
                        <td className="py-2 pr-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-gray-50">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
