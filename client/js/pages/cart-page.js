document.addEventListener('DOMContentLoaded', async () => {
  Components.injectPublicLayout();

  if (!Auth.isLoggedIn()) {
    document.getElementById('cart-items').innerHTML =
      '<p class="text-muted">Please <a href="/login.html?redirect=/cart.html">login</a> to view your cart.</p>';
    document.getElementById('cart-summary').innerHTML = '';
    return;
  }

  await loadCart();
});

async function loadCart() {
  const itemsEl = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  itemsEl.innerHTML = '<div class="skeleton" style="height:120px"></div>';

  try {
    const { items, total } = await Cart.fetch();
    if (!items.length) {
      itemsEl.innerHTML = '<p class="text-muted">Your cart is empty. <a href="/products.html">Browse products</a></p>';
      summaryEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.product?.image_url || '/assets/placeholder-bike.svg'}" alt="">
        <div class="cart-item-info">
          <h3>${item.product?.name}</h3>
          <p class="product-price">${UI.formatPrice(item.product?.price)}</p>
          <div class="qty-control">
            <button class="qty-minus">−</button>
            <span>${item.quantity}</span>
            <button class="qty-plus">+</button>
          </div>
        </div>
        <div>
          <p style="font-weight:600">${UI.formatPrice(item.product?.price * item.quantity)}</p>
          <button class="btn btn-sm btn-danger btn-remove">Remove</button>
        </div>
      </div>
    `
      )
      .join('');

    summaryEl.innerHTML = `
      <h3>Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>${UI.formatPrice(total)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Free</span></div>
      <div class="summary-row total"><span>Total</span><span>${UI.formatPrice(total)}</span></div>
      <a href="/checkout.html" class="btn btn-primary" style="width:100%;margin-top:1rem">Checkout</a>
    `;

    itemsEl.querySelectorAll('.cart-item').forEach((row) => {
      const id = row.dataset.id;
      const qtyEl = row.querySelector('.qty-control span');
      row.querySelector('.qty-minus').addEventListener('click', async () => {
        const q = parseInt(qtyEl.textContent, 10) - 1;
        if (q < 1) await Cart.remove(id);
        else await Cart.update(id, q);
        loadCart();
      });
      row.querySelector('.qty-plus').addEventListener('click', async () => {
        await Cart.update(id, parseInt(qtyEl.textContent, 10) + 1);
        loadCart();
      });
      row.querySelector('.btn-remove').addEventListener('click', async () => {
        await Cart.remove(id);
        loadCart();
      });
    });

    Cart.updateBadge();
  } catch (err) {
    itemsEl.innerHTML = `<p class="text-muted">${err.message}</p>`;
  }
}

