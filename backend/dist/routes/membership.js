"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/status', auth_1.requireAuth, async (req, res) => {
    const user = await User_1.User.findById(req.user.id);
    if (!user)
        return res.status(404).json({ error: 'Not found' });
    res.json({ membershipTier: user.membershipTier || 'none' });
});
const enrollSchema = zod_1.z.object({ tier: zod_1.z.enum(['gold']) });
router.post('/enroll', auth_1.requireAuth, async (req, res) => {
    const parsed = enrollSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const user = await User_1.User.findByIdAndUpdate(req.user.id, { membershipTier: parsed.data.tier }, { new: true });
    res.json({ membershipTier: user?.membershipTier || 'none' });
});
exports.default = router;
