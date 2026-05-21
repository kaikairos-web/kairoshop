document.addEventListener('DOMContentLoaded', async () => {
  Components.injectPublicLayout();

  // Cycling hero text
  const cycleEl = document.getElementById('hero-cycle');
  if (cycleEl) {
    const phrases = [
      'Premium Bike Frames',
      'High-Performance Tires',
      'Precision Chains',
      'Pro-Grade Helmets',
      'Powerful Disc Brakes',
      'Essential Accessories',
    ];
    let idx = 0;
    function nextPhrase() {
      cycleEl.classList.remove('cycle-in');
      cycleEl.classList.add('cycle-out');
      setTimeout(() => {
        idx = (idx + 1) % phrases.length;
        cycleEl.textContent = phrases[idx];
        cycleEl.classList.remove('cycle-out');
        cycleEl.classList.add('cycle-in');
      }, 400);
    }
    cycleEl.textContent = phrases[0];
    cycleEl.classList.add('cycle-in');
    setInterval(nextPhrase, 2500);
  }

  const grid = document.getElementById('featured-grid');
  grid.innerHTML = UI.skeletonGrid(4);

  Products.renderCategories(document.getElementById('home-categories'), 'All', (cat) => {
    const q = cat === 'All' ? '' : `?category=${encodeURIComponent(cat)}`;
    window.location.href = `/products.html${q}`;
  });

  try {
    const featured = await Products.load({ featured: 'true', limit: 8 });
    const display = featured.length ? featured : await Products.load({ limit: 8 });
    Products.renderGrid(display, grid);
    initCarousel(display.slice(0, 3));
  } catch (err) {
    grid.innerHTML = `<p class="text-muted">${err.message}. Configure Supabase and run seed.sql.</p>`;
  }
});

function initCarousel(products) {
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');
  if (!products.length) return;

  track.innerHTML = products
    .map(
      (p) => {
        const img = p.image_url || '/assets/placeholder-bike.svg';
        return `
    <div class="carousel-slide" style="background-image:url('${img}')">
      <div class="carousel-slide-bg" style="background-image:url('${img}')"></div>
      <div class="carousel-slide-content">
        <span class="text-cyan">Featured</span>
        <h2 style="margin:0.5rem 0 1rem">${p.name}</h2>
        <p class="text-muted" style="margin-bottom:1rem">${p.description?.slice(0, 120)}...</p>
        <p class="product-price">${UI.formatPrice(p.price)}</p>
        <a href="/product-detail.html?id=${p.id}" class="btn btn-primary" style="margin-top:1rem">View Product</a>
      </div>
      <img src="${img}" alt="${p.name}" onerror="this.src='/assets/placeholder-bike.svg'">
    </div>
  `;
      }
    )
    .join('');

  let current = 0;
  dots.innerHTML = products.map((_, i) => `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></button>`).join('');

  function goTo(i) {
    current = i;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.querySelectorAll('.carousel-dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  dots.querySelectorAll('.carousel-dot').forEach((d) => {
    d.addEventListener('click', () => goTo(parseInt(d.dataset.i, 10)));
  });

  setInterval(() => goTo((current + 1) % products.length), 5000);
}


