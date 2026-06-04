/**
 * config/db.js — MongoDB Atlas Connection
 *
 * CHANGES FROM ORIGINAL:
 *  1. Removed localhost/127.0.0.1 fallback URI — Render has no local MongoDB.
 *  2. Added MONGODB_URI presence check with a clear startup error message.
 *  3. Added connection retry logic (3 attempts, 5-second back-off).
 *  4. Removed deprecated useNewUrlParser / useUnifiedTopology options
 *     (Mongoose 8.x ignores them but emits deprecation noise in logs).
 *  5. Added mongoose connection-event listeners for better Render log visibility.
 */

const mongoose = require('mongoose');

// ─── Helper: sleep ────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Connect with retry ───────────────────────────────────────────────────────
const connectDB = async (retries = 3, delayMs = 5000) => {
  // Guard: fail fast and loud if the env var is missing
  if (!process.env.MONGODB_URI) {
    console.error(
      '❌  MONGODB_URI environment variable is NOT set.\n' +
      '    Add it in your Render dashboard → Environment → MONGODB_URI\n' +
      '    Format: mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority'
    );
    process.exit(1);
  }

  // Warn if the URI still points to localhost (safety net)
  if (/localhost|127\.0\.0\.1/.test(process.env.MONGODB_URI)) {
    console.error(
      '❌  MONGODB_URI appears to be a localhost address — this will not work on Render.\n' +
      '    Replace it with your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`⏳  MongoDB connection attempt ${attempt}/${retries}…`);

      await mongoose.connect(process.env.MONGODB_URI, {
        // serverSelectionTimeoutMS: how long the driver waits to find a server
        serverSelectionTimeoutMS: 10000,
        // socketTimeoutMS: how long an idle socket stays open
        socketTimeoutMS: 45000,
      });

      console.log(`✅  MongoDB Atlas connected: ${mongoose.connection.host}`);
      return; // success — exit the retry loop
    } catch (error) {
      console.error(`❌  MongoDB connection attempt ${attempt} failed: ${error.message}`);

      if (attempt < retries) {
        console.log(`⏳  Retrying in ${delayMs / 1000}s…`);
        await sleep(delayMs);
      } else {
        console.error('❌  All MongoDB connection attempts exhausted. Shutting down.');
        process.exit(1);
      }
    }
  }
};

// ─── Connection-event listeners (visible in Render logs) ─────────────────────
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected — Mongoose will attempt to reconnect automatically.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅  MongoDB reconnected.');
});

module.exports = connectDB;