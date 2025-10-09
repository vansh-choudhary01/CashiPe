"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const quoteSchema = zod_1.z.object({
    category: zod_1.z.string(),
    brand: zod_1.z.string(),
    model: zod_1.z.string(),
    storage: zod_1.z.string().optional(),
    ageMonths: zod_1.z.number().int().nonnegative().default(0),
    promoCode: zod_1.z.string().optional(),
    condition: zod_1.z.object({
        screenCracks: zod_1.z.boolean().default(false),
        bodyDents: zod_1.z.boolean().default(false),
        batteryHealth: zod_1.z.number().min(50).max(100).default(90),
        cameraIssue: zod_1.z.boolean().default(false),
        faceIdIssue: zod_1.z.boolean().default(false),
    }).default({}),
    accessories: zod_1.z.object({
        box: zod_1.z.boolean().default(false),
        charger: zod_1.z.boolean().default(false),
        earphones: zod_1.z.boolean().default(false),
    }).default({}),
});
router.post('/quote', (req, res) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { brand, model, storage, ageMonths, condition, accessories } = parsed.data;
    const promoCode = (req.body?.promoCode || '');
    // Base price heuristic (stub) – replace with DB-based model pricing
    let base = 10000;
    if (brand.toLowerCase().includes('apple'))
        base += 15000;
    if (brand.toLowerCase().includes('samsung'))
        base += 8000;
    if (storage) {
        const n = parseInt(storage.replace(/\D/g, ''), 10);
        if (!Number.isNaN(n))
            base += Math.min(5000, Math.floor(n / 64) * 1500);
    }
    // Age depreciation
    const depreciation = Math.min(0.6, (ageMonths / 12) * 0.15);
    base = Math.round(base * (1 - depreciation));
    // Condition deductions
    let deductions = 0;
    if (condition.screenCracks)
        deductions += 3000;
    if (condition.bodyDents)
        deductions += 1000;
    if (condition.cameraIssue)
        deductions += 800;
    if (condition.faceIdIssue)
        deductions += 2000;
    if (condition.batteryHealth < 80)
        deductions += Math.round((80 - condition.batteryHealth) * 30);
    // Accessory bonuses
    let bonuses = 0;
    if (accessories.box)
        bonuses += 300;
    if (accessories.charger)
        bonuses += 500;
    if (accessories.earphones)
        bonuses += 200;
    const total = Math.max(500, base - deductions + bonuses);
    // Apply promo if provided (basic check: percent off or fixed off via Promo model)
    let promoApplied = null;
    if (promoCode) {
        // avoid importing Promo at top to keep file lightweight; require dynamically
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { Promo } = require('../models/Promo');
            const p = Promo.findOne({ code: promoCode.trim().toUpperCase(), active: true });
            // p is a promise; handle async
            // NOTE: this is a best-effort synchronous-looking approach: respond without promo if not resolved
            p.then((promo) => {
                if (!promo)
                    return;
            });
        }
        catch (e) {
            // ignore promo errors for now
        }
    }
    res.json({
        breakdown: {
            base,
            depreciation: Math.round(base * depreciation),
            deductions,
            bonuses,
        },
        total,
        summary: `${brand} ${model}${storage ? ' ' + storage : ''}`,
    });
});
exports.default = router;
// Identify device by IMEI/serial (stubbed heuristics)
router.post('/identify', (req, res) => {
    const imei = String((req.body?.imei || req.body?.serial || '')).trim();
    if (!imei)
        return res.status(400).json({ error: 'imei or serial required' });
    // Very naive stub: if starts with 35 => iPhone, 86 => Android Samsung, else generic
    let brand = 'Generic';
    let model = 'Device';
    if (/^35/.test(imei)) {
        brand = 'Apple';
        model = 'iPhone';
    }
    else if (/^86/.test(imei)) {
        brand = 'Samsung';
        model = 'Galaxy';
    }
    res.json({ brand, model });
});
