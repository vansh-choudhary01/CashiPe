"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cashpe',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
};
