require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const { requireSupabase } = require('./middleware/supabaseCheck');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', name: 'KairoShop API' });
});

app.use('/api', requireSupabase);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const filePath = path.join(__dirname, '../client', req.path.endsWith('.html') ? req.path : `${req.path}.html`);
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, '../client/index.html'));
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`KairoShop server running at http://localhost:${PORT}`);
});

