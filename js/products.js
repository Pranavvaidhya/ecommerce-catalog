/**
 * products.js - Product Data & State Manager
 * ===========================================
 * Developed by: Pranav Vaidhya
 * Handles product loading, filtering, sorting, cart, wishlist
 */

const ProductStore = (() => {
  // App State
  let allProducts = [];
  let filteredProducts = [];
  let cart = JSON.parse(localStorage.getItem('shopvault_cart') || '[]');
  let wishlist = JSON.parse(localStorage.getItem('shopvault_wishlist') || '[]');

  const PRODUCTS_PER_PAGE = 8;
  let currentPage = 1;
  let currentCategory = 'All';
  let currentSort = 'default';
  let currentSearch = '';

  // ── LOAD PRODUCTS ──────────────────────────────────────

  /**
   * Load products from local JSON file using fetch + async/await
   * @returns {Promise<Array>} Array of product objects
   */
  async function loadProducts() {
    if (allProducts.length > 0) return allProducts;
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) throw new Error('Failed to load products');
      allProducts = await response.json();
      filteredProducts = [...allProducts];
      return allProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  // ── FILTER & SORT ──────────────────────────────────────

  /**
   * Apply current filters, search, and sort to products
   */
  function applyFilters() {
    let result = [...allProducts];

    // Filter by category
    if (currentCategory !== 'All') {
      result = result.filter(p => p.category === currentCategory);
    }

    // Filter by search query
    if (currentSearch.trim()) {
      const query = currentSearch.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (currentSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    filteredProducts = result;
    currentPage = 1;
    return filteredProducts;
  }

  /**
   * Get paginated slice of filtered products
   * @param {number} page - Page number (1-indexed)
   * @returns {Object} { products, total, pages, current }
   */
  function getPage(page = 1) {
    currentPage = page;
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return {
      products: filteredProducts.slice(start, end),
      total: filteredProducts.length,
      pages: Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
      current: page
    };
  }

  /**
   * Get a single product by ID
   * @param {number|string} id
   */
  function getById(id) {
    return allProducts.find(p => p.id === parseInt(id));
  }

  /**
   * Get all unique categories with counts
   */
  function getCategories() {
    const cats = {};
    allProducts.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + 1;
    });
    return cats;
  }

  // ── CART ──────────────────────────────────────────────

  function addToCart(productId) {
    const product = getById(productId);
    if (!product) return false;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    updateBadges();
    return true;
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateBadges();
  }

  function updateQty(productId, qty) {
    if (qty < 1) { removeFromCart(productId); return; }
    const item = cart.find(i => i.id === productId);
    if (item) { item.qty = qty; saveCart(); }
  }

  function getCart() { return cart; }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateBadges();
  }

  function saveCart() {
    localStorage.setItem('shopvault_cart', JSON.stringify(cart));
  }

  // ── WISHLIST ──────────────────────────────────────────

  function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    if (idx > -1) {
      wishlist.splice(idx, 1);
    } else {
      wishlist.push(productId);
    }
    localStorage.setItem('shopvault_wishlist', JSON.stringify(wishlist));
    updateBadges();
    return wishlist.includes(productId);
  }

  function isWishlisted(productId) {
    return wishlist.includes(productId);
  }

  function getWishlist() {
    return allProducts.filter(p => wishlist.includes(p.id));
  }

  function getWishlistCount() { return wishlist.length; }

  // ── BADGES ────────────────────────────────────────────

  function updateBadges() {
    const cartBadge = document.getElementById('cartBadge');
    const wishlistBadge = document.getElementById('wishlistBadge');
    const count = getCartCount();
    const wCount = getWishlistCount();
    if (cartBadge) cartBadge.textContent = count;
    if (wishlistBadge) wishlistBadge.textContent = wCount;
  }

  // ── SETTERS ───────────────────────────────────────────

  function setCategory(cat) { currentCategory = cat; }
  function setSort(sort) { currentSort = sort; }
  function setSearch(q) { currentSearch = q; }
  function getSearch() { return currentSearch; }
  function getCurrentPage() { return currentPage; }

  return {
    loadProducts, applyFilters, getPage, getById, getCategories,
    addToCart, removeFromCart, updateQty, getCart, getCartTotal,
    getCartCount, clearCart,
    toggleWishlist, isWishlisted, getWishlist, getWishlistCount,
    updateBadges, setCategory, setSort, setSearch, getSearch, getCurrentPage
  };
})();
