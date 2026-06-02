/**
 * ui.js - UI Component Builder
 * ==============================
 * Developed by: Pranav Vaidhya
 * Renders all HTML components dynamically
 */

const UI = (() => {

  // ── HELPERS ──────────────────────────────────────────

  /** Format price in Indian Rupees */
  function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  }

  /** Generate star rating HTML */
  function stars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  /** Get badge class based on badge text */
  function badgeClass(badge) {
    if (!badge) return '';
    const map = { 'Best Seller': 'badge-best', 'Hot': 'badge-hot', 'New': 'badge-new', 'Top Rated': 'badge-top', 'Eco': 'badge-eco', 'Smart': 'badge-smart', 'Premium': 'badge-premium' };
    return map[badge] || 'badge-new';
  }

  // ── LOADING ──────────────────────────────────────────

  function loading(message = 'Loading...') {
    return `<div class="loading-wrap" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p style="color:var(--text-2);font-size:0.9rem">${message}</p>
    </div>`;
  }

  // ── PRODUCT CARD ─────────────────────────────────────

  /**
   * Render a single product card
   * @param {Object} product
   * @returns {string} HTML string
   */
  function productCard(product) {
    const wishlisted = ProductStore.isWishlisted(product.id);
    return `
    <article class="product-card" data-id="${product.id}" aria-label="${product.title}">
      <div class="product-img-wrap">
        <img
          class="product-img"
          src="${product.image}"
          alt="${product.title}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=400&fit=crop'"
        />
        ${product.badge ? `<span class="product-badge ${badgeClass(product.badge)}">${product.badge}</span>` : ''}
        <button class="wishlist-btn ${wishlisted ? 'active' : ''}" data-wishlist="${product.id}" aria-label="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}" title="Wishlist">
          ${wishlisted ? '♥' : '♡'}
        </button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <div class="product-rating" aria-label="Rating: ${product.rating} out of 5, ${product.reviews} reviews">
          <span class="stars" aria-hidden="true">${stars(product.rating)}</span>
          <span style="color:var(--warning);font-weight:600">${product.rating}</span>
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            ${formatPrice(product.price)}
            <span>/ piece</span>
          </div>
          <button class="add-cart-btn" data-cart="${product.id}" aria-label="Add ${product.title} to cart">
            + Cart
          </button>
        </div>
      </div>
    </article>`;
  }

  // ── PRODUCTS GRID ────────────────────────────────────

  /**
   * Render the full products section with toolbar, grid, and pagination
   */
  function productsSection(title, products, pagination, categories, showFilters = true) {
    const catOptions = ['All', ...Object.keys(categories)].map(c =>
      `<option value="${c}">${c}</option>`
    ).join('');

    const paginationHTML = pagination.pages > 1 ? `
    <nav class="pagination" aria-label="Product pages">
      <button class="page-btn" data-page="${pagination.current - 1}" ${pagination.current <= 1 ? 'disabled' : ''} aria-label="Previous page">&#8592;</button>
      ${Array.from({ length: pagination.pages }, (_, i) => `
        <button class="page-btn ${i + 1 === pagination.current ? 'active' : ''}" data-page="${i + 1}" aria-label="Page ${i + 1}" aria-current="${i + 1 === pagination.current ? 'page' : 'false'}">${i + 1}</button>
      `).join('')}
      <button class="page-btn" data-page="${pagination.current + 1}" ${pagination.current >= pagination.pages ? 'disabled' : ''} aria-label="Next page">&#8594;</button>
    </nav>` : '';

    const gridHTML = products.length === 0
      ? `<div class="empty-state"><div class="empty-icon">&#128269;</div><h3>No products found</h3><p>Try adjusting your search or filters</p></div>`
      : `<div class="products-grid" id="productsGrid" role="list" aria-label="Products">${products.map(p => productCard(p)).join('')}</div>`;

    return `
    <section class="section" aria-labelledby="products-heading">
      <div class="container">
        <h2 id="products-heading" class="section-title">${title}</h2>
        <p class="section-subtitle">${pagination.total} products available</p>
        ${showFilters ? `
        <div class="products-toolbar" role="toolbar" aria-label="Product filters and sorting">
          <div class="toolbar-left">
            <select class="filter-select" id="categoryFilter" aria-label="Filter by category">
              ${catOptions}
            </select>
            <select class="filter-select" id="sortFilter" aria-label="Sort products">
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div class="toolbar-right">
            <span class="results-count" aria-live="polite">${pagination.total} results</span>
          </div>
        </div>` : ''}
        ${gridHTML}
        ${paginationHTML}
      </div>
    </section>`;
  }

  // ── PRODUCT DETAIL ───────────────────────────────────

  function productDetail(product) {
    const wishlisted = ProductStore.isWishlisted(product.id);
    return `
    <div class="product-detail">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb" style="font-size:0.82rem;color:var(--text-3);margin-bottom:32px;display:flex;gap:8px;align-items:center">
          <a href="#/" data-route="/" style="color:var(--text-2)">Home</a> /
          <a href="#/products" data-route="/products" style="color:var(--text-2)">Products</a> /
          <span style="color:var(--text-1)">${product.title}</span>
        </nav>
        <div class="detail-grid">
          <div class="detail-img-wrap">
            <img class="detail-img" src="${product.image}" alt="${product.title}" loading="lazy" />
          </div>
          <div class="detail-info">
            <p class="detail-category">${product.category}</p>
            <h1 class="detail-title">${product.title}</h1>
            <div class="detail-rating" aria-label="${product.rating} out of 5 stars">
              <span class="stars" style="color:var(--warning);font-size:1.1rem" aria-hidden="true">${stars(product.rating)}</span>
              <strong>${product.rating}</strong>
              <span style="color:var(--text-3);font-size:0.875rem">(${product.reviews} reviews)</span>
            </div>
            <p class="detail-price" aria-label="Price: ${formatPrice(product.price)}">${formatPrice(product.price)}</p>
            <p class="detail-desc">${product.description}</p>
            <div class="detail-actions">
              <button class="btn btn-primary" data-cart="${product.id}" aria-label="Add ${product.title} to cart" style="font-size:1rem;padding:14px 28px">
                &#128722; Add to Cart
              </button>
              <button class="btn btn-ghost ${wishlisted ? 'active' : ''}" data-wishlist="${product.id}" aria-label="${wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}" style="font-size:1rem">
                ${wishlisted ? '&#9829;' : '&#9825;'} Wishlist
              </button>
            </div>
            <div class="detail-meta">
              <div class="meta-item"><span class="meta-icon">&#10003;</span> In Stock — Ready to ship</div>
              <div class="meta-item"><span class="meta-icon">&#128666;</span> Free delivery over ₹999</div>
              <div class="meta-item"><span class="meta-icon">&#8635;</span> 30-day easy returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ── CART PAGE ────────────────────────────────────────

  function cartPage(cartItems, total) {
    if (cartItems.length === 0) {
      return `<div class="cart-page"><div class="container">
        <h1 class="section-title" style="margin-bottom:40px">Shopping Cart</h1>
        <div class="empty-state">
          <div class="empty-icon">&#128722;</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started</p>
          <a href="#/products" data-route="/products" class="btn btn-primary" style="margin-top:16px">Browse Products</a>
        </div>
      </div></div>`;
    }
    const itemsHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="cart-item-info" style="flex:1">
          <p class="cart-item-title">${item.title}</p>
          <p class="cart-item-cat">${item.category}</p>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
        </div>
        <div class="qty-controls" aria-label="Quantity controls for ${item.title}">
          <button class="qty-btn" data-qty-minus="${item.id}" aria-label="Decrease quantity">-</button>
          <span class="qty-num" aria-label="Quantity: ${item.qty}">${item.qty}</span>
          <button class="qty-btn" data-qty-plus="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <button class="remove-btn" data-remove="${item.id}" aria-label="Remove ${item.title} from cart">&#10005;</button>
      </div>`).join('');

    return `<div class="cart-page"><div class="container">
      <h1 class="section-title" style="margin-bottom:40px">Shopping Cart</h1>
      <div class="cart-grid">
        <div class="cart-items" role="list" aria-label="Cart items">${itemsHTML}</div>
        <aside class="cart-summary" aria-label="Order summary">
          <h2 class="summary-title">Order Summary</h2>
          <div class="summary-row"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
          <div class="summary-row"><span>Delivery</span><span style="color:var(--success)">Free</span></div>
          <div class="summary-row"><span>Discount</span><span style="color:var(--success)">-${formatPrice(Math.round(total * 0.05))}</span></div>
          <div class="summary-row total"><span>Total</span><span style="color:var(--accent)">${formatPrice(total - Math.round(total * 0.05))}</span></div>
          <button class="btn btn-primary checkout-btn" id="checkoutBtn" aria-label="Proceed to checkout">Proceed to Checkout &#8594;</button>
          <a href="#/products" data-route="/products" class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:10px">Continue Shopping</a>
        </aside>
      </div>
    </div></div>`;
  }

  // ── WISHLIST PAGE ────────────────────────────────────

  function wishlistPage(items) {
    if (items.length === 0) {
      return `<div class="wishlist-page"><div class="container">
        <h1 class="section-title" style="margin-bottom:40px">My Wishlist</h1>
        <div class="empty-state">
          <div class="empty-icon">&#9825;</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love for later</p>
          <a href="#/products" data-route="/products" class="btn btn-primary" style="margin-top:16px">Explore Products</a>
        </div>
      </div></div>`;
    }
    return `<div class="wishlist-page"><div class="container">
      <h1 class="section-title" style="margin-bottom:8px">My Wishlist</h1>
      <p class="section-subtitle">${items.length} saved item${items.length !== 1 ? 's' : ''}</p>
      <div class="products-grid" role="list">${items.map(p => productCard(p)).join('')}</div>
    </div></div>`;
  }

  // ── CATEGORIES PAGE ──────────────────────────────────

  function categoriesPage(categories) {
    const catIcons = { Electronics: '&#127909;', Fashion: '&#128084;', 'Home & Garden': '&#127968;', Sports: '&#9917;', Stationery: '&#128221;' };
    const cards = Object.entries(categories).map(([name, count]) => `
      <div class="category-card" data-cat-navigate="${name}" role="button" tabindex="0" aria-label="Browse ${name} - ${count} products">
        <span class="cat-icon" aria-hidden="true">${catIcons[name] || '&#128722;'}</span>
        <h3 class="cat-name">${name}</h3>
        <p class="cat-count">${count} products</p>
      </div>`).join('');
    return `<section class="section"><div class="container">
      <h1 class="section-title">All Categories</h1>
      <p class="section-subtitle">Explore our product categories</p>
      <div class="categories-grid" role="list" aria-label="Product categories">${cards}</div>
    </div></section>`;
  }

  // ── ABOUT PAGE ───────────────────────────────────────

  function aboutPage() {
    return `<div>
      <div class="about-hero section" style="text-align:center">
        <div class="container">
          <h1 class="section-title">About <span style="color:var(--accent)">ShopVault</span></h1>
          <p style="color:var(--text-2);max-width:600px;margin:0 auto;font-size:1.05rem;line-height:1.8">
            ShopVault is a modern e-commerce product catalog built as an internship capstone project. It demonstrates full-stack frontend architecture, client-side routing, modular JavaScript design, and production-ready deployment.
          </p>
        </div>
      </div>
      <section class="section" style="padding-top:0"><div class="container">
        <div class="about-grid">
          <div class="about-card"><div class="about-card-icon">&#128296;</div><h3>Modular Architecture</h3><p>Organized into separate modules — router.js, products.js, ui.js, app.js — for clean, maintainable code.</p></div>
          <div class="about-card"><div class="about-card-icon">&#128260;</div><h3>Client-Side Routing</h3><p>SPA-style navigation using hash-based routing. No page refresh. Dynamic URL patterns for product details.</p></div>
          <div class="about-card"><div class="about-card-icon">&#9889;</div><h3>Performance First</h3><p>Lazy-loaded images, efficient DOM updates, localStorage caching, and optimized asset structure.</p></div>
          <div class="about-card"><div class="about-card-icon">&#128241;</div><h3>Responsive Design</h3><p>Mobile-first CSS with Grid, Flexbox, and media queries. Works flawlessly from 320px to 4K screens.</p></div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);padding:40px;text-align:center">
          <h2 style="font-family:'Syne',sans-serif;margin-bottom:12px">Developed by <span style="color:var(--accent)">Pranav Vaidhya</span></h2>
          <p style="color:var(--text-2)">Frontend Developer Intern · HTML · CSS · JavaScript · Full-Stack Architecture</p>
          <a href="https://github.com/pranavvaidhya" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:20px">View GitHub Profile</a>
        </div>
      </div></section>
    </div>`;
  }

  // ── CONTACT PAGE ─────────────────────────────────────

  function contactPage() {
    return `<div class="contact-page"><div class="container">
      <div class="contact-grid">
        <div class="contact-info">
          <h2>Get In Touch</h2>
          <p>Have questions about ShopVault? I'd love to hear from you. Send a message and I'll respond as soon as possible.</p>
          <div class="contact-detail"><span>&#128231;</span> pranav@example.com</div>
          <div class="contact-detail"><span>&#128205;</span> India</div>
          <div class="contact-detail"><span>&#128101;</span> github.com/pranavvaidhya</div>
        </div>
        <form class="contact-form" id="contactForm" novalidate aria-label="Contact form">
          <h3 style="font-family:'Syne',sans-serif;margin-bottom:20px">Send a Message</h3>
          <div class="form-group">
            <label for="cf-name" class="form-label">Name <span style="color:var(--error)" aria-label="required">*</span></label>
            <input type="text" id="cf-name" class="form-input" placeholder="Your name" required aria-required="true" />
          </div>
          <div class="form-group">
            <label for="cf-email" class="form-label">Email <span style="color:var(--error)" aria-label="required">*</span></label>
            <input type="email" id="cf-email" class="form-input" placeholder="your@email.com" required aria-required="true" />
          </div>
          <div class="form-group">
            <label for="cf-msg" class="form-label">Message <span style="color:var(--error)" aria-label="required">*</span></label>
            <textarea id="cf-msg" class="form-input" rows="5" placeholder="Your message..." required aria-required="true"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">Send Message</button>
        </form>
      </div>
    </div></div>`;
  }

  // ── TOAST ────────────────────────────────────────────

  /**
   * Show a toast notification
   * @param {string} message - Message text
   * @param {'success'|'error'|'info'} type
   * @param {number} duration - ms to show (default 3000)
   */
  function showToast(message, type = 'success', duration = 3000) {
    const icons = { success: '&#10003;', error: '&#9888;', info: '&#9432;' };
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span aria-hidden="true">${icons[type]}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'none';
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return {
    loading, productCard, productsSection, productDetail,
    cartPage, wishlistPage, categoriesPage, aboutPage, contactPage,
    showToast, formatPrice
  };
})();
