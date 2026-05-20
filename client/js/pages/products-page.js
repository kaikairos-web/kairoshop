document.addEventListener('DOMContentLoaded', async () => {
  Components.injectPublicLayout();
  const params = new URLSearchParams(window.location.search);
  const searchInput = document.getElementById('global-search');
  if (searchInput && params.get('search')) searchInput.value = params.get('search');

  const grid = document.getElementById('products-grid');
  const catContainer = document.getElementById('product-categories');
  let activeCategory = params.get('category') || 'All';

  Products.renderCategories(catContainer, activeCategory, async (cat) => {
    activeCategory = cat;
    await loadProducts();
  });

  async function loadProducts() {
    grid.innerHTML = UI.skeletonGrid(6);
    const query = {};
    if (activeCategory !== 'All') query.category = activeCategory;
    if (params.get('search')) query.search = params.get('search');
    try {
      const products = await Products.load(query);
      Products.renderGrid(products, grid);
    } catch (err) {
      grid.innerHTML = `<p class="text-muted">${err.message}</p>`;
    }
  }

  await loadProducts();
});


