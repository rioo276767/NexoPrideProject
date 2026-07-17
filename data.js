// ===== DATA PRODUK =====
const PRODUCTS = [
  { id: 1, name: 'Dragon Skin', price: 250000, oldPrice: 320000, stock: 12, icon: 'fa-dragon', tag: 'Skin' },
  { id: 2, name: 'Ultra Blade', price: 185000, oldPrice: 210000, stock: 8, icon: 'fa-crosshairs', tag: 'Weapon' },
  { id: 3, name: 'Mythic Pet', price: 320000, oldPrice: null, stock: 5, icon: 'fa-dog', tag: 'Pet' },
  { id: 4, name: 'Emote Pack', price: 95000, oldPrice: 120000, stock: 20, icon: 'fa-laugh', tag: 'Skin' },
  { id: 5, name: 'Season Pass', price: 150000, oldPrice: null, stock: 15, icon: 'fa-ticket-alt', tag: 'Pass' },
  { id: 6, name: 'VIP Account', price: 500000, oldPrice: 650000, stock: 3, icon: 'fa-crown', tag: 'Pass' }
];

// ===== KONFIGURASI =====
const CONFIG = {
  WHATSAPP_NUMBER: '628123456789',
  CURRENCY: 'Rp',
  TAX_RATE: 0.1,
  PROFIT_MARGIN: 0.4
};

// ===== AKUN USER (untuk login) =====
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];
