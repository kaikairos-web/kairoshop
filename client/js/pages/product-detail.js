document.addEventListener('DOMContentLoaded', async () => {
  Components.injectPublicLayout();
  const id = new URLSearchParams(window.location.search).get('id');
  const root = document.getElementById('product-detail');
  if (!id) {
    root.innerHTML = '<p class="text-muted">Product not found.</p>';
    return;
  }

  root.innerHTML = '<div class="skeleton" style="height:400px"></div>';
  try {
    const p = await Products.getOne(id);
    document.title = `${p.name} — KairoShop`;
    const stock = UI.stockStatus(p.stock);
    root.innerHTML = `
      <img class="product-detail-image glass-card" src="${p.image_url || '/assets/placeholder-bike.svg'}" alt="${p.name}"
        onerror="this.src='https://images.unsplash.com/photo-1485965120181-e220f721d03f?w=600'">
      <div>
        <span class="text-cyan">${p.category}</span>
        <h1 style="margin:0.5rem 0 1rem">${p.name}</h1>
        <div class="product-rating">${UI.stars(p.rating)} <span class="text-muted">${p.rating}</span></div>
        <p class="product-price" style="font-size:2rem;margin:1rem 0">${UI.formatPrice(p.price)}</p>
        <span class="stock-badge ${stock.class}">${stock.text}</span>
        <p class="text-muted" style="margin:1.5rem 0">${p.description || 'No description.'}</p>
        <div class="product-actions" style="margin-top:2rem">
          <button class="btn btn-primary btn-add-cart" data-id="${p.id}" ${p.stock < 1 ? 'disabled' : ''}>Add to Cart</button>
          <button class="wishlist-btn" data-id="${p.id}">${Components.icons.heart}</button>
        </div>
        <a href="/products.html" class="btn btn-ghost" style="margin-top:1rem">← Back to Shop</a>
      </div>
    `;
    Cart.bindProductButtons(root);
  } catch (err) {
    root.innerHTML = `<p class="text-muted">${err.message}</p>`;
  }
});


