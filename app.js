// --- APP SEED PRODUCT MANIFEST ---
const PRODUCTS = [
    { id: "PROD-001", name: "Premium Test Widget V2", price: 25.00, category: "Hardware", emoji: "⚙️" },
    { id: "PROD-002", name: "Automated Script Enterprise Token", price: 99.99, category: "Licensing", emoji: "🔑" },
    { id: "PROD-003", name: "Flaky Test Repellent Spray", price: 10.50, category: "Provisions", emoji: "🛡️" },
    { id: "PROD-004", name: "Artisanal Dev Dark Roast Coffee", price: 4.50, category: "Provisions", emoji: "☕" }
];

let currentCategoryFilter = 'All';
let isCatalogLoading = false; // New boolean state flag to fix the deadlock bug properly

let state = {
    isLoggedIn: false,
    cart: [],
    orders: []
};

function loadState() {
    const saved = localStorage.getItem('qa_shop_state_v2');
    if (saved) { state = JSON.parse(saved); }
    render();
    if (state.isLoggedIn) { switchView('shop-view'); }
}

function saveState() {
    localStorage.setItem('qa_shop_state_v2', JSON.stringify(state));
    render();
}

function login(e) {
    e.preventDefault();
    state.isLoggedIn = true;
    saveState();
    switchView('shop-view');
}

function logout() {
    state.isLoggedIn = false;
    state.cart = [];
    isCatalogLoading = false; // reset flag
    saveState();
    switchView('login-view');
}

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }
    saveState();
}

function placeOrder() {
    if (state.cart.length === 0) return;
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder = {
        id: 'SWIFT-' + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleString(),
        items: state.cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        total: total.toFixed(2),
        status: 'Pending'
    };

    state.orders.unshift(newOrder);
    state.cart = [];
    saveState();
    switchView('orders-view');
    
    const trackingId = newOrder.id;
    setTimeout(() => {
        const currentSaved = JSON.parse(localStorage.getItem('qa_shop_state_v2'));
        if (currentSaved) {
            const target = currentSaved.orders.find(o => o.id === trackingId);
            if (target && target.status === 'Pending') {
                target.status = 'Confirmed';
                localStorage.setItem('qa_shop_state_v2', JSON.stringify(currentSaved));
                loadState();
            }
        }
    }, 5000);
}

function cancelOrder(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Cancelled';
        saveState();
    }
}

// --- FIXED QA INJECTOR OPERATIONS ---
function injectDynamicPromoItem() {
    // If it was artificially loading, snap out of it so user can see injection
    isCatalogLoading = false; 
    
    const randomId = 'PROD-DYN-' + Math.floor(1000 + Math.random() * 9000);
    const dynamicOptions = [
        { name: "✨ Quantum Memory Leak Patch", price: 149.99, category: "Licensing", emoji: "🔮" },
        { name: "💥 Hardware Bug-Smasher Mallet", price: 19.95, category: "Hardware", emoji: "🔨" }
    ];
    const selected = dynamicOptions[Math.floor(Math.random() * dynamicOptions.length)];
    PRODUCTS.push({ id: randomId, ...selected });
    render();
}

function triggerDynamicPriceFluctuation() {
    if (PRODUCTS.length === 0) return;
    const index = Math.floor(Math.random() * PRODUCTS.length);
    PRODUCTS[index].price = parseFloat((PRODUCTS[index].price * (Math.random() > 0.5 ? 1.20 : 0.80)).toFixed(2));
    render();
}

function loadAsyncCatalogWithDelay(delayMs = 3000) {
    isCatalogLoading = true;
    render(); // render will now display the loading spinner safely based on boolean state

    setTimeout(() => {
        isCatalogLoading = false;
        render(); // clears spinner and renders catalog items automatically
    }, delayMs);
}

function filterCategory(categoryName) {
    currentCategoryFilter = categoryName;
    // Update selection states across sidebar buttons
    const items = document.querySelectorAll('.filter-item');
    items.forEach(el => {
        if (el.textContent.includes(categoryName)) el.classList.add('active');
        else el.classList.remove('active');
    });
    render();
}

function switchView(viewId) {
    if (!state.isLoggedIn) viewId = 'login-view';
    ['login-view', 'shop-view', 'cart-view', 'orders-view'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
    
    // Track current nav link highlighting state 
    const navMap = { 'shop-view': 'nav-shop', 'cart-view': 'nav-cart', 'orders-view': 'nav-orders' };
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (navMap[viewId]) document.getElementById(navMap[viewId]).classList.add('active');
}

// --- DOM TRANSFORMATION CORE ---
function render() {
    if (state.isLoggedIn) {
        document.getElementById('nav').classList.remove('hidden');
        document.getElementById('qa-tools').classList.remove('hidden');
    } else {
        document.getElementById('nav').classList.add('hidden');
        document.getElementById('qa-tools').classList.add('hidden');
    }

    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalItems;

    // Draw Product UI Grid
    const gridBody = document.getElementById('product-grid-body');
    
    if (isCatalogLoading) {
        gridBody.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; font-weight:600; color:var(--primary);" id="loading-spinner">🔄 Querying structural catalog endpoints...</div>`;
    } else {
        const visibleProducts = PRODUCTS.filter(p => currentCategoryFilter === 'All' || p.category === currentCategoryFilter);
        gridBody.innerHTML = visibleProducts.map(p => `
            <div class="product-card" data-id="${p.id}" data-category="${p.category}">
                <div class="product-img">${p.emoji}</div>
                <div class="product-info">
                    <div class="product-name">${p.name}</div>
                    <div class="product-meta">
                        <span class="product-price">$${p.price.toFixed(2)}</span>
                        <button onclick="addToCart('${p.id}')" class="btn btn-primary btn-add-cart" style="padding:6px 12px; font-size:13px;">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Draw Cart Rows
    const cartBody = document.getElementById('cart-table-body');
    if (state.cart.length === 0) {
        cartBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:30px;">Your shopping cart is bare! Add items inside the shop view.</td></tr>`;
        document.getElementById('cart-summary-block').classList.add('hidden');
    } else {
        document.getElementById('cart-summary-block').classList.remove('hidden');
        let accumulatedTotal = 0;
        cartBody.innerHTML = state.cart.map(item => {
            const sub = item.price * item.quantity;
            accumulatedTotal += sub;
            return `
                <tr class="cart-item-row">
                    <td style="font-weight:600;">${item.name} <span style="font-size:11px; color:var(--text-muted); block; font-weight:normal;">(${item.category})</span></td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td style="font-weight:700;">$${sub.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        document.getElementById('summary-subtotal').innerText = `$${accumulatedTotal.toFixed(2)}`;
        document.getElementById('summary-total').innerText = `$${accumulatedTotal.toFixed(2)}`;
    }

    // Draw Order Invoices
    const ordersBody = document.getElementById('orders-table-body');
    if (state.orders.length === 0) {
        ordersBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">No historical orders discovered in this test lifecycle.</td></tr>`;
    } else {
        ordersBody.innerHTML = state.orders.map(o => `
            <tr class="order-row" id="invoice-${o.id}">
                <td><code>${o.id}</code></td>
                <td style="font-size:13px; color:var(--text-muted);">${o.timestamp}</td>
                <td style="max-width:300px; font-size:14px;">${o.items}</td>
                <td style="font-weight:700;">$${o.total}</td>
                <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                <td>
                    ${o.status === 'Pending' ? `<button onclick="cancelOrder('${o.id}')" class="btn btn-danger btn-cancel-order" style="padding:4px 8px; font-size:12px;">Void Order</button>` : '—'}
                </td>
            </tr>
        `).join('');
    }
}


if (typeof window !== "undefined") {
    window.onload = loadState;
}


// Make functions available to HTML onclick/onSubmit
if (typeof window !== "undefined") {
    window.login = login;
    window.logout = logout;
    window.addToCart = addToCart;
    window.placeOrder = placeOrder;
    window.cancelOrder = cancelOrder;
    window.injectDynamicPromoItem = injectDynamicPromoItem;
    window.triggerDynamicPriceFluctuation = triggerDynamicPriceFluctuation;
    window.loadAsyncCatalogWithDelay = loadAsyncCatalogWithDelay;
    window.filterCategory = filterCategory;
    window.switchView = switchView;
}