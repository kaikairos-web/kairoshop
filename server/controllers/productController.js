const { supabaseAdmin } = require('../config/supabase');

async function listProducts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    const { category, search, featured } = req.query;
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);
    if (featured === 'true') {
      query = query.gte('rating', 4).limit(8);
    } else {
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({
      products: data,
      pagination: featured === 'true' ? null : {
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

async function getProduct(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, category, price, stock, image_url, rating } = req.body;
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description: description || '',
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        image_url: image_url || null,
        rating: parseFloat(rating) || 0,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ product: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = parseFloat(updates.price);
    if (updates.stock !== undefined) updates.stock = parseInt(updates.stock, 10);
    if (updates.rating !== undefined) updates.rating = parseFloat(updates.rating);
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ product: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileName = `products/${Date.now()}-${req.file.originalname.replace(/\s/g, '-')}`;
    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) return res.status(400).json({ error: error.message });

    const { data: urlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(data.path);
    res.json({ image_url: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};

