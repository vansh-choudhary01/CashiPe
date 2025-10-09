"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Order_1 = require("../models/Order");
const router = (0, express_1.Router)();
const createSellOrderSchema = zod_1.z.object({
    category: zod_1.z.string(),
    brand: zod_1.z.string(),
    model: zod_1.z.string(),
    storage: zod_1.z.string(),
    condition: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    address: zod_1.z.string().min(6),
});
const createSellBatchSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({ category: zod_1.z.string(), brand: zod_1.z.string(), model: zod_1.z.string(), storage: zod_1.z.string(), condition: zod_1.z.string(), price: zod_1.z.number().positive() })).min(1),
    address: zod_1.z.string().min(6),
});
router.post('/sell', auth_1.requireAuth, async (req, res) => {
    const parsed = createSellOrderSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const o = await Order_1.Order.create({
        type: 'sell',
        userId: req.user.id,
        status: 'created',
        ...parsed.data,
        timeline: [{ status: 'created', at: new Date().toISOString(), note: 'Order created' }],
    });
    res.json({ order: o });
});
router.post('/sell-batch', auth_1.requireAuth, async (req, res) => {
    const parsed = createSellBatchSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { items, address } = parsed.data;
    const order = await Order_1.Order.create({
        type: 'sell',
        userId: req.user.id,
        status: 'created',
        items,
        address,
        price: items.reduce((s, it) => s + Number(it.price || 0), 0),
        timeline: [{ status: 'created', at: new Date().toISOString(), note: 'Batch sell order created' }],
    });
    res.json({ order });
});
const scheduleSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    pickupAt: zod_1.z.string(), // ISO datetime
    address: zod_1.z.string().min(6),
});
router.post('/schedule', auth_1.requireAuth, async (req, res) => {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { orderId, pickupAt, address } = parsed.data;
    const order = await Order_1.Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Order not found' });
    order.pickupAt = pickupAt;
    order.address = address;
    order.status = 'scheduled';
    order.timeline = [
        ...(order.timeline || []),
        { status: 'scheduled', at: new Date().toISOString(), note: `Pickup at ${pickupAt}` },
    ];
    await order.save();
    res.json({ order });
});
router.get('/my', auth_1.requireAuth, async (req, res) => {
    const orders = await Order_1.Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    const order = await Order_1.Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Not found' });
    res.json({ order });
});
// Timeline retrieval
router.get('/:id/timeline', auth_1.requireAuth, async (req, res) => {
    const order = await Order_1.Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Not found' });
    res.json({ timeline: order.timeline || [] });
});
// Create invoice document (stub URL)
router.post('/:id/invoice', auth_1.requireAuth, async (req, res) => {
    const order = await Order_1.Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Not found' });
    // Generate a simple invoice as a text blob and store as data URL (demo only)
    const invoiceText = [];
    invoiceText.push('CashiPe - Invoice');
    invoiceText.push('===================');
    invoiceText.push(`Order ID: ${order._id || order.id}`);
    invoiceText.push(`Type: ${order.type}`);
    if (order.items && order.items.length) {
        invoiceText.push('Items:');
        for (const it of order.items)
            invoiceText.push(` - ${it.name} x${it.quantity} @ ${it.price}`);
    }
    else {
        invoiceText.push(`${order.brand || ''} ${order.model || ''} ${order.storage || ''}`);
    }
    invoiceText.push(`Amount: ₹ ${Number(order.price || 0).toLocaleString('en-IN')}`);
    invoiceText.push(`Created: ${new Date(order.createdAt || Date.now()).toLocaleString()}`);
    const text = invoiceText.join('\n');
    const b64 = Buffer.from(text).toString('base64');
    const url = `data:text/plain;base64,${b64}`;
    const doc = { type: 'invoice', url, createdAt: new Date().toISOString() };
    order.documents = [...(order.documents || []), doc];
    await order.save();
    res.json({ document: doc });
});
exports.default = router;
