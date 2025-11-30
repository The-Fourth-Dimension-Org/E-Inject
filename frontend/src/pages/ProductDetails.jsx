 
 import { useEffect, useMemo, useState, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { CartContext } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
// ✅ If CSV is in public/data:
const CSV_URL = "/data/medicines.csv";
// import CSV_URL from "../assets/medicines_price_25percent_increased.csv";

export default function ProductDetails() {
  const { id } = useParams(); // "/products/:id"
  const decodedId = decodeURIComponent(id || "").toLowerCase().trim();

  const { state } = useLocation();
  const passed = state?.product;

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(!passed);
  const [error, setError] = useState("");

  const { addToCart } = useContext(CartContext) || {};
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (passed) return;
    let mounted = true;
    setLoading(true);
    setError("");
    fetch(CSV_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((txt) => {
        const parsed = Papa.parse(txt, { header: true });
        const rows = (parsed.data || []).filter(Boolean);
        if (mounted) setAll(rows);
      })
      .catch((e) => setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [passed]);

  const product = useMemo(() => {
    if (passed) return passed;
    return all.find(
      (r) => String(r.med_name || "").toLowerCase().trim() === decodedId
    );
  }, [passed, all, decodedId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!product) return <div className="p-6">Not found</div>;

  const name = product.med_name || "";
  const img = product.image_url || "";
  const uses = product.uses || "";
  const composition = product.composition || "";
  const manufacturer = product.manufacturer || "";
  const category = product.category || "";
  const price =
    typeof product._price === "number" && product._price > 0
      ? product._price
      : Number(String(product["price (BDT)"] || "").replace(/[^\d.]/g, "")) || 0;

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      {/* Image */}
      <div>
        <div className="w-full aspect-[4/3] bg-gray-100 rounded overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : null}
        </div>
      </div>

      {/* Details */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{name}</h1>

        {manufacturer && (
          <div className="text-gray-600 mb-1">Manufacturer: {manufacturer}</div>
        )}
        {category && (
          <div className="text-gray-600 mb-3">Category: {category}</div>
        )}

        {composition && (
          <p className="mb-2">
            <b>Composition:</b> {composition}
          </p>
        )}
        {uses && (
          <p className="mb-4">
            <b>Uses:</b> {uses}
          </p>
        )}

        <div className="text-2xl font-bold text-green-600 mb-4">
          ৳{price.toLocaleString("en-US")}
        </div>

        <button
          onClick={() => {
            addToCart({ id: decodedId, name, image_url: img, price }, 1);
            showToast("Added to cart", {
              action: { label: "View cart", onClick: () => navigate("/cart") },
            });
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
 
