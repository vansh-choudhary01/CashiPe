"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        req.user = { id: payload.id };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
