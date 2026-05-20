const Cart = {
  async fetch() {
    if (!Auth.isLoggedIn()) return { items: [], total: 0 };
    return API.get('/cart');
  },

  async add(productId, quantity = 1) {
    if (!Auth.isLoggedIn()) {
      UI.toast('Please login to add items to cart', 'error');
      setTimeout(() => { window.location.href = '/login.html'; }, 1000);
      return;
    }
    await API.post('/cart/add', { product_id: productId, quantity });
    UI.toast('Added to cart');
    this.updateBadge();
  },

  async update(itemId, quantity) {
    await API.put(`/cart/${itemId}`, { quantity });
    UI.toast('Cart updated');
  },

  async remove(itemId) {
    await API.delete(`/cart/remove/${itemId}`);
    UI.toast('Item removed');
  },

  async toggleWishlist(productId) {
    if (!Auth.isLoggedIn()) {
      UI.toast('Please login first', 'error');
      return null;
    }
    const result = await API.post('/cart/wishlist', { product_id: productId });
    UI.toast(result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    return result.wishlisted;
  },

  async updateBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    try {
      if (!Auth.isLoggedIn()) {
        badge.style.display = 'none';
        return;
      }
      const { items } = await this.fetch();
      const count = items?.reduce((s, i) => s + i.quantity, 0) || 0;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    } catch {
      badge.style.display = 'none';
    }
  },

  bindProductButtons(container = document) {
    container.querySelectorAll('.btn-add-cart').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.disabled = true;
        try {
          await Cart.add(btn.dataset.id);
        } catch (err) {
          UI.toast(err.message, 'error');
        } finally {
          btn.disabled = false;
        }
      });
    });

    container.querySelectorAll('.wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          const wishlisted = await Cart.toggleWishlist(btn.dataset.id);
          if (wishlisted !== null) btn.classList.toggle('active', wishlisted);
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    });
  },
};

window.addEventListener('auth-change', () => Cart.updateBadge());


