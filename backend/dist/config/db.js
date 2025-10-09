"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectMongo() {
    if (mongoose_1.default.connection.readyState === 1)
        return;
    mongoose_1.default.connection.on('connected', () => console.log('MongoDB connected'));
    mongoose_1.default.connection.on('error', (err) => console.error('MongoDB error', err));
    await mongoose_1.default.connect(env_1.ENV.MONGODB_URI);
}
