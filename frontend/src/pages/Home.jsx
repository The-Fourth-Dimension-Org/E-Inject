<<<<<<< HEAD
import React from 'react'

const Home = () => {
  return (
    <div>Home</div>
  );
};

export default Home;
=======
 import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { CartContext } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

import main_banner_bg from "../assets/main_banner_bg.png";
import main_banner_bg_sm from "../assets/main_banner_bg_sm.png";

// ✅ If CSV is in public/data:
const CSV_URL = "/data/medicines.csv";
// import CSV_URL from "../assets/medicines_price_25percent_increased.csv";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { addToCart } = useContext(CartContext) || {};
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const text = await fetch(CSV_URL).then((r) => r.text());
        const parsed = Papa.parse(text, { header: true });
        const rows = (parsed.data || [])
          .filter(Boolean)
          .filter((r) => r.med_name);
        if (mounted) setItems(rows);
      } catch (e) {
        console.error("CSV load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Featured categories (Top 6)
  const categories = useMemo(() => {
    const m = new Map();
    for (const r of items) {
      const c = r.category || "Others";
      m.set(c, (m.get(c) || 0) + 1);
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  // Recent products (8pcs)
  const recent = useMemo(() => items.slice(0, 8), [items]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const q = search.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  if (loading) {
    return <div className="p-8">Loading…</div>;
  }

  return (
    <div className="p-6 md:p-8">
      {/* Hero / Search */}
      {/* ✅ Desktop banner */}
      <div
        className="relative rounded-2xl overflow-hidden border border-emerald-100 hidden md:block"
        style={{
          backgroundImage: `url(${main_banner_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 p-6 md:p-10 text-white">
          <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow">
            E-INJECT — Find trusted medicines quickly
          </h1>
          <p className="mt-2 text-white/90">
            Search by name, use-case, composition or manufacturer.
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-4 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2 max-w-xl"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none py-2 text-black"
              placeholder="e.g. paracetamol, antibiotic, Sun Pharma…"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Mobile banner */}
      <div
        className="relative rounded-2xl overflow-hidden border border-emerald-100 md:hidden"
        style={{
          backgroundImage: `url(${main_banner_bg_sm})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 p-6 text-white">
          <h1 className="text-xl font-extrabold drop-shadow">
            E-INJECT — Find trusted medicines quickly
          </h1>
          <p className="mt-2 text-white/90 text-sm">
            Search by name, use-case, composition or manufacturer.
          </p>
          <form
            onSubmit={handleSearch}
            className="mt-4 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none py-2 text-black"
              placeholder="Search medicines..."
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Featured Categories</h2>
            <Link className="text-emerald-700 font-medium" to="/products">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() =>
                  navigate(`/products?q=${encodeURIComponent(c.name)}`)
                }
                className="border rounded-xl px-3 py-4 bg-white hover:shadow transition text-left"
                title={`${c.name} (${c.count})`}
              >
                <div className="text-sm font-semibold line-clamp-1">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500">{c.count} items</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Products (with Add to Cart) */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">Recent Products</h2>
          <Link className="text-emerald-700 font-medium" to="/products">
            See more →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-gray-600">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recent.map((item, idx) => {
              const id = encodeURIComponent(
                String(item.med_name || "").toLowerCase().trim()
              );
              const price =
                Number(
                  String(item["price (BDT)"] || "").replace(/[^\d.]/g, "")
                ) || 0;

              return (
                <div
                  key={`${id}-${idx}`}
                  className="border rounded-xl p-4 bg-white shadow-sm hover:shadow transition"
                >
                  <Link to={`/products/${id}`} state={{ product: item }}>
                    <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.med_name}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : null}
                    </div>
                    <div className="font-semibold line-clamp-1">
                      {item.med_name}
                    </div>
                  </Link>

                  {item.uses ? (
                    <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {item.uses}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="font-bold text-emerald-700">
                      ৳{price.toLocaleString("en-US")}
                    </div>
                    <button
                      onClick={() => {
                        addToCart(
                          {
                            id,
                            name: item.med_name,
                            price,
                            image_url: item.image_url || "",
                          },
                          1
                        );
                        showToast("Added to cart", {
                          action: { label: "View cart", onClick: () => navigate("/cart") },
                        });
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
>>>>>>> master
