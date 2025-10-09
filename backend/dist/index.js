"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const catalog_1 = __importDefault(require("./routes/catalog"));
const quote_1 = __importDefault(require("./routes/quote"));
const orders_1 = __importDefault(require("./routes/orders"));
const payments_1 = __importDefault(require("./routes/payments"));
const pickup_1 = __importDefault(require("./routes/pickup"));
const membership_1 = __importDefault(require("./routes/membership"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const accessories_1 = __importDefault(require("./routes/accessories"));
const pricing_1 = __importDefault(require("./routes/pricing"));
const promos_1 = __importDefault(require("./routes/promos"));
const app = (0, express_1.default)();
// Security & parsers
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: env_1.ENV.CORS_ORIGIN, credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
// Basic rate limit
const limiter = (0, express_rate_limit_1.default)({ windowMs: 60_000, max: 120 });
app.use(limiter);
// Health route
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'cashpe-api', time: new Date().toISOString() });
});
// Routes
app.use('/auth', auth_1.default);
app.use('/catalog', catalog_1.default);
app.use('/quotes', quote_1.default);
app.use('/orders', orders_1.default);
app.use('/payments', payments_1.default);
app.use('/pickup', pickup_1.default);
app.use('/membership', membership_1.default);
app.use('/reviews', reviews_1.default);
app.use('/accessories', accessories_1.default);
app.use('/pricing', pricing_1.default);
app.use('/promos', promos_1.default);
// TODO: mount routes (orders, pickup, payments, accessories, membership, reviews, admin)
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
async function start() {
    await (0, db_1.connectMongo)();
    app.listen(env_1.ENV.PORT, () => {
        console.log(`API listening on http://localhost:${env_1.ENV.PORT}`);
    });
}
start().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
});
