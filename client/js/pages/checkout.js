document.addEventListener('DOMContentLoaded', async () => {
  Components.injectPublicLayout();
  if (!Auth.requireAuth('/login.html?redirect=/checkout.html')) return;

  const profile = Auth.getProfile();
  document.getElementById('ship-name').value = profile?.full_name || '';

  try {
    const { items, total } = await Cart.fetch();
    if (!items.length) {
      window.location.href = '/cart.html';
      return;
    }
    document.getElementById('checkout-summary').innerHTML = `
      <h3>Order Summary</h3>
      ${items.map((i) => `<div class="summary-row"><span>${i.product?.name} x${i.quantity}</span><span>${UI.formatPrice(i.product?.price * i.quantity)}</span></div>`).join('')}
      <div class="summary-row total"><span>Total</span><span>${UI.formatPrice(total)}</span></div>
    `;
  } catch (err) {
    UI.toast(err.message, 'error');
  }

  document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = `${document.getElementById('ship-name').value}\n${document.getElementById('ship-address').value}\nPhone: ${document.getElementById('ship-phone').value}`;
    try {
      const { order } = await API.post('/orders/checkout', { shipping_address: address });
      UI.toast('Order placed successfully!');
      window.location.href = `/orders.html?order=${order.id}`;
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });
});

