"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = require("../models/User");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
router.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password, name } = parsed.data;
    const existing = await User_1.User.findOne({ email });
    if (existing)
        return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await (0, password_1.hashPassword)(password);
    const user = await User_1.User.create({ email, passwordHash, name });
    const token = (0, jwt_1.signJwt)({ id: user.id });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const user = await User_1.User.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await (0, password_1.comparePassword)(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = (0, jwt_1.signJwt)({ id: user.id });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
router.get('/me', auth_1.requireAuth, async (req, res) => {
    const user = await User_1.User.findById(req.user.id).select('-passwordHash');
    if (!user)
        return res.status(404).json({ error: 'Not found' });
    res.json({ user });
});
router.post('/logout', auth_1.requireAuth, async (_req, res) => {
    // Stateless JWT logout: client should discard token
    res.json({ ok: true });
});
exports.default = router;
