"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Resolve storage from the backend process directory so src and dist use the same database.
const dataDir = path_1.default.resolve(process.env.DATA_DIR || path_1.default.join(process.cwd(), "data"));
if (!fs_1.default.existsSync(dataDir))
    fs_1.default.mkdirSync(dataDir, { recursive: true });
const dbPath = path_1.default.join(dataDir, "juggleking.db");
exports.db = new better_sqlite3_1.default(dbPath);
exports.db.pragma("journal_mode = WAL");
exports.db.exec(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    eventType TEXT NOT NULL,
    eventDate TEXT NOT NULL,
    guestCount TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
  );
`);
// Seed a default admin user on first run, from env vars (never hard-coded secrets).
function seedAdmin() {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD;
    const existing = exports.db.prepare("SELECT id FROM admins WHERE username = ?").get(username);
    if (existing)
        return;
    if (!password) {
        console.warn("[warn] No ADMIN_PASSWORD set in .env — skipping admin seed. Set ADMIN_USERNAME/ADMIN_PASSWORD and restart to create the admin account.");
        return;
    }
    const passwordHash = bcryptjs_1.default.hashSync(password, 12);
    exports.db.prepare("INSERT INTO admins (username, passwordHash) VALUES (?, ?)").run(username, passwordHash);
    console.log(`[info] Seeded admin user "${username}" from environment variables.`);
}
seedAdmin();
