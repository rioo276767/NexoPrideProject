// ===== STATE =====
let cart = [];
let orders = [];
let currentCategory = 'all';

// ===== DOM REFS =====
const homeGrid = document.getElementById('homeProductGrid');
const shopGrid = document.getElementById('shopProductGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const orderList = document.getElementById('orderList');

// ===== RENDER PRODUCTS =====
function renderProductCards(productsArray, container) {
  if (!container) return;
  container.innerHTML = productsArray.map(p => `
    <div class="product-card">
      <div class="product-img"><i class="fas ${p.icon}"></i></div>
      <div class="product-tag">${p.tag}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">${CONFIG.CURRENCY} ${p.price.toLocaleString()} ${p.oldPrice ? `<span class="old">${CONFIG.CURRENCY} ${p.oldPrice.toLocaleString()}</span>` : ''}</div>
      <div class="product-stock"><i class="fas fa-box"></i> Stok: ${p.stock}</div>
      <button class="btn-add" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      addToCart(id);
    });
  });
}

function renderAllProducts() {
  renderProductCards(PRODUCTS.slice(0, 4), homeGrid);
  renderFilteredShop();
}

function renderFilteredShop() {
  const filtered = currentCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.tag === currentCategory);
  renderProductCards(filtered, shopGrid);
}

// ===== CATEGORY FILTER =====
document.querySelectorAll('.category-tabs span').forEach(el => {
  el.addEventListener('click', function() {
    document.querySelectorAll('.category-tabs span').forEach(s => s.classList.remove('active'));
    this.classList.add('active');
    currentCategory = this.dataset.cat;
    renderFilteredShop();
  });
});

// ===== CART =====
function addToCart(productId) {
  if (!isLoggedIn()) { alert('Silakan login terlebih dahulu'); return; }
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;
  if (prod.stock <= 0) { alert('Stok habis!'); return; }
  
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty < prod.stock) { existing.qty += 1; }
    else { alert('Stok tidak cukup'); return; }
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  if (cart.length === 0) {
    cartItems.innerHTML = `<p style="color:#666;">Keranjang kosong</p>`;
    cartTotal.textContent = 'Total: Rp 0';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span><strong>${item.name}</strong> x${item.qty} <span style="color:#b388ff;">Rp ${(item.price * item.qty).toLocaleString()}</span></span>
        <button style="background:transparent;border:none;color:#ff6b6b;cursor:pointer;" data-remove="${item.id}"><i class="fas fa-trash-alt"></i></button>
      </div>
    `).join('');
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    cartTotal.textContent = `Total: Rp ${total.toLocaleString()}`;
    
    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.remove);
        removeFromCart(id);
      });
    });
  }
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalItems;
}

// ===== CHECKOUT =====
document.getElementById('checkoutBtn').addEventListener('click', function() {
  if (!isLoggedIn()) { alert('Silakan login terlebih dahulu'); return; }
  if (cart.length === 0) { alert('Keranjang kosong!'); return; }
  
  const name = document.getElementById('custName').value.trim();
  const gameId = document.getElementById('custGameId').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const payment = document.getElementById('paymentMethod').value;
  
  if (!name || !gameId || !phone) {
    alert('Harap isi Nama, ID Game, dan No HP');
    return;
  }
  
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const order = {
    id: Date.now(),
    customer: name,
    gameId: gameId,
    phone: phone,
    payment: payment,
    items: JSON.stringify(cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))),
    total: total,
    status: 'pending',
    createdAt: new Date().toLocaleString()
  };
  orders.push(order);
  
  cart.forEach(c => {
    const prod = PRODUCTS.find(p => p.id === c.id);
    if (prod) prod.stock = Math.max(0, prod.stock - c.qty);
  });
  
  cart = [];
  updateCartUI();
  renderAllProducts();
  if (isAdmin()) updateAdminStats();
  
  const waMsg = `Halo Nexo Pride! Saya ${name} (${gameId}) sudah transfer ${payment} sebesar Rp ${total.toLocaleString()}. Mohon approve ya.`;
  window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`, '_blank');
  alert('Order dibuat! Silakan konfirmasi via WhatsApp.');
  
  document.getElementById('custName').value = '';
  document.getElementById('custGameId').value = '';
  document.getElementById('custPhone').value = '';
});

// ===== ADMIN STATS =====
function updateAdminStats() {
  const totalRev = orders.reduce((sum, o) => sum + (o.status === 'approved' ? o.total : 0), 0);
  const profit = Math.round(totalRev * CONFIG.PROFIT_MARGIN);
  const loss = Math.round(totalRev * CONFIG.TAX_RATE) + (orders.filter(o => o.status === 'pending').length * 5000);
  
  document.getElementById('totalRevenue').textContent = `Rp ${totalRev.toLocaleString()}`;
  document.getElementById('totalProfit').textContent = `Rp ${profit.toLocaleString()}`;
  document.getElementById('totalLoss').textContent = `Rp ${loss.toLocaleString()}`;
  document.getElementById('orderCount').textContent = orders.length;

  if (orders.length === 0) {
    orderList.innerHTML = `<div class="order-item"><span style="color:#666;">Belum ada order</span></div>`;
  } else {
    orderList.innerHTML = orders.slice().reverse().map(o => `
      <div class="order-item">
        <div class="order-info">
          <span><i class="fas fa-user"></i> ${o.customer}</span>
          <span><i class="fas fa-gamepad"></i> ${o.gameId}</span>
          <span><i class="fas fa-phone"></i> ${o.phone}</span>
          <span>Rp ${o.total.toLocaleString()}</span>
          <span class="${o.status === 'approved' ? 'status-approved' : 'status-pending'}">${o.status}</span>
        </div>
        ${o.status === 'pending' ? `<button class="btn-approve" data-order="${o.id}">Approve</button>` : `<span style="color:#4caf50;">✓ Approved</span>`}
      </div>
    `).join('');
    
    document.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.order);
        const order = orders.find(o => o.id === id);
        if (order) { order.status = 'approved'; updateAdminStats(); alert('Order approved!'); }
      });
    });
  }
}

// ===== SWITCH TABS =====
window.switchTab = function(tabName) {
  if (tabName === 'admin' && !isAdmin()) return;

  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tabs button').forEach(el => el.classList.remove('active'));

  const targetContent = document.getElementById('tab-' + tabName);
  if (targetContent) targetContent.classList.add('active');

  const targetBtn = document.querySelector(`.nav-tabs button[data-tab="${tabName}"]`);
  if (targetBtn) targetBtn.classList.add('active');

  if (tabName === 'admin' && isAdmin()) {
    updateAdminStats();
  }
};

document.querySelectorAll('.nav-tabs button[data-tab]').forEach(btn => {
  btn.addEventListener('click', function() {
    const tab = this.dataset.tab;
    if (tab === 'admin' && !isAdmin()) return;
    switchTab(tab);
  });
});

document.getElementById('logoHome').addEventListener('click', () => switchTab('home'));
document.getElementById('cartIcon').addEventListener('click', () => switchTab('cart'));

// ===== INIT =====
renderAllProducts();
updateCartUI();
