# ShopVault — E-Commerce Product Catalog

**Task 5 (Capstone): Full-Stack Deployment & Project Architecture**
*Internship Final Project — Pranav Vaidhya*

---

## 📋 Project Overview

ShopVault is a production-ready E-Commerce Product Catalog built with pure HTML5, CSS3, and Vanilla JavaScript. It demonstrates full-stack frontend architecture including modular JS design, client-side SPA routing, dynamic product rendering, cart/wishlist management, and deployment-ready structure.

---

## 🌐 Live Demo

```
https://pranavvaidhya.github.io/ecommerce-catalog
```

---

## 📁 File Structure

```
ecommerce-catalog/
├── index.html          # App shell — navbar, main, footer
├── css/
│   └── style.css       # All styling — dark/light, grid, responsive
├── js/
│   ├── router.js       # Client-side SPA hash router
│   ├── products.js     # Product store — data, cart, wishlist, filters
│   ├── ui.js           # UI component builder — renders all HTML
│   └── app.js          # Main app — routes, events, search, init
├── data/
│   └── products.json   # 16 product records (local JSON)
├── assets/
│   └── (images)
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 SPA Routing | Hash-based client-side routing, no page refresh |
| 🛍️ Product Catalog | 16 products across 5 categories |
| 🔍 Search | Real-time debounced product search |
| 🗂️ Filter | Filter by category |
| ↕️ Sort | Sort by price, name, rating |
| 📄 Pagination | 8 products per page |
| 🛒 Shopping Cart | Add, remove, update qty, order summary |
| ❤️ Wishlist | Save favourite products |
| 🌗 Dark/Light Mode | Theme saved to localStorage |
| 🔔 Toast Notifications | Success, error, info toasts |
| 📱 Responsive | Mobile-first, works on all screens |
| ⚡ Lazy Loading | Images load only when needed |
| ♿ Accessible | ARIA labels, keyboard navigation |

---

## 🛠️ Technologies Used

| Technology | Usage |
|---|---|
| **HTML5** | Semantic app shell structure |
| **CSS3** | Grid, Flexbox, variables, animations |
| **Vanilla JavaScript (ES6+)** | Modules, classes, async/await, localStorage |
| **Fetch API** | Load products.json dynamically |
| **localStorage** | Cart, wishlist, theme persistence |
| **Hash Router** | Client-side SPA navigation |

---

## 🏗️ Architecture Explanation

### Modular Design
The app is split into 4 JavaScript modules:

```
router.js    → Handles URL routing (hash-based SPA)
products.js  → Data layer: load, filter, sort, cart, wishlist
ui.js        → View layer: renders all HTML components
app.js       → Controller: wires routes to views, handles events
```

### Client-Side Routing
```javascript
// Register routes
Router.register('/', homePage);
Router.register('/products', productsPage);
Router.register('/product/:id', productDetailPage); // dynamic!

// Navigate programmatically
Router.navigate('/products');
```

### Data Flow
```
URL Hash Change
    ↓
Router.resolve()
    ↓
Route Handler (app.js)
    ↓
ProductStore.loadProducts() [fetch + async/await]
    ↓
UI.productsSection() [render HTML]
    ↓
attachProductEvents() [delegated listeners]
```

---

## 🚀 How to Run Locally

```bash
# Option 1 — VS Code Live Server (Recommended)
# 1. Open folder in VS Code
# 2. Install Live Server extension
# 3. Right-click index.html → Open with Live Server
# 4. Visit: http://127.0.0.1:5500

# Option 2 — Python server (required for fetch to work)
python -m http.server 8080
# Visit: http://localhost:8080

# NOTE: Must use a server (not direct file://) because
# fetch('data/products.json') requires HTTP protocol
```

---

## 📦 Deployment Guide

### Option 1 — GitHub Pages (Free)
```bash
1. Push all files to GitHub repo: ecommerce-catalog
2. Settings → Pages → Source: Deploy from branch → main
3. Live at: https://pranavvaidhya.github.io/ecommerce-catalog
```

### Option 2 — Netlify (Recommended)
```bash
1. Go to netlify.com → Sign up free
2. Drag & drop project folder onto Netlify dashboard
3. Instant live URL: https://shopvault-pranav.netlify.app
# OR connect GitHub repo for auto-deploy on push
```

### Option 3 — Vercel
```bash
1. Go to vercel.com → Sign up with GitHub
2. Import repository → ecommerce-catalog
3. Deploy → Live at: https://ecommerce-catalog.vercel.app
```

### Option 4 — Render
```bash
1. Go to render.com → New Static Site
2. Connect GitHub repo
3. Build command: (leave empty)
4. Publish directory: ./ (root)
5. Deploy → Live URL provided
```

---

## ⚡ Performance Optimizations

| Optimization | Implementation |
|---|---|
| Lazy loading images | `loading="lazy"` on all img tags |
| Debounced search | 300ms delay prevents excessive re-renders |
| Delegated events | One listener handles all product interactions |
| localStorage cache | Cart and wishlist persist without re-fetching |
| Efficient DOM updates | Only re-renders changed sections, not full page |
| CSS variables | Single theme switch touches all elements |

---

## 🖼️ Screenshots

| Home | Products | Product Detail |
|---|---|---|
| `[home.png]` | `[products.png]` | `[detail.png]` |

| Cart | Wishlist | Mobile |
|---|---|---|
| `[cart.png]` | `[wishlist.png]` | `[mobile.png]` |

---

## 📄 Submission Description

Developed a production-ready E-Commerce Product Catalog SPA using HTML, CSS, and Vanilla JavaScript. Implemented modular frontend architecture with separate router, store, UI, and app modules. Features client-side hash routing, dynamic product rendering from JSON, shopping cart and wishlist with localStorage persistence, real-time search with debouncing, category filtering, price sorting, pagination, dark/light mode, toast notifications, and responsive mobile-first design. Deployed live on GitHub Pages.

---

*Developed with ♥ by **Pranav Vaidhya** — Full-Stack Deployment & Project Architecture Capstone*
