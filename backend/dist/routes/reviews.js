"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Review_1 = require("../models/Review");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    orderId: zod_1.z.string().optional(),
    targetType: zod_1.z.enum(['technician', 'device', 'order']),
    targetId: zod_1.z.string(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const review = await Review_1.Review.create({ ...parsed.data, userId: req.user.id });
    res.json({ review });
});
router.get('/list', async (req, res) => {
    const targetType = req.query.targetType;
    const targetId = req.query.targetId;
    const filter = {};
    if (targetType)
        filter.targetType = targetType;
    if (targetId)
        filter.targetId = targetId;
    const reviews = await Review_1.Review.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ reviews });
});
exports.default = router;
