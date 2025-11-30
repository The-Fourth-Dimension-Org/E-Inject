import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import api from "../lib/api";

export default function Account() {
  const { user, loading, setShowUserLogin, logout } = useContext(AppContext) || {};
  const [addresses, setAddresses] = useState([]);
  const [addrErr, setAddrErr] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await api.get("/address/get");
        setAddresses(data?.addresses || []);
      } catch (e) {
        setAddrErr(e?.response?.data?.message || "Failed to load addresses");
      }
    })();
  }, [user]);

  if (loading) return <div className="p-6">Loading…</div>;

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">My Account</h1>
        <p className="text-gray-600 mb-4">Please log in to view your account.</p>
        <button
          onClick={() => setShowUserLogin?.(true)}
          className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Log in / Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Account</h1>
          <p className="text-sm text-gray-600">Manage your profile & addresses</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-full border hover:bg-gray-50"
        >
          Logout
        </button>
      </header>

      {/* Profile */}
      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-medium mb-2">Profile</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <div><b>Name:</b> {user?.name}</div>
          <div><b>Email:</b> {user?.email}</div>
        </div>
      </section>

      {/* Addresses */}
      <section className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Saved Addresses</h2>
        </div>
        {addrErr && <div className="text-sm text-red-600 mb-2">{addrErr}</div>}
        {!addresses.length ? (
          <div className="text-sm text-gray-600">
            No address found. You can add one during checkout.
          </div>
        ) : (
          <div className="grid gap-3">
            {addresses.map((a) => (
              <div key={a._id} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">
                  {a.firstName} {a.lastName} — {a.phone}
                </div>
                <div className="text-gray-700">
                  {a.street}, {a.city} {a.state} {a.zipCode}, {a.country}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
