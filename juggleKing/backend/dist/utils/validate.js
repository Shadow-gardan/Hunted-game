"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusSchema = exports.loginSchema = exports.enquirySchema = void 0;
const zod_1 = require("zod");
exports.enquirySchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[+\d][\d\s-]{7,}$/, "Enter a valid phone number"),
    email: zod_1.z.string().trim().email("Enter a valid email").optional().or(zod_1.z.literal("")),
    eventType: zod_1.z.string().trim().min(2).max(60),
    eventDate: zod_1.z.string().trim().min(1, "Event date is required"),
    guestCount: zod_1.z.string().trim().min(1, "Guest count is required").max(30),
    message: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal("")),
});
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().trim().min(1),
    password: zod_1.z.string().min(1),
});
exports.statusSchema = zod_1.z.object({
    status: zod_1.z.enum(["new", "contacted", "confirmed", "archived"]),
});
