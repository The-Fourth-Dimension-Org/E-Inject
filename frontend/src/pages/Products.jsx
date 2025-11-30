 import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { CartContext } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

 const CSV_URL = "/data/medicines.csv";
// import CSV_URL from "../assets/medicines_price_25percent_increased.csv";

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { addToCart } = useContext(CartContext) || {};
  const { showToast } = useToast();
  const navigate = useNavigate();

  const q = (searchParams.get("q") || "").toLowerCase().trim();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const text = await fetch(CSV_URL).then((r) => r.text());
        const parsed = Papa.parse(text, { header: true });
        const rows = (parsed.data || [])
          .filter(Boolean)
          .filter((r) => r.med_name);

        const normalized = rows.map((r) => ({
          ...r,
          _price: Number(String(r["price (BDT)"] || "").replace(/[^\d.]/g, "")) || 0,
        }));

        if (mounted) setData(normalized);
      } catch (e) {
        console.error("CSV load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);


   // Search filter
  const list = useMemo(() => {
    if (!q) return data;
    return data.filter((r) => {
      const hay = [
        r.med_name,
        r.uses,
        r.composition,
        r.manufacturer,
        r.category,
      ]
        .join(" | ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, q]);

  if (loading) {
    return <div className="p-8">Loading products…</div>;
  }

  if (!Array.isArray(list) || list.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2"> All Products</h1>
        <p className="text-gray-600">No products found{q ? ` for “${q}”` : ""}.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Products{q ? ` — “${q}”` : ""}</h1>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {list.map((item, idx) => {
          const id = encodeURIComponent(String(item.med_name || "").toLowerCase().trim());
          const price =
            Number(String(item._price || item["price (BDT)"] || "").replace(/[^\d.]/g, "")) || 0;

          return (
            <div
              key={`${id}-${idx}`}
              className="border p-4 rounded shadow hover:shadow-lg transition bg-white"
            >
              <Link to={`/products/${id}`} state={{ product: item }}>
                <div className="w-full h-40 bg-gray-100 rounded overflow-hidden mb-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.med_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold line-clamp-1">{item.med_name}</h2>
              </Link>

              {item.category ? (
                <div className="text-xs text-gray-600 mb-1">{item.category}</div>
              ) : null}

              {item.uses ? (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.uses}</p>
              ) : null}

              {/* Price + medium Add button (same line) */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="font-bold text-green-600">
                  ৳{price.toLocaleString("en-US")}
                </div>
                <button
                  onClick={() => {
                    addToCart(
                      { id, name: item.med_name, price, image_url: item.image_url || "" },
                      1
                    );
                    showToast("Added to cart", {
                      action: { label: "View cart", onClick: () => navigate("/cart") },
                    });
                  }}
                  className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
