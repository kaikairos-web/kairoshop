const { supabaseAdmin } = require('../config/supabase');

async function getAnalytics(req, res) {
  try {
    const [
      { count: userCount },
      { count: productCount },
      { data: orders },
      { data: products },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total_price, status, payment_status, created_at'),
      supabaseAdmin.from('products').select('id, name, stock, category'),
    ]);

    const totalRevenue = (orders || [])
      .filter((o) => o.status !== 'cancelled' && o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    const pendingOrders = (orders || []).filter((o) => o.status === 'pending').length;
    const lowStock = (products || []).filter((p) => p.stock < 10);

    const salesByMonth = {};
    (orders || []).forEach((o) => {
      if (o.status === 'cancelled') return;
      const month = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      salesByMonth[month] = (salesByMonth[month] || 0) + parseFloat(o.total_price);
    });

    const categoryStats = {};
    (products || []).forEach((p) => {
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    });

    const recentOrders = await supabaseAdmin
      .from('orders')
      .select(`*, user:users (full_name, email)`)
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      analytics: {
        userCount: userCount || 0,
        productCount: productCount || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        orderCount: orders?.length || 0,
        pendingOrders,
        lowStockCount: lowStock.length,
        salesByMonth,
        categoryStats,
        lowStock: lowStock.slice(0, 5),
        recentOrders: recentOrders.data || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const { is_blocked, role } = req.body;
    const updates = {};
    if (is_blocked !== undefined) updates.is_blocked = is_blocked;
    if (role !== undefined && ['user', 'admin'].includes(role)) updates.role = role;

    if (req.params.id === req.user.id && role === 'user') {
      return res.status(400).json({ error: 'Cannot demote yourself' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAnalytics, listUsers, updateUser };

