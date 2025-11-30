 import React, { useEffect, useState, useMemo } from "react";
import api from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchUsers = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await api.get("/seller/users"); // admin-only
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (e) {
      const msg =
        e?.response?.status === 401
          ? "Unauthorized (401) – Admin login required."
          : e?.response?.data?.message || "Failed to load users.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) =>
      (u.name || "").toLowerCase().includes(t) ||
      (u.email || "").toLowerCase().includes(t) ||
      String(u._id || "").toLowerCase().includes(t)
    );
  }, [q, users]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name/email/id"
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={fetchUsers}
            className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 mb-3">
          {err}
        </div>
      )}

      {loading ? (
        <div className="overflow-hidden border rounded-lg bg-white">
          <div className="h-40 w-full animate-pulse bg-gray-100" />
        </div>
      ) : (
        <div className="overflow-auto border rounded-lg bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Name", "Email", "Created"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u._id} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
