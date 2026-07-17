// ===== AUTH SYSTEM =====
let currentUser = null;

function login(username, password) {
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = { username: user.username, role: user.role };
    return true;
  }
  return false;
}

function logout() {
  currentUser = null;
}

function isLoggedIn() {
  return currentUser !== null;
}

function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

function getCurrentUser() {
  return currentUser;
}

// ===== EVENT LISTENER LOGIN =====
document.getElementById('loginBtn').addEventListener('click', function() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const errorEl = document.getElementById('loginError');
  
  if (login(user, pass)) {
    errorEl.style.display = 'none';
    document.getElementById('loginOverlay').classList.add('hidden');
    updateUI();
    renderAllProducts();
    updateCartUI();
    switchTab('home');
  } else {
    errorEl.style.display = 'block';
  }
});

// Enter key support
document.getElementById('loginPass').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

// ===== LOGOUT =====
document.getElementById('logoutBtn').addEventListener('click', function() {
  logout();
  document.getElementById('loginOverlay').classList.remove('hidden');
  updateUI();
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  // Reset cart & orders (optional)
  cart = [];
  orders = [];
  updateCartUI();
  renderAllProducts();
});

// ===== UI UPDATE =====
function updateUI() {
  const usernameDisplay = document.getElementById('usernameDisplay');
  const adminTab = document.getElementById('adminTab');
  
  if (currentUser) {
    usernameDisplay.textContent = currentUser.username + (currentUser.role === 'admin' ? ' ⭐' : '');
    adminTab.disabled = currentUser.role !== 'admin';
    adminTab.style.opacity = currentUser.role === 'admin' ? '1' : '0.5';
    
    if (currentUser.role !== 'admin' && document.querySelector('[data-tab="admin"]')?.classList.contains('active')) {
      switchTab('home');
    }
  } else {
    usernameDisplay.textContent = 'Guest';
    adminTab.disabled = true;
    adminTab.style.opacity = '0.5';
  }
}
