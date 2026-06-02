/**
 * router.js - Client-Side SPA Router
 * ====================================
 * Developed by: Pranav Vaidhya
 * Handles hash-based navigation without page refresh
 */

const Router = (() => {
  // Route registry: maps path => handler function
  const routes = {};
  let currentPath = '/';

  /**
   * Register a route with its handler
   * @param {string} path - URL path (e.g. '/products')
   * @param {Function} handler - Function to call when route matches
   */
  function register(path, handler) {
    routes[path] = handler;
  }

  /**
   * Navigate to a route programmatically
   * @param {string} path - Path to navigate to
   */
  function navigate(path) {
    window.location.hash = path;
  }

  /**
   * Resolve current hash to a route handler and call it.
   * Handles dynamic routes like /product/5
   */
  function resolve() {
    // Get path from URL hash (remove the #)
    const hash = window.location.hash.slice(1) || '/';
    currentPath = hash;

    // Update active nav link
    updateActiveLink(hash);

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Try exact match first
    if (routes[hash]) {
      routes[hash]();
      return;
    }

    // Try dynamic route match (e.g. /product/5)
    for (const pattern in routes) {
      if (pattern.includes(':')) {
        const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
        const match = hash.match(regex);
        if (match) {
          // Extract param values
          const paramNames = (pattern.match(/:[^/]+/g) || []).map(p => p.slice(1));
          const params = {};
          paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
          routes[pattern](params);
          return;
        }
      }
    }

    // No route found → 404
    if (routes['*']) routes['*']();
  }

  /**
   * Update the active class on navbar links
   * @param {string} currentHash - Current URL hash path
   */
  function updateActiveLink(currentHash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const route = link.getAttribute('data-route');
      link.classList.toggle('active', route === currentHash || (route === '/' && currentHash === '/'));
    });
  }

  /**
   * Initialize the router — listen for hash changes
   */
  function init() {
    window.addEventListener('hashchange', resolve);
    window.addEventListener('load', resolve);
    // Handle data-route link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        const route = link.getAttribute('data-route');
        if (route) navigate(route);
      }
    });
  }

  // Public API
  return { register, navigate, resolve, init };
})();
