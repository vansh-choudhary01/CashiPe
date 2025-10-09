"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Promo_1 = require("../models/Promo");
const router = (0, express_1.Router)();
const checkSchema = zod_1.z.object({ code: zod_1.z.string().min(1), amount: zod_1.z.number().optional() });
router.post('/check', async (req, res) => {
    const parsed = checkSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { code } = parsed.data;
    const promo = await Promo_1.Promo.findOne({ code: code.trim().toUpperCase(), active: true });
    if (!promo)
        return res.status(404).json({ valid: false, message: 'Invalid or expired promo code' });
    // Basic expiry/min order checking
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date())
        return res.status(404).json({ valid: false, message: 'Promo expired' });
    res.json({ valid: true, promo: { code: promo.code, type: promo.type, amount: promo.amount, minOrderValue: promo.minOrderValue } });
});
exports.default = router;
