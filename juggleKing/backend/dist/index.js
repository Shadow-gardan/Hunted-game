"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
require("./db"); // ensures schema + admin seed run on boot
const enquiries_1 = __importDefault(require("./routes/enquiries"));
const auth_1 = __importDefault(require("./routes/auth"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "100kb" }));
// General API-wide rate limit, on top of the per-route limits in enquiries/auth routes.
app.use("/api", (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/enquiries", enquiries_1.default);
app.use("/api/auth", auth_1.default);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`The Juggle King API listening on port ${PORT}`);
});
