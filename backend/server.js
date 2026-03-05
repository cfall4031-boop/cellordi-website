require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const compression = require("compression");
const { initAdmin } = require("./database");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── SÉCURITÉ ─────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // headers de sécurité HTTP
app.use(compression());                            // compression gzip des réponses

// ── CORS ─────────────────────────────────────────────────────
// CORS_ORIGINS = origines supplémentaires séparées par virgule (ex: URL Vercel)
const extraOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://reparationcellordi.ca",
      "https://www.reparationcellordi.ca",
      ...extraOrigins,
    ];
    // Autoriser les requêtes sans origin (ex: Postman, mobile)
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour : ${origin}`));
    }
  },
  credentials: true
}));

// ── BODY PARSING (avec limite taille) ───────────────────────
app.use(express.json({ limit: "5mb" }));           // 5mb pour base64 signatures
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── RATE LIMITING ────────────────────────────────────────────
const limiterPublic = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erreur: "Trop de requêtes. Veuillez réessayer dans 15 minutes." }
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erreur: "Trop de tentatives de connexion. Réessayez dans 15 minutes." }
});

// Appliquer avant les routes
app.use("/api/auth/login",  limiterLogin);
app.use("/api/rendezvous",  limiterPublic);
app.use("/api/messages",    limiterPublic);
app.use("/api/decharges",   limiterPublic);

// ── ROUTES ──────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/rendezvous", require("./routes/rendezvous"));
app.use("/api/tickets",    require("./routes/tickets"));
app.use("/api/clients",    require("./routes/clients"));
app.use("/api/messages",   require("./routes/messages"));
app.use("/api/decharges",  require("./routes/decharges"));

// ── SANTÉ ────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Réparation CeLL&Ordi API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erreur: `Route introuvable: ${req.method} ${req.path}` });
});

// ── ERREURS GLOBALES ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err.message);
  res.status(500).json({ erreur: "Erreur interne du serveur." });
});

// ── DÉMARRAGE ────────────────────────────────────────────────
initAdmin();
app.listen(PORT, () => {
  console.log(`\n✅ Serveur CeLL&Ordi démarré`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   Rate limiting: actif`);
  console.log(`   Helmet: actif\n`);
});
