const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const { db }  = require("../database");
const auth    = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login — Connexion admin
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ erreur: "Email et mot de passe requis." });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
  if (!admin) {
    return res.status(401).json({ erreur: "Identifiants invalides." });
  }

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) {
    return res.status(401).json({ erreur: "Identifiants invalides." });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, nom: admin.nom },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    admin: { id: admin.id, email: admin.email, nom: admin.nom }
  });
});

// GET /api/auth/me — Vérifier le token
router.get("/me", auth, (req, res) => {
  const admin = db.prepare("SELECT id, email, nom FROM admins WHERE id = ?").get(req.admin.id);
  if (!admin) return res.status(404).json({ erreur: "Admin introuvable." });
  res.json(admin);
});

// POST /api/auth/logout — Déconnexion (côté client, juste une confirmation)
router.post("/logout", auth, (req, res) => {
  res.json({ message: "Déconnecté avec succès." });
});

module.exports = router;
