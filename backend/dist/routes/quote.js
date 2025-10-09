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
const DeviceCatalog_1 = require("../models/DeviceCatalog");
const Quote_1 = require("../models/Quote");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const quoteSchema = zod_1.z.object({
    category: zod_1.z.string(),
    brand: zod_1.z.string(),
    model: zod_1.z.string(),
    storage: zod_1.z.string(),
    condition: zod_1.z.string(),
    questionnaire: zod_1.z.record(zod_1.z.any()).optional(),
    promoCode: zod_1.z.string().optional(),
});
// Simple rule engine + placeholder for AI market adjustment
function computePrice(base, condition, storage, questionnaire) {
    const storageFactor = {
        '64 GB': 1,
        '128 GB': 1.08,
        '256 GB': 1.16,
        '512 GB': 1.25,
    };
    const conditionFactor = {
        'Like New': 1,
        'Good': 0.9,
        'Fair': 0.78,
        'Needs Repair': 0.5,
    };
    let price = base * (storageFactor[storage] || 1) * (conditionFactor[condition] || 1);
    // Questionnaire penalties (scratches/dents/battery cycles etc.)
    if (questionnaire) {
        if (questionnaire.scratches === 'many')
            price *= 0.93;
        if (questionnaire.dents === 'yes')
            price *= 0.95;
        if (questionnaire.batteryHealth && Number(questionnaire.batteryHealth) < 80)
            price *= 0.9;
    }
    // Placeholder market trend factor (to be replaced by AI model/API)
    const marketTrendFactor = 1.0;
    price *= marketTrendFactor;
    return Math.round(price);
}
router.post('/', auth_1.requireAuth, async (req, res) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { category, brand, model, storage, condition, questionnaire } = parsed.data;
    const promoCode = (req.body?.promoCode || '');
    const device = await DeviceCatalog_1.DeviceCatalog.findOne({ category, brand, model });
    if (!device)
        return res.status(404).json({ error: 'Device not found' });
    const basePrice = device.basePrice;
    const final = computePrice(basePrice, condition, storage, questionnaire);
    let promoDiscount = 0;
    let appliedCode;
    if (promoCode) {
        try {
            const promo = await (await Promise.resolve().then(() => __importStar(require('../models/Promo')))).Promo.findOne({ code: promoCode.trim().toUpperCase(), active: true });
            if (promo) {
                appliedCode = promo.code;
                if (promo.type === 'percent')
                    promoDiscount = Math.round(final * (promo.amount / 100));
                else
                    promoDiscount = Math.round(promo.amount);
            }
        }
        catch (e) {
            // ignore promo errors
        }
    }
    const discounted = Math.max(0, final - promoDiscount);
    const q = await Quote_1.Quote.create({
        userId: req.user.id,
        category, brand, model, storage, condition,
        questionnaire,
        basePrice,
        finalPrice: discounted,
        promoCode: appliedCode,
        promoDiscount,
    });
    res.json({ quote: q });
});
exports.default = router;
