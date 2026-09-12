"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFound = notFound;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        const message = err.issues[0]?.message || "Invalid input.";
        return res.status(400).json({ message, issues: err.issues });
    }
    console.error(err);
    return res.status(500).json({ message: "Something went wrong on our end. Please try again shortly." });
}
function notFound(_req, res) {
    res.status(404).json({ message: "Not found." });
}
