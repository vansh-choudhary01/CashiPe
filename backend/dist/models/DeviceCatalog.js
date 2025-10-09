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
exports.DeviceCatalog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const DeviceCatalogSchema = new mongoose_1.Schema({
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    basePrice: { type: Number, required: true },
    storageOptions: { type: [String], default: ['64 GB', '128 GB', '256 GB', '512 GB'] },
    conditions: { type: [String], default: ['Like New', 'Good', 'Fair', 'Needs Repair'] },
    grade: { type: String, enum: ['Fair', 'Good', 'Superb'] },
}, { timestamps: true });
DeviceCatalogSchema.index({ category: 1, brand: 1, model: 1 }, { unique: true });
exports.DeviceCatalog = mongoose_1.default.models.DeviceCatalog || mongoose_1.default.model('DeviceCatalog', DeviceCatalogSchema);
