"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Order_1 = require("../models/Order");
const router = (0, express_1.Router)();
router.get('/slots', async (_req, res) => {
    // Static demo slots; replace with real scheduling/geo logic
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const slots = [];
    for (let d = 0; d < 7; d++) {
        for (const hour of [9, 11, 13, 15, 17]) {
            const dt = new Date(base);
            dt.setDate(dt.getDate() + d);
            dt.setHours(hour);
            slots.push(dt.toISOString());
        }
    }
    res.json({ slots });
});
const scheduleSchema = zod_1.z.object({ orderId: zod_1.z.string(), pickupAt: zod_1.z.string().datetime() });
router.post('/schedule', auth_1.requireAuth, async (req, res) => {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { orderId, pickupAt } = parsed.data;
    const order = await Order_1.Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Order not found' });
    order.pickupAt = pickupAt;
    order.status = 'scheduled';
    await order.save();
    res.json({ order });
});
exports.default = router;
// Extra endpoints
router.post('/reschedule', auth_1.requireAuth, async (req, res) => {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { orderId, pickupAt } = parsed.data;
    const order = await Order_1.Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Order not found' });
    order.pickupAt = pickupAt;
    order.status = 'scheduled';
    await order.save();
    res.json({ order });
});
router.post('/cancel', auth_1.requireAuth, async (req, res) => {
    const cancelSchema = zod_1.z.object({ orderId: zod_1.z.string() });
    const parsed = cancelSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { orderId } = parsed.data;
    const order = await Order_1.Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Order not found' });
    order.status = 'cancelled';
    await order.save();
    res.json({ order });
});
