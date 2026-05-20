const { supabaseAdmin } = require('../config/supabase');

async function getCart(req, res) {
  try {
    const { data, error } = await req.supabase
      .from('cart_items')
      .select(`
        id, quantity, created_at,
        product:products (id, name, price, stock, image_url, rating, category)
      `)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    const items = data || [];
    const total = items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    res.json({ items, total: Math.round(total * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addToCart(req, res) {
  try {
    const { product_id, quantity = 1 } = req.body;

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, stock')
      .eq('id', product_id)
      .single();

    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < 1) return res.status(400).json({ error: 'Out of stock' });

    const { data: existing } = await req.supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle();

    let result;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      const { data, error } = await req.supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      result = data;
    } else {
      const { data, error } = await req.supabase
        .from('cart_items')
        .insert({ user_id: req.user.id, product_id, quantity })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      result = data;
    }

    res.status(201).json({ item: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;
    const { data: cartItem } = await req.supabase
      .from('cart_items')
      .select('*, product:products(stock)')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const { data, error } = await req.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeFromCart(req, res) {
  try {
    const { error } = await req.supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getWishlist(req, res) {
  try {
    const { data, error } = await req.supabase
      .from('wishlist')
      .select(`id, product:products (*)`)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ items: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function toggleWishlist(req, res) {
  try {
    const { product_id } = req.body;
    const { data: existing } = await req.supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existing) {
      await req.supabase.from('wishlist').delete().eq('id', existing.id);
      return res.json({ wishlisted: false });
    }

    const { error } = await req.supabase
      .from('wishlist')
      .insert({ user_id: req.user.id, product_id });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ wishlisted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getWishlist,
  toggleWishlist,
};

