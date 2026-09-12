"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("../db");
const validate_1 = require("../utils/validate");
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again in a few minutes." },
});
router.post("/login", loginLimiter, (req, res, next) => {
    try {
        const { username, password } = validate_1.loginSchema.parse(req.body);
        const admin = db_1.db
            .prepare("SELECT id, username, passwordHash FROM admins WHERE username = ?")
            .get(username);
        if (!admin || !bcryptjs_1.default.compareSync(password, admin.passwordHash)) {
            return res.status(401).json({ message: "Incorrect username or password." });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Server is missing JWT_SECRET configuration." });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username }, secret, { expiresIn: "12h" });
        res.json({ token });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
