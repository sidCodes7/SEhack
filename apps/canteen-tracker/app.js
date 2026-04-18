// ──────────────────────────────────────────────
// Canteen Tracker — Mini-App Logic
// ──────────────────────────────────────────────
// Demo mini-app that uses aether-bridge.js to
// greet the user by name and display a canteen menu.

const MENU_ITEMS = [
  { emoji: '☕', name: 'Masala Chai', price: 15, wait: '2 min' },
  { emoji: '🥪', name: 'Veg Sandwich', price: 40, wait: '5 min' },
  { emoji: '🍛', name: 'Veg Thali', price: 70, wait: '10 min' },
  { emoji: '🍜', name: 'Maggi', price: 30, wait: '7 min' },
  { emoji: '🥤', name: 'Cold Coffee', price: 35, wait: '3 min' },
  { emoji: '🍕', name: 'Cheese Pizza', price: 60, wait: '12 min' },
  { emoji: '🧃', name: 'Fresh Juice', price: 25, wait: '4 min' },
  { emoji: '🍩', name: 'Samosa (2pc)', price: 20, wait: '3 min' },
];

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  grid.innerHTML = MENU_ITEMS.map(
    (item) => `
    <div class="menu-card">
      <div class="emoji">${item.emoji}</div>
      <div class="name">${item.name}</div>
      <div class="price">₹${item.price}</div>
      <div class="wait">⏱ ${item.wait}</div>
    </div>
  `
  ).join('');
}

// Wait for Aether bridge to connect
AetherBridge.onReady(function (user) {
  // Hide loading, show app
  document.getElementById('loading').style.display = 'none';
  document.getElementById('app').classList.add('visible');

  // Greet user by name
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    welcomeMsg.textContent = 'Welcome, ' + user.userName + '! (' + user.department + ')';
  }

  // Render the menu
  renderMenu();
});

// Fallback: if no bridge message after 3s, show app anyway
setTimeout(function () {
  if (!AetherBridge.user) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').classList.add('visible');
    var welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
      welcomeMsg.textContent = 'Welcome, Guest!';
    }
    renderMenu();
  }
}, 3000);
