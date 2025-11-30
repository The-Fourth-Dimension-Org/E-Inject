 // client/src/routes/AdminRoute.jsx
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import api from "../lib/api";

export default function AdminRoute({ children }) {
  const { isSeller, setIsSeller } = useContext(AppContext) || {};
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/seller/is-auth");
        setIsSeller?.(!!data?.success);
      } catch {
        setIsSeller?.(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [setIsSeller]);

  if (checking) return <div className="p-6">Checking admin auth…</div>;
  if (!isSeller) {
    return (
      <Navigate
        to={`/admin/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
}
