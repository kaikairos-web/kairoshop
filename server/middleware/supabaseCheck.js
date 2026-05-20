const { isConfigured } = require('../config/supabase');

function requireSupabase(req, res, next) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'Supabase is not configured. Copy .env.example to .env and add your credentials.',
    });
  }
  next();
}

module.exports = { requireSupabase };
