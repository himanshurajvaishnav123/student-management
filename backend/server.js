/**
 * server.js — Express entry point
 *
 * CHANGES FROM ORIGINAL:
 *  1. Removed the inline mongoose.connect() block — DB connection is now
 *     handled entirely by config/db.js (single source of truth).
 *  2. Removed the localhost fallback URI: 'mongodb://localhost:27017/student_management'
 *     That was the root cause of the Render ECONNREFUSED error.
 *  3. PORT now comes ONLY from process.env.PORT (Render injects this at runtime).
 *     The || 5000 fallback is kept for local development only.
 *  4. CORS origin is driven by process.env.CLIENT_URL — set this in Render to
 *     your Vercel frontend URL (e.g. https://your-app.vercel.app).
 *     Locally it falls back to http://localhost:5173 (Vite default).
 *  5. Added environment-validation startup log so you can see all config values
 *     in Render's log stream without exposing secrets.
 *  6. Added connectDB import and await before app.listen so the server only
 *     accepts traffic after the DB is actually ready.
 */

const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const connectDB = require('./config/db');  // centralised DB logic

// Load .env (local dev). On Render these vars are set in the dashboard.
dotenv.config();

// ─── Environment validation (non-secret values only) ─────────────────────────
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `❌  Missing required environment variables: ${missingVars.join(', ')}\n` +
    '    Add them in Render → your service → Environment.'
  );
  process.exit(1);
}

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// CLIENT_URL must be set in Render to your Vercel deployment URL.
// Multiple origins are supported — add them as comma-separated values in the env var.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/students',      require('./routes/studentRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ─── Health check (useful for Render's health-check URL setting) ───────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'OK',
    message:   'SMS API is running',
    timestamp: new Date(),
    env:       process.env.NODE_ENV || 'development',
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Start: connect DB first, then listen ─────────────────────────────────────
// PORT is injected by Render at runtime. Never hardcode a port for production.
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB(); // will process.exit(1) on failure — no need to handle errors here

  app.listen(PORT, () => {
    console.log('─────────────────────────────────────────');
    console.log(`🚀  Server started`);
    console.log(`    PORT      : ${PORT}`);
    console.log(`    NODE_ENV  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`    CLIENT_URL: ${allowedOrigins.join(', ')}`);
    console.log('─────────────────────────────────────────');
  });
})();