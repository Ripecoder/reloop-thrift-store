const header = document.querySelector('.site-header');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const searchToggle = document.getElementById('searchToggle');
const searchPanel = document.getElementById('searchPanel');
const searchInput = document.getElementById('searchInput');
const searchClose = document.getElementById('searchClose');
const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('.product-card');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const clearFilters = document.getElementById('clearFilters');
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtitle = document.getElementById('cartSubtitle');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueBtn = document.getElementById('continueBtn');
const newsletterForm = document.getElementById('newsletterForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');
const backToTop = document.getElementById('backToTop');
const toast = document.getElementById('toast');

let activeTab = 'all';
let activeCategory = null;
let query = '';
let toastTimer;
let cart = [];

try {
  cart = JSON.parse(localStorage.getItem('reloop-cart')) || [];
} catch (e) {
  cart = [];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function applyFilters() {
  let visible = 0;

  productCards.forEach((card) => {
    const categories = card.dataset.category.toLowerCase().split(' ');
    const tags = card.dataset.tags.toLowerCase().split(' ').filter(Boolean);
    const price = Number(card.dataset.price);
    const searchable = (card.dataset.name + ' ' + card.dataset.category).toLowerCase();
    let show = true;

    if (activeCategory && !categories.includes(activeCategory)) show = false;
    if (activeTab === 'new' && !tags.includes('new')) show = false;
    if (activeTab === 'budget' && price >= 40) show = false;
    if (activeTab === 'vintage' && !categories.includes('vintage')) show = false;
    if (query && !searchable.includes(query)) show = false;

    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  resultCount.textContent = visible === 1 ? '1 piece' : visible + ' pieces';
  emptyState.hidden = visible !== 0;
}

filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    filterTabs.forEach((t) => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    activeTab = tab.dataset.filter;
    applyFilters();
  });
});

document.querySelectorAll('.category-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    activeCategory = card.dataset.category;
    activeTab = 'all';
    query = '';
    searchInput.value = '';
    filterTabs.forEach((t) => {
      const isAll = t.dataset.filter === 'all';
      t.classList.toggle('is-active', isAll);
      t.setAttribute('aria-selected', String(isAll));
    });
    applyFilters();
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    showToast('Showing ' + card.querySelector('h3').textContent + ' picks');
  });
});

function setSearch(value) {
  query = value.trim().toLowerCase();
  applyFilters();
}

function closeSearch() {
  searchPanel.classList.remove('open');
  searchToggle.setAttribute('aria-expanded', 'false');
}

searchToggle.addEventListener('click', () => {
  const willOpen = !searchPanel.classList.contains('open');
  searchPanel.classList.toggle('open', willOpen);
  searchToggle.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) {
    closeMenu();
    searchInput.focus();
  } else {
    setSearch('');
  }
});

searchClose.addEventListener('click', () => {
  searchInput.value = '';
  setSearch('');
  closeSearch();
});

searchInput.addEventListener('input', (event) => setSearch(event.target.value));

clearFilters.addEventListener('click', () => {
  activeTab = 'all';
  activeCategory = null;
  query = '';
  searchInput.value = '';
  filterTabs.forEach((t) => {
    const isAll = t.dataset.filter === 'all';
    t.classList.toggle('is-active', isAll);
    t.setAttribute('aria-selected', String(isAll));
  });
  applyFilters();
});

function closeMenu() {
  navLinks.classList.remove('open');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  const willOpen = !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', willOpen);
  menuToggle.classList.toggle('active', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  closeSearch();
});

navLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') closeMenu();
});

function saveCart() {
  localStorage.setItem('reloop-cart', JSON.stringify(cart));
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCount.textContent = count;
  cartCount.classList.toggle('show', count > 0);
  cartSubtitle.textContent = count === 1 ? '1 piece' : count + ' pieces';
  cartTotal.textContent = '$' + total;

  if (!cart.length) {
    cartItems.innerHTML = '<div class="cart-empty"><span>◌</span><strong>Your bag is empty</strong><p>Good things are waiting. Go find your next favourite.</p></div>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" />
      <div class="cart-item-details">
        <strong>${item.name}</strong>
        <small>One of a kind · Pre-loved</small>
        <div class="cart-item-bottom">
          <div class="qty-control">
            <button data-decrease="${index}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-increase="${index}" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item-price">$${item.price * item.qty}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
continueBtn.addEventListener('click', closeCart);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
    closeSearch();
    closeMenu();
  }
});

document.querySelectorAll('.quick-add').forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.add;
    const price = Number(button.dataset.price);
    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, img: button.dataset.img, qty: 1 });
    }
    saveCart();
    renderCart();
    showToast(name + ' added to your bag');
  });
});

cartItems.addEventListener('click', (event) => {
  const increase = event.target.dataset.increase;
  const decrease = event.target.dataset.decrease;
  if (increase !== undefined) {
    cart[Number(increase)].qty++;
  } else if (decrease !== undefined) {
    const index = Number(decrease);
    cart[index].qty--;
    if (cart[index].qty <= 0) cart.splice(index, 1);
  } else {
    return;
  }
  saveCart();
  renderCart();
});

checkoutBtn.addEventListener('click', () => {
  if (!cart.length) {
    showToast('Your bag is empty — go find something good!');
    return;
  }
  showToast('Thanks for shopping RELOOP! This is a demo store.');
});

document.querySelectorAll('.wishlist').forEach((button) => {
  button.addEventListener('click', () => {
    const active = button.classList.toggle('active');
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '♥' : '♡';
    showToast(active ? 'Saved to your favourites' : 'Removed from favourites');
  });
});

newsletterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  formMessage.classList.toggle('error', !valid);
  if (!valid) {
    formMessage.textContent = 'Please enter a valid email address.';
    emailInput.focus();
    return;
  }
  formMessage.textContent = 'You’re in! Check your inbox for 10% off.';
  emailInput.value = '';
  emailInput.blur();
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.classList.toggle('show', window.scrollY > 700);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('year').textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach((element, index) => {
  element.style.transitionDelay = (index % 4) * 65 + 'ms';
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

applyFilters();
renderCart();
