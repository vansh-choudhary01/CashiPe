"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Accessory_1 = require("../models/Accessory");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const items = await Accessory_1.Accessory.find({ active: true }).sort({ createdAt: -1 });
    res.json({ items });
});
router.get('/:id', async (req, res) => {
    const item = await Accessory_1.Accessory.findById(req.params.id);
    if (!item)
        return res.status(404).json({ error: 'Not found' });
    res.json({ item });
});
// Simple cart endpoints for demo (stateless tokens can be added later)
const cartSchema = zod_1.z.object({ id: zod_1.z.string(), quantity: zod_1.z.number().min(1).max(10) });
router.post('/cart/add', async (req, res) => {
    const parsed = cartSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const product = await Accessory_1.Accessory.findById(parsed.data.id);
    if (!product || !product.active)
        return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
});
exports.default = router;
