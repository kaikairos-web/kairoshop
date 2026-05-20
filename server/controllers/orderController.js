const { supabaseAdmin } = require('../config/supabase');

async function checkout(req, res) {
  try {
    const { shipping_address } = req.body;

    const { data: cartItems, error: cartError } = await req.supabase
      .from('cart_items')
      .select(`quantity, product:products (id, name, price, stock)`)
      .eq('user_id', req.user.id);

    if (cartError) return res.status(400).json({ error: cartError.message });
    if (!cartItems?.length) return res.status(400).json({ error: 'Cart is empty' });

    for (const item of cartItems) {
      if (!item.product || item.quantity > item.product.stock) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.product?.name || 'product'}`,
        });
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const { data: order, error: orderError } = await req.supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        total_price: total,
        status: 'pending',
        payment_status: 'paid',
        shipping_address: shipping_address || '',
      })
      .select()
      .single();

    if (orderError) return res.status(400).json({ error: orderError.message });

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await req.supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return res.status(400).json({ error: itemsError.message });
    }

    for (const item of cartItems) {
      await supabaseAdmin
        .from('products')
        .update({ stock: item.product.stock - item.quantity })
        .eq('id', item.product.id);
    }

    await req.supabase.from('cart_items').delete().eq('user_id', req.user.id);

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrders(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const baseSelect = `
      *,
      order_items (id, quantity, price, product:products (id, name, image_url))
    `;
    const adminSelect = `
      *,
      user:users (id, full_name, email),
      order_items (id, quantity, price, product:products (id, name, image_url))
    `;

    const isAdmin = req.profile.role === 'admin';
    let query = isAdmin
      ? supabaseAdmin.from('orders').select(adminSelect, { count: 'exact' }).order('created_at', { ascending: false })
      : req.supabase.from('orders').select(baseSelect, { count: 'exact' }).eq('user_id', req.user.id).order('created_at', { ascending: false });

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({
      orders: data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrder(req, res) {
  try {
    const isAdmin = req.profile.role === 'admin';
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users (id, full_name, email),
        order_items (id, quantity, price, product:products (id, name, image_url))
      `)
      .eq('id', req.params.id)
      .single();

    const { data: order, error } = await query;
    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    if (!isAdmin && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status, payment_status } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ order: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cancelOrder(req, res) {
  try {
    const isAdmin = req.profile.role === 'admin';
    let query = supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', req.params.id);

    const { data: order, error } = await query.single();
    if (error || !order) return res.status(404).json({ error: 'Order not found' });

    if (!isAdmin && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    for (const item of order.order_items || []) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();
      if (product) {
        await supabaseAdmin
          .from('products')
          .update({ stock: product.stock + item.quantity })
          .eq('id', item.product_id);
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'refunded' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ error: updateError.message });
    res.json({ order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { checkout, getOrders, getOrder, updateOrderStatus, cancelOrder };

