require("dotenv").config();
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "cellordi.db"));
const email    = process.env.ADMIN_EMAIL    || "admin@reparationcellordi.ca";
const password = process.env.ADMIN_PASSWORD || "AdminPassword123!";
const nom      = process.env.ADMIN_NOM      || "Administrateur";
const hash     = bcrypt.hashSync(password, 10);

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
if (existing) {
  db.prepare("UPDATE admins SET password = ?, nom = ? WHERE email = ?").run(hash, nom, email);
  console.log("✅ Mot de passe réinitialisé pour :", email);
} else {
  db.prepare("INSERT INTO admins (email, password, nom) VALUES (?, ?, ?)").run(email, hash, nom);
  console.log("✅ Admin créé :", email);
}

const all = db.prepare("SELECT id, email, nom FROM admins").all();
console.log("Admins en base :", JSON.stringify(all, null, 2));
db.close();
process.exit(0);
