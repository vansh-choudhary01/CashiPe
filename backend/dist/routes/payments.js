"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const auth_1 = require("../middleware/auth");
const Order_1 = require("../models/Order");
const router = (0, express_1.Router)();
// ----- Razorpay -----
const itemSchema = zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string(), price: zod_1.z.number().nonnegative(), quantity: zod_1.z.number().int().positive() });
const createOrderSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().default('INR'),
    receipt: zod_1.z.string().optional(),
    items: zod_1.z.array(itemSchema).min(1),
});
router.post('/razorpay/order', auth_1.requireAuth, async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    //uncomment after debug
    // const instance = new Razorpay({ key_id: ENV.RAZORPAY_KEY_ID, key_secret: ENV.RAZORPAY_KEY_SECRET })
    // const rzpOrder = await instance.orders.create({ amount: Math.round(parsed.data.amount * 100), currency: parsed.data.currency, receipt: parsed.data.receipt })
    const rzpOrder = {
        id: 'test-order-id',
        amount: Math.round(parsed.data.amount * 100),
        currency: parsed.data.currency,
        receipt: parsed.data.receipt,
    };
    // Persist purchase order with items and payment metadata
    const dbOrder = await Order_1.Order.create({
        type: 'purchase',
        userId: req.user.id,
        status: 'created',
        items: parsed.data.items,
        price: parsed.data.amount,
        payment: {
            provider: 'razorpay',
            orderId: rzpOrder.id,
            status: 'created',
        },
    });
    res.json({ order: rzpOrder, dbOrder });
});
const verifySchema = zod_1.z.object({ order_id: zod_1.z.string(), payment_id: zod_1.z.string(), signature: zod_1.z.string() });
router.post('/razorpay/verify', async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { order_id, payment_id, signature } = parsed.data;
    const body = `${order_id}|${payment_id}`;
    const expected = crypto_1.default.createHmac('sha256', env_1.ENV.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    const valid = expected === signature;
    if (valid) {
        // Mark order as paid/verified
        await Order_1.Order.findOneAndUpdate({ 'payment.orderId': order_id }, {
            $set: {
                status: 'paid',
                'payment.paymentId': payment_id,
                'payment.signature': signature,
                'payment.status': 'verified',
            },
            $push: { timeline: { status: 'paid', at: new Date().toISOString(), note: 'Payment verified via Razorpay' } },
        });
    }
    res.json({ valid });
});
// Save payout method for an order
const payoutSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
    payout: zod_1.z.object({
        method: zod_1.z.enum(['upi', 'bank', 'wallet']),
        upi: zod_1.z.string().optional(),
        bank: zod_1.z
            .object({ ifsc: zod_1.z.string(), account: zod_1.z.string(), name: zod_1.z.string() })
            .optional(),
    }),
});
router.post('/payout-method', auth_1.requireAuth, async (req, res) => {
    const parsed = payoutSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { orderId, payout } = parsed.data;
    const order = await Order_1.Order.findOne({ _id: orderId, userId: req.user.id });
    if (!order)
        return res.status(404).json({ error: 'Order not found' });
    order.payout = payout;
    await order.save();
    res.json({ order });
});
// ----- Paytm Stubs -----
// Note: Implement production-grade checksums using Paytm's SDK when keys are available.
const paytmInitSchema = zod_1.z.object({ amount: zod_1.z.number().positive(), orderId: zod_1.z.string(), customerId: zod_1.z.string() });
router.post('/paytm/init', async (req, res) => {
    const parsed = paytmInitSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    // Return minimal payload to proceed on client. Integrate official SDK for prod.
    res.json({
        txnToken: 'stub-token',
        orderId: parsed.data.orderId,
        amount: parsed.data.amount,
        mid: process.env.PAYTM_MID,
        callbackUrl: process.env.PAYTM_CALLBACK_URL,
    });
});
router.post('/paytm/callback', async (_req, res) => {
    // Verify checksum, update payment/order status accordingly
    res.json({ received: true });
});
exports.default = router;
