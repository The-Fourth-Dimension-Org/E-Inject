 import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import Papa from "papaparse";

const CSV_URL = "/data/medicines.csv"; // public/data/medicines.csv

const cn = (...a) => a.filter(Boolean).join(" ");

export default function AdminProducts() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const page = Number(sp.get("page") || 1);

  // DB state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);

  // CSV state
  const [csvLoading, setCsvLoading] = useState(true);
  const [csvErr, setCsvErr] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // --------- DB list loader ----------
  const fetchList = async () => {
    try {
      setErr(""); setLoading(true);
      const { data } = await api.get("/products", {
        params: { q, page, limit, onlyActive: "0" }, // admin sees all
      });
      setItems(data?.items || []);
      setTotal(data?.total || 0);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); /* eslint-disable-next-line */ }, [q, page, limit]);

  // --------- CSV loader (PapaParse) ----------
  const normalizeRows = (rows) =>
    rows
      .map((o) => {
        const images = Array.isArray(o.images)
          ? o.images
          : (o.images || "")
              .toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

        const price = Number(
          String(o.price ?? o["price (BDT)"] ?? "").toString().replace(/[^\d.]/g, "")
        );
        const stock = Number(o.stock || 0);
        const isActive =
          o.isActive === undefined || o.isActive === null || o.isActive === ""
            ? true
            : `${o.isActive}`.toLowerCase() !== "false";

        // 🔁 CSV কলাম ↔️ Product ফিল্ড ম্যাপিং (প্রয়োজনে বদলাও)
        return {
          name: (o.name || o.med_name || "").toString().trim(),
          price: Number.isNaN(price) ? undefined : price,
          stock: Number.isNaN(stock) ? 0 : stock,
          brand: (o.brand || o.manufacturer || "").toString(),
          category: (o.category || "").toString(),
          description: (o.description || o.uses || "").toString(),
          images,
          thumbnail: (o.thumbnail || "").toString(),
          isActive,
          slug: (o.slug || "").toString().trim(), // optional
        };
      })
      .filter((p) => p.name && typeof p.price === "number");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCsvErr(""); setCsvLoading(true);
        const text = await fetch(CSV_URL, { cache: "no-store" }).then((r) => {
          if (!r.ok) throw new Error("CSV not found");
          return r.text();
        });
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const rows = parsed?.data || [];
        const items = normalizeRows(rows);
        if (mounted) setCsvRows(items);
      } catch (e) {
        if (mounted) setCsvErr(e?.message || "CSV load error");
      } finally {
        if (mounted) setCsvLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --------- CSV → Bulk API sync ----------
  const syncCsvToDb = async () => {
    if (!csvRows.length) return alert("No CSV rows to import");
    if (!confirm(`Sync ${csvRows.length} products from CSV to database?`)) return;
    try {
      setSyncing(true);
      const { data } = await api.post("/products/bulk", { items: csvRows });
      alert(
        `Synced!\nUpserted: ${data?.summary?.upserted || 0}\nModified: ${data?.summary?.modified || 0}`
      );
      await fetchList();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // --------- search + pagination ----------
  const onSearch = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const term = (form.get("q") || "").toString().trim();
    const next = new URLSearchParams(sp);
    if (term) next.set("q", term); else next.delete("q");
    next.delete("page");
    setSp(next, { replace: true });
  };

  const goPage = (p) => {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    setSp(next, { replace: true });
  };

  // --------- CRUD helpers ----------
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit = (prod) => { setEditing(prod); setShowForm(true); };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      await fetchList();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.patch(`/products/${p._id}`, { isActive: !p.isActive });
      await fetchList();
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div>
      {/* --- CSV preview + Sync --- */}
      <div className="mb-4 p-4 rounded-xl border bg-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">CSV Preview (public)</h2>
            <p className="text-xs text-gray-500">Source: {CSV_URL}</p>
          </div>
          <button
            onClick={syncCsvToDb}
            disabled={csvLoading || syncing || csvErr || !csvRows.length}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm disabled:opacity-50"
          >
            {syncing ? "Syncing..." : `Sync ${csvRows.length || 0} to DB`}
          </button>
        </div>

        {csvLoading ? (
          <div className="mt-3 text-sm text-gray-600">Loading CSV…</div>
        ) : csvErr ? (
          <div className="mt-3 text-sm text-red-600">Error: {csvErr}</div>
        ) : !csvRows.length ? (
          <div className="mt-3 text-sm text-gray-600">No rows found.</div>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Name", "Price", "Brand", "Category", "Active"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 10).map((r, i) => (
                  <tr key={`${r.name}-${i}`} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">৳{Number(r.price || 0).toLocaleString("en-US")}</td>
                    <td className="px-3 py-2">{r.brand || "-"}</td>
                    <td className="px-3 py-2">{r.category || "-"}</td>
                    <td className="px-3 py-2">{r.isActive ? "YES" : "NO"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {csvRows.length > 10 && (
              <div className="text-xs text-gray-500 mt-2">Showing first 10 of {csvRows.length} rows</div>
            )}
          </div>
        )}
      </div>

      {/* --- DB table + CRUD --- */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-semibold">Products (Database)</h1>
          <p className="text-sm text-gray-500">Total: {total}</p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={onSearch} className="hidden sm:flex items-center gap-2 border rounded-full px-3 py-1.5">
            <input
              name="q" defaultValue={q} placeholder="Search by name, brand, category"
              className="outline-none text-sm w-56"
            />
            <button className="px-3 py-1 rounded-full text-sm bg-emerald-600 hover:bg-emerald-700 text-white">
              Search
            </button>
          </form>
          <button
            onClick={openCreate}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
          >
            + New Product
          </button>
        </div>
      </div>

      {err && <div className="p-3 mb-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{err}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl border" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 rounded-xl border bg-white text-center text-gray-600">No products found.</div>
      ) : (
        <div className="overflow-auto border rounded-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Product", "Price", "Stock", "Brand", "Category", "Active", "Actions"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={p._id} className="border-t">
                  <td className="px-3 py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.thumbnail ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[220px]">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">৳{Number(p.price || 0).toLocaleString("en-US")}</td>
                  <td className="px-3 py-2">{p.stock}</td>
                  <td className="px-3 py-2">{p.brand || "-"}</td>
                  <td className="px-3 py-2">{p.category || "-"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs border",
                        p.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      )}
                    >
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(p)}
                        className={cn(
                          "px-3 py-1 rounded text-white",
                          p.isActive ? "bg-zinc-600 hover:bg-zinc-700" : "bg-emerald-600 hover:bg-emerald-700"
                        )}
                        title="Toggle Active"
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {pages > 1 && (
              <tfoot>
                <tr>
                  <td colSpan={8} className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2 py-2">
                      <button onClick={() => goPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded border disabled:opacity-50">Prev</button>
                      <span className="text-sm">Page {page} / {pages}</span>
                      <button onClick={() => goPage(Math.min(pages, page + 1))} disabled={page >= pages} className="px-3 py-1.5 rounded border disabled:opacity-50">Next</button>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {showForm && (
        <ProductForm
          onClose={() => setShowForm(false)}
          onSaved={async () => { setShowForm(false); setEditing(null); await fetchList(); }}
          editing={editing}
        />
      )}
    </div>
  );
}

/* ----------------------------- Form Modal ----------------------------- */
function ProductForm({ onClose, onSaved, editing }) {
  const [form, setForm] = useState(() => ({
    name: editing?.name || "",
    price: editing?.price ?? "",
    stock: editing?.stock ?? 0,
    brand: editing?.brand || "",
    category: editing?.category || "",
    description: editing?.description || "",
    images: (editing?.images || []).join(", "),
    thumbnail: editing?.thumbnail || "",
    isActive: editing?.isActive ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const isEdit = !!editing?._id;

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        images: (form.images || "").split(",").map((s) => s.trim()).filter(Boolean),
        thumbnail: form.thumbnail || undefined,
      };
      if (!payload.thumbnail && payload.images?.length) payload.thumbnail = payload.images[0];

      if (isEdit) {
        await api.patch(`/products/${editing._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      await onSaved?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <form onSubmit={submit} className="w-full max-w-2xl bg-white rounded-2xl border shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit product" : "Create product"}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600">Name *</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="text-xs text-gray-600">Price (৳) *</label>
            <input name="price" type="number" min="0" value={form.price} onChange={onChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="text-xs text-gray-600">Stock</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Brand</label>
            <input name="brand" value={form.brand} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Category</label>
            <input name="category" value={form.category} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Images (comma separated URLs)</label>
            <input name="images" value={form.images} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">Thumbnail URL (optional)</label>
            <input name="thumbnail" value={form.thumbnail} onChange={onChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="isActive" name="isActive" type="checkbox" checked={!!form.isActive} onChange={onChange} />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button disabled={saving} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? "Saving..." : (isEdit ? "Save changes" : "Create")}
          </button>
        </div>
      </form>
    </div>
  );
}
