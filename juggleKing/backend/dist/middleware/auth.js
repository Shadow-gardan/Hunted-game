"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: "Sign in to access this resource." });
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET is not configured on the server.");
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.admin = payload;
        next();
    }
    catch {
        return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }
}
