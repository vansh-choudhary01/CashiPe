"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DeviceCatalog_1 = require("../models/DeviceCatalog");
const router = (0, express_1.Router)();
router.get('/categories', async (_req, res) => {
    const cats = await DeviceCatalog_1.DeviceCatalog.distinct('category');
    res.json({ categories: cats });
});
router.get('/brands', async (req, res) => {
    const cat = req.query.category;
    const filter = {};
    if (cat)
        filter.category = cat;
    const brands = await DeviceCatalog_1.DeviceCatalog.distinct('brand', filter);
    res.json({ brands });
});
router.get('/models', async (req, res) => {
    const category = req.query.category;
    const brand = req.query.brand;
    if (!category || !brand)
        return res.status(400).json({ error: 'category and brand required' });
    const models = await DeviceCatalog_1.DeviceCatalog.find({ category, brand }).select('model basePrice storageOptions conditions grade');
    res.json({ models });
});
router.get('/search', async (req, res) => {
    const q = req.query.q?.trim();
    if (!q)
        return res.json({ results: [] });
    const regex = new RegExp(q, 'i');
    const results = await DeviceCatalog_1.DeviceCatalog.find({ $or: [{ brand: regex }, { model: regex }, { category: regex }] }).limit(50);
    res.json({ results });
});
exports.default = router;
