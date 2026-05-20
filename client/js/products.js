const Products = {
  categories: ['All', 'Bike Frames', 'Tires', 'Chains', 'Helmets', 'Brakes', 'Accessories'],

  async load(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const data = await API.get(`/products${qs ? '?' + qs : ''}`);
    return data.products || [];
  },

  async getOne(id) {
    const data = await API.get(`/products/${id}`);
    return data.product;
  },

  renderGrid(products, container) {
    if (!products.length) {
      container.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:3rem">No products found.</p>';
      return;
    }
    container.innerHTML = products.map((p) => Components.productCard(p)).join('');
    Cart.bindProductButtons(container);
  },

  renderCategories(container, active = 'All', onSelect) {
    container.innerHTML = this.categories
      .map(
        (cat) =>
          `<button class="category-chip ${cat === active ? 'active' : ''}" data-category="${cat}">${cat}</button>`
      )
      .join('');

    container.querySelectorAll('.category-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.category-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        onSelect(chip.dataset.category);
      });
    });
  },
};


