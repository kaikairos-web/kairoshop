const { supabaseAdmin } = require('../config/supabase');

async function register(req, res) {
  try {
    const { email, password, full_name } = req.body;

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { full_name: full_name || '' } },
    });

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({
      message: 'Registration successful. Check your email to confirm if required.',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile?.is_blocked) {
      await supabaseAdmin.auth.signOut();
      return res.status(403).json({ error: 'Account has been blocked' });
    }

    res.json({
      user: data.user,
      session: data.session,
      profile,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function logout(req, res) {
  try {
    const token = req.headers.authorization?.slice(7);
    if (token) {
      await supabaseAdmin.auth.admin.signOut(token, 'local');
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email, redirect_to } = req.body;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: redirect_to || `${req.protocol}://${req.get('host')}/reset-password.html`,
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { access_token, password } = req.body;

    // Verify the recovery token and get the user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(access_token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Update the password using the admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password,
    });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProfile(req, res) {
  res.json({ user: req.user, profile: req.profile });
}

async function updateProfile(req, res) {
  try {
    const { full_name, avatar_url } = req.body;
    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};

