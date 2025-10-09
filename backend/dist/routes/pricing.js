"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        batteryHealth: zod_1.z.number().min(0).max(100).default(90),
        cameraIssue: zod_1.z.boolean().default(false),
        faceIdIssue: zod_1.z.boolean().default(false),
    }).default({}),
    accessories: zod_1.z.object({
        box: zod_1.z.boolean().default(false),
        charger: zod_1.z.boolean().default(false),
        earphones: zod_1.z.boolean().default(false),
    }).default({}),
});
router.post('/quote', async (req, res) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { brand, model, storage, ageMonths, condition, accessories, promoCode } = parsed.data;
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
    // Age depreciation applied to base
    const depreciationRate = Math.min(0.6, (ageMonths / 12) * 0.15);
    const depreciated = Math.round(base * (1 - depreciationRate));
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
    const prePromoTotal = Math.max(500, depreciated - deductions + bonuses);
    // Promo lookup and application
    let promo = null;
    let promoDiscount = 0;
    if (promoCode) {
        try {
            const Promo = (await Promise.resolve().then(() => __importStar(require('../models/Promo')))).Promo;
            promo = await Promo.findOne({ code: promoCode.trim().toUpperCase(), active: true });
            if (promo) {
                if (promo.type === 'percent')
                    promoDiscount = Math.round(prePromoTotal * (promo.amount / 100));
                else
                    promoDiscount = Math.round(promo.amount);
            }
        }
        catch (e) {
            // log and continue without promo
            console.error('Promo lookup failed', e);
        }
    }
    const total = Math.max(0, prePromoTotal - promoDiscount);
    res.json({
        breakdown: {
            base,
            depreciated,
            depreciationAmount: Math.round(base * depreciationRate),
            deductions,
            bonuses,
            prePromoTotal,
            promo: promo ? { code: promo.code, type: promo.type, amount: promo.amount, discount: promoDiscount } : null,
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
