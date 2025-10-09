"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Address_1 = require("../models/Address");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    const list = await Address_1.Address.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ addresses: list });
});
const createSchema = zod_1.z.object({ label: zod_1.z.string().optional(), address1: zod_1.z.string().min(3), address2: zod_1.z.string().optional(), city: zod_1.z.string().min(2), pin: zod_1.z.string().min(3), phone: zod_1.z.string().optional(), isDefault: zod_1.z.boolean().optional() });
router.post('/', auth_1.requireAuth, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const data = parsed.data;
    if (data.isDefault) {
        await Address_1.Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }
    const a = await Address_1.Address.create({ userId: req.user.id, ...data });
    res.json({ address: a });
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const a = await Address_1.Address.findOne({ _id: req.params.id, userId: req.user.id });
    if (!a)
        return res.status(404).json({ error: 'Not found' });
    if (parsed.data.isDefault)
        await Address_1.Address.updateMany({ userId: req.user.id }, { isDefault: false });
    Object.assign(a, parsed.data);
    await a.save();
    res.json({ address: a });
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    const a = await Address_1.Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!a)
        return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
});
exports.default = router;
