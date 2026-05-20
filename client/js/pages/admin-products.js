document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;
  document.getElementById('admin-sidebar').innerHTML = Components.adminSidebar('Products');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Products');
  Components.bindGlobalEvents();
  UI.initSidebar();

  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');

  document.getElementById('btn-add-product').addEventListener('click', () => {
    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-image').value = '';
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('image-preview-wrap').style.display = 'none';
    UI.openModal('product-modal');
  });

  // Live preview when file selected
  document.getElementById('product-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const wrap = document.getElementById('image-preview-wrap');
    const preview = document.getElementById('image-preview');
    if (file) {
      preview.src = URL.createObjectURL(file);
      wrap.style.display = 'block';
    } else {
      wrap.style.display = 'none';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const body = {
      name: document.getElementById('product-name').value,
      description: document.getElementById('product-desc').value,
      category: document.getElementById('product-category').value,
      price: document.getElementById('product-price').value,
      stock: document.getElementById('product-stock').value,
      rating: document.getElementById('product-rating').value,
      image_url: document.getElementById('product-image').value || null,
    };

    const file = document.getElementById('product-file').files[0];
    if (file) {
      const fd = new FormData();
      fd.append('image', file);
      try {
        const up = await API.upload('/products/upload', fd);
        body.image_url = up.image_url;
      } catch (err) {
        UI.toast('Image upload failed: ' + err.message, 'error');
      }
    }

    try {
      if (id) await API.put(`/products/${id}`, body);
      else await API.post('/products', body);
      UI.toast('Product saved');
      UI.closeModal('product-modal');
      loadProducts();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });

  await loadProducts();
});

async function loadProducts() {
  const el = document.getElementById('admin-products-table');
  try {
    const { products } = await API.get('/products');
    el.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
        <tbody>
          ${products.map((p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${UI.formatPrice(p.price)}</td>
              <td>${p.stock}</td>
              <td>${p.rating}</td>
              <td>
                <button class="btn btn-sm btn-ghost btn-edit" data-id="${p.id}">Edit</button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${p.id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    el.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const { product: p } = await API.get(`/products/${btn.dataset.id}`);
        document.getElementById('product-id').value = p.id;
        document.getElementById('product-name').value = p.name;
        document.getElementById('product-desc').value = p.description || '';
        document.getElementById('product-category').value = p.category;
        document.getElementById('product-price').value = p.price;
        document.getElementById('product-stock').value = p.stock;
        document.getElementById('product-rating').value = p.rating;
        document.getElementById('product-image').value = p.image_url || '';
        // Show existing image preview
        const wrap = document.getElementById('image-preview-wrap');
        const preview = document.getElementById('image-preview');
        if (p.image_url) {
          preview.src = p.image_url;
          wrap.style.display = 'block';
        } else {
          wrap.style.display = 'none';
        }
        document.getElementById('modal-title').textContent = 'Edit Product';
        UI.openModal('product-modal');
      });
    });

    el.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this product?')) return;
        try {
          await API.delete(`/products/${btn.dataset.id}`);
          UI.toast('Product deleted');
          loadProducts();
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="text-muted">${err.message}</p>`;
  }
}

