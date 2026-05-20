const { supabaseAdmin, createUserClient } = require('../config/supabase');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(401).json({ error: 'User profile not found' });
  }

  if (profile.is_blocked) {
    return res.status(403).json({ error: 'Account has been blocked' });
  }

  req.user = user;
  req.profile = profile;
  req.token = token;
  req.supabase = createUserClient(token);
  next();
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, optionalAuth };

