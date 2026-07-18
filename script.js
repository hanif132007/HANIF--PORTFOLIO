document.addEventListener('DOMContentLoaded', () => {

    const routeLinks = document.querySelectorAll('.route-link');
    const routerViews = document.querySelectorAll('.router-view');

    function handleRouting(targetHash) {
        const activeRoute = targetHash ? targetHash.replace('#', '') : 'catalog';

        routerViews.forEach(view => view.classList.remove('active-view'));
        routeLinks.forEach(link => link.classList.remove('active-link'));

        const displayTarget = document.getElementById(`view-${activeRoute}`);
        const navTarget = document.querySelector(`a[href="#${activeRoute}"]`);

        if (displayTarget) displayTarget.classList.add('active-view');
        if (navTarget) navTarget.classList.add('active-link');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('hashchange', () => handleRouting(window.location.hash));
    handleRouting(window.location.hash || '#catalog');

    const catalogProducts = [
        { id: 1, name: "Mechanical Keyboard", price: 119.99, category: "peripherals" },
        { id: 2, name: "Wireless Pro Mouse", price: 69.50, category: "peripherals" },
        { id: 3, name: "2TB NVMe SSD Internal", price: 159.99, category: "components" },
        { id: 4, name: "32GB DDR5 RAM Kit", price: 134.00, category: "components" },
        { id: 5, name: "27\" 144Hz Gaming Monitor", price: 249.99, category: "peripherals" },
        { id: 6, name: "Liquid CPU Cooler 240mm", price: 89.95, category: "components" }
    ];

    let appCartState = JSON.parse(localStorage.getItem('capstone-state-store')) || [];
    let currentFilter = 'all';

    const productCatalogDeck = document.getElementById('product-catalog-deck');
    const sidebarCartList = document.getElementById('sidebar-cart-list');
    const sidebarTotalPrice = document.getElementById('sidebar-total-price');
    const navCartCount = document.getElementById('nav-cart-count');
    const mainCartTableItems = document.getElementById('main-cart-table-items');
    const checkoutTotalItems = document.getElementById('checkout-total-items');
    const checkoutTotalPrice = document.getElementById('checkout-total-price');
    const finalCheckoutBtn = document.getElementById('final-checkout-btn');
    const filterButtons = document.querySelectorAll('.store-filter-btn');

    function syncStateStorage() {
        localStorage.setItem('capstone-state-store', JSON.stringify(appCartState));
        renderCartInterfaces();
    }

    function renderCatalogGrid() {
        if (!productCatalogDeck) return;
        productCatalogDeck.innerHTML = '';

        const matchedData = catalogProducts.filter(item =>
            currentFilter === 'all' || item.category === currentFilter
        );

        matchedData.forEach(prod => {
            const el = document.createElement('div');
            el.className = 'product-item-card';
            el.innerHTML = `
        <div>
          <span class="prod-category-tag">${prod.category}</span>
          <h4>${prod.name}</h4>
        </div>
        <div>
          <p class="prod-price">$${prod.price.toFixed(2)}</p>
          <button class="add-to-cart-btn" data-id="${prod.id}">Add to Cart</button>
        </div>
      `;
            productCatalogDeck.appendChild(el);
        });
    }

    function renderCartInterfaces() {
        let quantityAccumulator = 0;
        let financialAccumulator = 0;

        appCartState.forEach(item => {
            quantityAccumulator += item.quantity;
            financialAccumulator += item.price * item.quantity;
        });

        if (navCartCount) navCartCount.textContent = quantityAccumulator;

        if (sidebarCartList) {
            sidebarCartList.innerHTML = appCartState.length === 0
                ? `<p class="cart-empty-message">Your bucket is empty.</p>`
                : appCartState.map(i => `
            <div class="sidebar-cart-row">
              <span>${i.name} (x${i.quantity})</span>
              <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join('');
            if (sidebarTotalPrice) sidebarTotalPrice.textContent = `$${financialAccumulator.toFixed(2)}`;
        }

        if (mainCartTableItems) {
            if (appCartState.length === 0) {
                mainCartTableItems.innerHTML = `<div class="main-cart-row"><p class="cart-empty-message">No items in pipeline. Add some products from the catalog.</p></div>`;
                if (checkoutTotalItems) checkoutTotalItems.textContent = '0';
                if (checkoutTotalPrice) checkoutTotalPrice.textContent = '$0.00';
                if (finalCheckoutBtn) finalCheckoutBtn.disabled = true;
                return;
            }

            if (finalCheckoutBtn) finalCheckoutBtn.disabled = false;
            if (checkoutTotalItems) checkoutTotalItems.textContent = quantityAccumulator;
            if (checkoutTotalPrice) checkoutTotalPrice.textContent = `$${financialAccumulator.toFixed(2)}`;

            mainCartTableItems.innerHTML = appCartState.map(item => `
        <div class="main-cart-row">
          <div class="main-cart-details">
            <h4>${item.name}</h4>
            <span>$${item.price.toFixed(2)} each</span>
          </div>
          <div class="main-cart-actions">
            <button class="qty-btn decrement-trigger" data-id="${item.id}">-</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn increment-trigger" data-id="${item.id}">+</button>
          </div>
        </div>
      `).join('');
        }
    }

    if (productCatalogDeck) {
        productCatalogDeck.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn')) return;
            const targetId = Number(e.target.dataset.id);
            const blueprint = catalogProducts.find(p => p.id === targetId);
            const currentInstance = appCartState.find(c => c.id === targetId);

            if (currentInstance) {
                currentInstance.quantity += 1;
            } else {
                appCartState.push({ ...blueprint, quantity: 1 });
            }
            syncStateStorage();
        });
    }

    if (mainCartTableItems) {
        mainCartTableItems.addEventListener('click', (e) => {
            if (!e.target.classList.contains('qty-btn')) return;
            const targetId = Number(e.target.dataset.id);
            const activeReference = appCartState.find(c => c.id === targetId);

            if (e.target.classList.contains('increment-trigger')) {
                activeReference.quantity += 1;
            } else if (e.target.classList.contains('decrement-trigger')) {
                activeReference.quantity -= 1;
                if (activeReference.quantity <= 0) {
                    appCartState = appCartState.filter(c => c.id !== targetId);
                }
            }
            syncStateStorage();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderCatalogGrid();
        });
    });

    if (finalCheckoutBtn) {
        finalCheckoutBtn.addEventListener('click', () => {
            alert("🎉 Capstone Pipeline Notice: Project deployment system test verified successfully!");
            appCartState = [];
            syncStateStorage();
            window.location.hash = '#catalog';
        });
    }

    // Application Entry Point Bootstrap
    renderCatalogGrid();
    renderCartInterfaces();
});