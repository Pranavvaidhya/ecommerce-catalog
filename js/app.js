/**
 * app.js - Main Application Entry Point
 * =======================================
 * Developed by: Pranav Vaidhya
 * Wires together Router, ProductStore, and UI
 */

// ── APP ──────────────────────────────────────────────────
const App = (() => {
  const appEl = document.getElementById('app');

  function render(html) {
    appEl.innerHTML = html;
    appEl.focus();
  }

  // ─────────────────────────────────────────
  // ROUTE: HOME
  // ─────────────────────────────────────────
  async function homePage() {
    render(UI.loading('Loading ShopVault...'));
    await ProductStore.loadProducts();
    const categories = ProductStore.getCategories();
    ProductStore.setCategory('All');
    ProductStore.setSort('rating');
    ProductStore.applyFilters();
    const { products } = ProductStore.getPage(1);
    const heroProds = products.slice(0, 4);

    const catCards = Object.entries(categories).map(([name, count]) => {
      const icons = { Electronics: '&#127909;', Fashion: '&#128084;', 'Home & Garden': '&#127968;', Sports: '&#9917;', Stationery: '&#128221;' };
      return `<div class="category-card" data-cat-navigate="${name}" role="button" tabindex="0" aria-label="Browse ${name}">
        <span class="cat-icon" aria-hidden="true">${icons[name] || '&#128722;'}</span>
        <h3 class="cat-name">${name}</h3>
        <p class="cat-count">${count} items</p>
      </div>`;
    }).join('');

    const heroCards = heroProds.map(p => `
      <div class="hero-product-card">
        <img class="hero-card-img" src="${p.image}" alt="${p.title}" loading="lazy" />
        <div class="hero-card-info">
          <p class="hero-card-name">${p.title}</p>
          <p class="hero-card-price">${UI.formatPrice(p.price)}</p>
        </div>
      </div>`).join('');

    const topProducts = products.slice(0, 8).map(p => UI.productCard(p)).join('');

    render(`
    <!-- HERO -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-bg"><div class="hero-orb orb-1"></div><div class="hero-orb orb-2"></div></div>
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <p class="hero-tag">&#10022; New Arrivals 2026</p>
            <h1 id="hero-heading" class="hero-title">Discover Your<br><span>Perfect Style</span></h1>
            <p class="hero-desc">Explore thousands of premium products across electronics, fashion, home decor, sports, and more. Quality you can trust, prices you'll love.</p>
            <div class="hero-cta">
              <a href="#/products" data-route="/products" class="btn btn-primary">Shop Now &#8594;</a>
              <a href="#/categories" data-route="/categories" class="btn btn-ghost">Browse Categories</a>
            </div>
            <div class="hero-stats" role="list" aria-label="Store statistics">
              <div class="hero-stat" role="listitem"><span class="hero-stat-num">500+</span><span class="hero-stat-label">Products</span></div>
              <div class="hero-stat" role="listitem"><span class="hero-stat-num">5K+</span><span class="hero-stat-label">Customers</span></div>
              <div class="hero-stat" role="listitem"><span class="hero-stat-num">4.9</span><span class="hero-stat-label">Rating</span></div>
            </div>
          </div>
          <div class="hero-visual" aria-hidden="true">${heroCards}</div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section" aria-labelledby="cat-heading" style="background:var(--bg-2);padding:clamp(40px,6vw,64px) 0">
      <div class="container">
        <h2 id="cat-heading" class="section-title">Shop by Category</h2>
        <p class="section-subtitle">Find exactly what you're looking for</p>
        <div class="categories-grid">${catCards}</div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="section" aria-labelledby="featured-heading">
      <div class="container">
        <h2 id="featured-heading" class="section-title">Top Rated Products</h2>
        <p class="section-subtitle">Our most loved items this season</p>
        <div class="products-grid" role="list">${topProducts}</div>
        <div style="text-align:center;margin-top:40px">
          <a href="#/products" data-route="/products" class="btn btn-primary">View All Products &#8594;</a>
        </div>
      </div>
    </section>
    `);

    attachProductEvents();
    attachCategoryNavigate();
  }

  // ─────────────────────────────────────────
  // ROUTE: PRODUCTS
  // ─────────────────────────────────────────
  async function productsPage(params = {}) {
    render(UI.loading('Loading products...'));
    await ProductStore.loadProducts();
    const categories = ProductStore.getCategories();

    if (params && params.category) {
      ProductStore.setCategory(params.category);
    }

    ProductStore.applyFilters();
    const pagination = ProductStore.getPage(1);

    render(UI.productsSection('All Products', pagination.products, pagination, categories));
    attachProductEvents();
    attachFilters(categories);
  }

  // ─────────────────────────────────────────
  // ROUTE: PRODUCT DETAIL
  // ─────────────────────────────────────────
  async function productDetailPage(params) {
    render(UI.loading('Loading product...'));
    await ProductStore.loadProducts();
    const product = ProductStore.getById(params.id);

    if (!product) {
      render(`<div class="empty-state" style="padding:100px 24px">
        <div class="empty-icon">&#128269;</div>
        <h3>Product Not Found</h3>
        <p>The product you're looking for doesn't exist</p>
        <a href="#/products" data-route="/products" class="btn btn-primary" style="margin-top:16px">Back to Products</a>
      </div>`);
      return;
    }

    render(UI.productDetail(product));
    attachProductEvents();
  }

  // ─────────────────────────────────────────
  // ROUTE: CATEGORIES
  // ─────────────────────────────────────────
  async function categoriesPage() {
    render(UI.loading());
    await ProductStore.loadProducts();
    const cats = ProductStore.getCategories();
    render(UI.categoriesPage(cats));
    attachCategoryNavigate();
  }

  // ─────────────────────────────────────────
  // ROUTE: CART
  // ─────────────────────────────────────────
  function cartPage() {
    const cart = ProductStore.getCart();
    const total = ProductStore.getCartTotal();
    render(UI.cartPage(cart, total));
    attachCartEvents();
  }

  // ─────────────────────────────────────────
  // ROUTE: WISHLIST
  // ─────────────────────────────────────────
  async function wishlistPage() {
    await ProductStore.loadProducts();
    const items = ProductStore.getWishlist();
    render(UI.wishlistPage(items));
    attachProductEvents();
  }

  // ─────────────────────────────────────────
  // ROUTE: ABOUT
  // ─────────────────────────────────────────
  function aboutPage() {
    render(UI.aboutPage());
  }

  // ─────────────────────────────────────────
  // ROUTE: CONTACT
  // ─────────────────────────────────────────
  function contactPage() {
    render(UI.contactPage());
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('cf-name').value.trim();
        const email = document.getElementById('cf-email').value.trim();
        const msg = document.getElementById('cf-msg').value.trim();
        if (!name || !email || !msg) { UI.showToast('Please fill in all fields', 'error'); return; }
        UI.showToast('Message sent! Thank you, ' + name, 'success');
        form.reset();
      });
    }
  }

  // ─────────────────────────────────────────
  // EVENT: PRODUCT CARD INTERACTIONS
  // ─────────────────────────────────────────
  function attachProductEvents() {
    // Delegated listener on app root
    appEl.addEventListener('click', handleProductClick);

    function handleProductClick(e) {
      // Add to Cart
      const cartBtn = e.target.closest('[data-cart]');
      if (cartBtn) {
        e.preventDefault();
        const id = parseInt(cartBtn.dataset.cart);
        ProductStore.addToCart(id);
        UI.showToast('Added to cart!', 'success');
        // Update badge
        ProductStore.updateBadges();
        return;
      }

      // Wishlist Toggle
      const wishBtn = e.target.closest('[data-wishlist]');
      if (wishBtn) {
        e.preventDefault();
        const id = parseInt(wishBtn.dataset.wishlist);
        const isNowWishlisted = ProductStore.toggleWishlist(id);
        UI.showToast(isNowWishlisted ? 'Added to wishlist!' : 'Removed from wishlist', isNowWishlisted ? 'success' : 'info');
        // Update button appearance
        if (wishBtn.classList.contains('wishlist-btn')) {
          wishBtn.classList.toggle('active', isNowWishlisted);
          wishBtn.innerHTML = isNowWishlisted ? '&#9829;' : '&#9825;';
        }
        ProductStore.updateBadges();
        return;
      }

      // Navigate to product detail on card click (not on buttons)
      const card = e.target.closest('.product-card');
      if (card && !e.target.closest('button')) {
        const id = card.dataset.id;
        Router.navigate('/product/' + id);
        return;
      }
    }
  }

  // ─────────────────────────────────────────
  // EVENT: FILTERS
  // ─────────────────────────────────────────
  function attachFilters(categories) {
    const catFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');

    async function reRender() {
      ProductStore.applyFilters();
      const page = ProductStore.getPage(1);
      const grid = document.getElementById('productsGrid');
      const countEl = document.querySelector('.results-count');
      if (countEl) countEl.textContent = page.total + ' results';
      if (grid) {
        grid.innerHTML = page.products.length === 0
          ? `<div class="empty-state"><div class="empty-icon">&#128269;</div><h3>No products found</h3><p>Try different filters</p></div>`
          : page.products.map(p => UI.productCard(p)).join('');
        // Re-attach events on new cards
        attachProductEvents();
      }
      // Rebuild pagination
      const pag = document.querySelector('.pagination');
      if (pag) {
        if (page.pages <= 1) { pag.innerHTML = ''; return; }
        pag.innerHTML = [
          `<button class="page-btn" data-page="${page.current - 1}" ${page.current <= 1 ? 'disabled' : ''}>&#8592;</button>`,
          ...Array.from({ length: page.pages }, (_, i) =>
            `<button class="page-btn ${i + 1 === page.current ? 'active' : ''}" data-page="${i + 1}">${i + 1}</button>`),
          `<button class="page-btn" data-page="${page.current + 1}" ${page.current >= page.pages ? 'disabled' : ''}>&#8594;</button>`
        ].join('');
        attachPaginationEvents(categories);
      }
    }

    if (catFilter) catFilter.addEventListener('change', () => { ProductStore.setCategory(catFilter.value); reRender(); });
    if (sortFilter) sortFilter.addEventListener('change', () => { ProductStore.setSort(sortFilter.value); reRender(); });
    attachPaginationEvents(categories);
  }

  function attachPaginationEvents(categories) {
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const page = parseInt(btn.dataset.page);
        if (!page || btn.disabled) return;
        const data = ProductStore.getPage(page);
        const grid = document.getElementById('productsGrid');
        if (grid) {
          grid.innerHTML = data.products.map(p => UI.productCard(p)).join('');
          attachProductEvents();
          window.scrollTo({ top: document.getElementById('productsGrid').offsetTop - 80, behavior: 'smooth' });
        }
        // Update active page button
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function attachCategoryNavigate() {
    document.querySelectorAll('[data-cat-navigate]').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.catNavigate;
        ProductStore.setCategory(cat);
        Router.navigate('/products');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') card.click();
      });
    });
  }

  // ─────────────────────────────────────────
  // EVENT: CART INTERACTIONS
  // ─────────────────────────────────────────
  function attachCartEvents() {
    appEl.addEventListener('click', (e) => {
      const plus = e.target.closest('[data-qty-plus]');
      const minus = e.target.closest('[data-qty-minus]');
      const remove = e.target.closest('[data-remove]');
      const checkout = e.target.closest('#checkoutBtn');

      if (plus) {
        const id = parseInt(plus.dataset.qtyPlus);
        const item = ProductStore.getCart().find(i => i.id === id);
        if (item) { ProductStore.updateQty(id, item.qty + 1); cartPage(); }
      }
      if (minus) {
        const id = parseInt(minus.dataset.qtyMinus);
        const item = ProductStore.getCart().find(i => i.id === id);
        if (item) { ProductStore.updateQty(id, item.qty - 1); cartPage(); }
      }
      if (remove) {
        const id = parseInt(remove.dataset.remove);
        ProductStore.removeFromCart(id);
        UI.showToast('Removed from cart', 'info');
        cartPage();
      }
      if (checkout) {
        UI.showToast('Checkout coming soon! This is a frontend demo.', 'info', 4000);
      }
    });
  }

  // ─────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────
  function setupSearch() {
    const searchBtn = document.getElementById('navSearchBtn');
    const searchWrap = document.getElementById('searchBarWrap');
    const searchInput = document.getElementById('globalSearch');
    const searchClose = document.getElementById('searchClose');

    searchBtn.addEventListener('click', () => {
      searchWrap.classList.toggle('hidden');
      if (!searchWrap.classList.contains('hidden')) {
        searchInput.focus();
        searchWrap.setAttribute('aria-hidden', 'false');
      }
    });

    searchClose.addEventListener('click', () => {
      searchWrap.classList.add('hidden');
      searchWrap.setAttribute('aria-hidden', 'true');
      searchInput.value = '';
      ProductStore.setSearch('');
    });

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const q = searchInput.value.trim();
        ProductStore.setSearch(q);
        if (q.length > 1) {
          await ProductStore.loadProducts();
          ProductStore.setCategory('All');
          ProductStore.applyFilters();
          const { products, total } = ProductStore.getPage(1);
          Router.navigate('/products');
          // Small delay to let route render
          setTimeout(() => {
            const grid = document.getElementById('productsGrid');
            const count = document.querySelector('.results-count');
            if (grid) grid.innerHTML = products.map(p => UI.productCard(p)).join('');
            if (count) count.textContent = total + ' results';
            attachProductEvents();
          }, 50);
        }
      }, 300);
    });
  }

  // ─────────────────────────────────────────
  // THEME TOGGLE
  // ─────────────────────────────────────────
  function setupTheme() {
    const saved = localStorage.getItem('shopvault_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeBtn');
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('shopvault_theme', next);
    });
  }

  // ─────────────────────────────────────────
  // HAMBURGER
  // ─────────────────────────────────────────
  function setupHamburger() {
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('navLinks');
    ham.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      ham.classList.toggle('active', open);
      ham.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { nav.classList.remove('open'); ham.classList.remove('active'); ham.setAttribute('aria-expanded', 'false'); });
    });
  }

  // ─────────────────────────────────────────
  // STICKY NAVBAR
  // ─────────────────────────────────────────
  function setupNavbar() {
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', scrollY > 40);
    });
  }

  // ─────────────────────────────────────────
  // INIT - Register routes and start router
  // ─────────────────────────────────────────
  function init() {
    setupTheme();
    setupHamburger();
    setupNavbar();
    setupSearch();
    ProductStore.updateBadges();

    // Register all routes
    Router.register('/', homePage);
    Router.register('/products', productsPage);
    Router.register('/product/:id', productDetailPage);
    Router.register('/categories', categoriesPage);
    Router.register('/cart', cartPage);
    Router.register('/wishlist', wishlistPage);
    Router.register('/about', aboutPage);
    Router.register('/contact', contactPage);
    Router.register('*', () => {
      render(`<div class="empty-state" style="padding:100px 24px">
        <div class="empty-icon">&#128269;</div><h3>404 - Page Not Found</h3>
        <a href="#/" data-route="/" class="btn btn-primary" style="margin-top:16px">Go Home</a>
      </div>`);
    });

    Router.init();
  }

  return { init };
})();

// Start the app
App.init();
