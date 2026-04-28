const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const investmentPlanRoutes = require("./routes/investmentPlan.routes");

const app = express();

// ── CORS ──────────────────────────────────────────────────────
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ── Body & Logging ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ── Debug Middleware ──────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DEBUG: ${req.method} ${req.path}`);
  
  // Log file path resolution for static file requests
  if (req.path.includes('.')) {
    const filePath = path.join(__dirname, "dist", req.path);
    console.log(`[${timestamp}] DEBUG: Static file request - Resolved path: ${filePath}`);
    
    // Check if file exists
    const fs = require('fs');
    const fileExists = fs.existsSync(filePath);
    console.log(`[${timestamp}] DEBUG: File exists: ${fileExists}`);
  }
  
  next();
});

// ── Uploads ───────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── 1. PWA files with correct headers (BEFORE static) ────────
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Service-Worker-Allowed", "/");
  res.sendFile(path.join(__dirname, "dist", "sw.js"));
});

app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(__dirname, "dist", "manifest.json"));
});

// ── 2. React dist static files ────────────────────────────────
app.use(express.static(path.join(__dirname, "dist")));


// ── 3. API routes ─────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/investment-plans", investmentPlanRoutes);

// ── 4. Catch-all for React Router (MUST be last) ─────────────
// Note: removed the app.get('/') JSON response — it was
// conflicting with React Router's index page
app.get("*", (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] DEBUG: Catch-all route hit for: ${req.path}`);
  
  // Define static file extensions that should NOT be handled by React Router
  const staticFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.css', '.js', '.json', '.txt', '.pdf'];
  const hasStaticExtension = staticFileExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
  
  if (hasStaticExtension) {
    console.log(`[${timestamp}] DEBUG: Static file request in catch-all, returning 404: ${req.path}`);
    return res.status(404).send("Static file not found");
  }
  
  console.log(`[${timestamp}] DEBUG: Serving React app for: ${req.path}`);
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ── Error Handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
