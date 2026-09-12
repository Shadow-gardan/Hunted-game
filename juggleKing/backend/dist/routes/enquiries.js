"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("../db");
const validate_1 = require("../utils/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protect the public contact form from spam/abuse without blocking genuine guests.
const submitLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "You've submitted a few enquiries already — please wait a bit before trying again." },
});
// POST /api/enquiries — public
router.post("/", submitLimiter, (req, res, next) => {
    try {
        const data = validate_1.enquirySchema.parse(req.body);
        const stmt = db_1.db.prepare(`
      INSERT INTO enquiries (fullName, phone, email, eventType, eventDate, guestCount, message)
      VALUES (@fullName, @phone, @email, @eventType, @eventDate, @guestCount, @message)
    `);
        const info = stmt.run({
            fullName: data.fullName,
            phone: data.phone,
            email: data.email || null,
            eventType: data.eventType,
            eventDate: data.eventDate,
            guestCount: data.guestCount,
            message: data.message || null,
        });
        res.status(201).json({ message: "Enquiry received.", id: info.lastInsertRowid });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/enquiries — protected, supports ?status= and ?q=
router.get("/", auth_1.requireAuth, (req, res, next) => {
    try {
        const { status, q } = req.query;
        let query = "SELECT * FROM enquiries WHERE 1=1";
        const params = {};
        if (status) {
            query += " AND status = @status";
            params.status = status;
        }
        if (q) {
            query += " AND (fullName LIKE @q OR phone LIKE @q)";
            params.q = `%${q}%`;
        }
        query += " ORDER BY createdAt DESC";
        const data = db_1.db.prepare(query).all(params);
        const statsRows = db_1.db
            .prepare("SELECT status, COUNT(*) as count FROM enquiries GROUP BY status")
            .all();
        const stats = { total: 0 };
        for (const row of statsRows) {
            stats[row.status] = row.count;
            stats.total += row.count;
        }
        res.json({ data, stats });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/enquiries/:id — protected, update status
router.patch("/:id", auth_1.requireAuth, (req, res, next) => {
    try {
        const { status } = validate_1.statusSchema.parse(req.body);
        const id = Number(req.params.id);
        const result = db_1.db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) {
            return res.status(404).json({ message: "Enquiry not found." });
        }
        res.json({ message: "Status updated." });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/enquiries/:id — protected
router.delete("/:id", auth_1.requireAuth, (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const result = db_1.db.prepare("DELETE FROM enquiries WHERE id = ?").run(id);
        if (result.changes === 0) {
            return res.status(404).json({ message: "Enquiry not found." });
        }
        res.json({ message: "Enquiry deleted." });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
