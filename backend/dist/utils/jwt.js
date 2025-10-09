"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signJwt(payload, expiresIn = '7d') {
    const opts = { expiresIn: expiresIn };
    return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, opts);
}
