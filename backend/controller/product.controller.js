 // backend/controller/product.controller.js
import Product from "../models/product.model.js";

// slug helper
const makeSlug = (s = "") =>
  s.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// -------- Admin: Create --------
export const createProduct = async (req, res) => {
  try {
    const {
      name, price, stock = 0, description = "",
      images = [], thumbnail, category = "", brand = "", slug
    } = req.body;

    if (!name || typeof price !== "number") {
      return res.status(400).json({ success: false, message: "name and price are required" });
    }

    const doc = await Product.create({
      name,
      price,
      stock,
      description,
      images,
      thumbnail: thumbnail || images?.[0] || null,
      category,
      brand,
      slug: slug || makeSlug(name),
      createdBy: req?.seller?.email || null,
    });

    res.status(201).json({ success: true, product: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate slug" });
    }
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------- Admin: Update --------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.name && !payload.slug) payload.slug = makeSlug(payload.name);

    const doc = await Product.findByIdAndUpdate(id, payload, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, product: doc });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate slug" });
    }
    console.error("updateProduct error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------- Admin: Delete --------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Product.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------- Public: List --------
export const listProducts = async (req, res) => {
  try {
    const {
      q = "",
      category,
      brand,
      minPrice,
      maxPrice,
      sort = "new",     // new | price_asc | price_desc | name_asc
      page = 1,
      limit = 12,
      onlyActive = "1",
    } = req.query;

    const filter = {};
    if (onlyActive === "1") filter.isActive = true;

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
    if (brand) filter.brand = { $regex: `^${brand}$`, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      new: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name_asc: { name: 1 },
    };
    const sortOpt = sortMap[sort] || sortMap.new;

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.min(60, Math.max(1, Number(limit)));

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortOpt).skip((pageNum - 1) * perPage).limit(perPage),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / perPage),
    });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------- Public: Get single --------
export const getProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const doc =
      (await Product.findOne({ slug: idOrSlug })) ||
      (await Product.findById(idOrSlug));

    if (!doc) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product: doc });
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// -------- Admin: BULK upsert from CSV rows --------
export const bulkUpsertProducts = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) {
      return res.status(400).json({ success: false, message: "No items to import" });
    }

    // normalize + ensure slug
    const docs = items
      .map((p) => {
        const name = (p.name || "").toString().trim();
        const price = Number(p.price);
        if (!name || Number.isNaN(price)) return null;

        const slug = (p.slug && p.slug.toString().trim()) || makeSlug(name);

        const images = Array.isArray(p.images)
          ? p.images
          : (p.images || "")
              .toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

        const payload = {
          name,
          slug,
          price,
          stock: Number(p.stock || 0),
          description: p.description || "",
          images,
          thumbnail: p.thumbnail || images?.[0] || null,
          category: p.category || "",
          brand: p.brand || "",
          isActive: p.isActive === undefined ? true : !!p.isActive,
          createdBy: req?.seller?.email || null,
        };
        return payload;
      })
      .filter(Boolean);

    if (!docs.length) {
      return res.status(400).json({ success: false, message: "Nothing valid to import" });
    }

    // build bulk ops (upsert by slug)
    const ops = docs.map((d) => ({
      updateOne: {
        filter: { slug: d.slug },
        update: { $set: d },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(ops, { ordered: false });

    const summary = {
      upserted: (result.upsertedCount || 0),
      modified: (result.modifiedCount || 0),
      matched: (result.matchedCount || 0),
    };

    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("bulkUpsertProducts error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
