const express = require("express");
const ProductModel = require("../models/Product");
const { verifyToken, checkApiKey } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../utils/validate");

const router = express.Router();

// List products — readable via API key (so storefronts/integrations can browse the catalog)
router.get(
    "/",
    checkApiKey,
    asyncHandler(async (req, res) => {
        const { vendor, inStock } = req.query;
        const filter = {};
        if (vendor) filter.vendor = vendor;
        if (inStock === "true") filter.stock = { $gt: 0 };

        const products = await ProductModel.find(filter).sort({ createdAt: -1 });
        res.json(products);
    })
);

// Get a single product by ID
router.get(
    "/:id",
    checkApiKey,
    asyncHandler(async (req, res) => {
        const product = await ProductModel.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    })
);

// Create a product (admin only)
router.post(
    "/",
    verifyToken,
    asyncHandler(async (req, res) => {
        const errors = validateBody(req.body, {
            name: { required: true, type: "string" },
            price: { required: true, type: "number", min: 0 },
            stock: { type: "number", min: 0 }
        });
        if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

        const product = await ProductModel.create(req.body);
        res.status(201).json(product);
    })
);

// Update a product (admin only)
router.patch(
    "/:id",
    verifyToken,
    asyncHandler(async (req, res) => {
        const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    })
);

// Delete a product (admin only)
router.delete(
    "/:id",
    verifyToken,
    asyncHandler(async (req, res) => {
        const product = await ProductModel.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json({ deleted: true });
    })
);

module.exports = router;
