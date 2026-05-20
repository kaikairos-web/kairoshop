require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

const isConfigured = Boolean(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_ANON_KEY
);

if (!isConfigured) {
  console.warn('Warning: Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

module.exports = { supabaseAdmin, createUserClient, supabaseUrl, supabaseAnonKey, isConfigured };
