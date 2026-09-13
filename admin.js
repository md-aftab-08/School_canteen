/* ============================================
   TANDRA'S — Admin Dashboard Logic
   Authentication, Menu CRUD, Live Storage Sync
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initDashboard();
});

// Current active session state
let currentItems = [];
let selectedImage = 'images/puri-combo.jpg';

/* ============================================
   AUTHENTICATION
   ============================================ */
function initAuth() {
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('admin-dashboard');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('btn-logout');

  // Check if session is already active
  const isAuth = sessionStorage.getItem('tandras_admin_auth') === 'true';
  if (isAuth) {
    showDashboard();
  } else {
    showLogin();
  }

  // Handle Show / Hide Password toggle
  const togglePassBtn = document.getElementById('toggle-password');
  const passInput = document.getElementById('password');
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passInput.type === 'password';
      passInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
             <line x1="1" y1="1" x2="23" y2="23"></line>
           </svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
             <circle cx="12" cy="12" r="3"></circle>
           </svg>`;
    });
  }

  // Handle Login submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    // Check credentials (TandraFood / TandraCanteen123)
    if (user === 'TandraFood' && pass === 'TandraCanteen123') {
      sessionStorage.setItem('tandras_admin_auth', 'true');
      showToast('Welcome back, Admin!', 'success');
      showDashboard();
    } else {
      showToast('Invalid username or password', 'error');
    }
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('tandras_admin_auth');
    showToast('Logged out successfully', 'info');
    showLogin();
  });

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    refreshMenuData();
  }

  function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
}

/* ============================================
   DASHBOARD INITIALIZATION
   ============================================ */
function initDashboard() {
  // Elements
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const stockFilter = document.getElementById('stock-filter');
  const btnAddItem = document.getElementById('btn-add-item');
  const btnClearFilters = document.getElementById('btn-clear-filters');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  const btnExport = document.getElementById('btn-export-json');
  const btnImport = document.getElementById('btn-import-json');
  const importFileInput = document.getElementById('import-file-input');

  // Modal elements
  const modal = document.getElementById('item-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const itemForm = document.getElementById('item-form');
  const imageUrlInput = document.getElementById('item-image-url');
  const fileUploadInput = document.getElementById('file-upload-input');
  const imgPreview = document.getElementById('image-preview');

  // Populate gallery picker
  renderGalleryPicker();

  // Search & Filter listeners
  searchInput.addEventListener('input', renderFilteredItems);
  categoryFilter.addEventListener('change', renderFilteredItems);
  stockFilter.addEventListener('change', renderFilteredItems);

  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', () => {
      searchInput.value = '';
      categoryFilter.value = 'all';
      stockFilter.value = 'all';
      renderFilteredItems();
    });
  }

  // Open Add Item Modal
  btnAddItem.addEventListener('click', () => {
    openItemModal();
  });

  // Modal close handlers
  modalClose.addEventListener('click', closeItemModal);
  modalCancel.addEventListener('click', closeItemModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeItemModal();
  });

  // Item Form Submit (Add / Edit)
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveItemForm();
  });

  // Image URL input changes
  imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      setImagePreview(url);
    }
  });

  // File upload input
  fileUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        imageUrlInput.value = dataUrl;
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  // Export JSON backup
  btnExport.addEventListener('click', () => {
    const dataStr = JSON.stringify(currentItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tandras_menu_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Menu backup exported successfully!', 'success');
  });

  // Import JSON backup
  btnImport.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveMenuItems(parsed);
          refreshMenuData();
          showToast(`Successfully imported ${parsed.length} menu items!`, 'success');
        } else {
          showToast('Invalid menu file format', 'error');
        }
      } catch (err) {
        showToast('Error reading JSON file', 'error');
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
  });

  // Reset Defaults
  btnResetDefaults.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset the menu to default dishes? Custom additions and edits will be restored.')) {
      resetMenuItems();
      refreshMenuData();
      showToast('Menu reset to defaults!', 'info');
    }
  });

  // Cross-tab storage sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'tandras_menu_items') {
      refreshMenuData();
    }
  });
}

/* ============================================
   DATA LOADING & RENDERING
   ============================================ */
function refreshMenuData() {
  currentItems = getMenuItems();
  updateStats();
  renderFilteredItems();
}

function updateStats() {
  const total = currentItems.length;
  const inStock = currentItems.filter(i => i.inStock !== false).length;
  const soldOut = total - inStock;

  // Extract unique categories
  const catSet = new Set();
  currentItems.forEach(i => {
    (i.category || '').split(/\s+/).forEach(c => {
      if (c) catSet.add(c.toLowerCase());
    });
  });

  document.getElementById('stat-total-items').textContent = total;
  document.getElementById('stat-instock-items').textContent = inStock;
  document.getElementById('stat-soldout-items').textContent = soldOut;
  document.getElementById('stat-categories-count').textContent = catSet.size;
  document.getElementById('items-count-display').textContent = total;
}

function renderFilteredItems() {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('category-filter')?.value || 'all';
  const stockFilter = document.getElementById('stock-filter')?.value || 'all';
  const container = document.getElementById('admin-items-container');
  const emptyState = document.getElementById('empty-state');

  if (!container) return;

  const filtered = currentItems.filter(item => {
    // Search match
    const matchSearch = !query ||
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.badge && item.badge.toLowerCase().includes(query));

    // Category match
    const categories = (item.category || '').toLowerCase().split(/\s+/);
    const matchCat = catFilter === 'all' || categories.includes(catFilter.toLowerCase());

    // Stock match
    const isInStock = item.inStock !== false;
    const matchStock = stockFilter === 'all' ||
      (stockFilter === 'instock' && isInStock) ||
      (stockFilter === 'soldout' && !isInStock);

    return matchSearch && matchCat && matchStock;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = filtered.map(item => createItemCardHtml(item)).join('');

  // Attach event listeners to card buttons
  attachCardEvents(container);
}

function createItemCardHtml(item) {
  const inStock = item.inStock !== false;
  const badgeHtml = item.badge ? `<span class="item-badge-pill">${escapeHtml(item.badge)}</span>` : '';
  const stockBtnClass = inStock ? 'instock' : 'soldout';
  const stockBtnText = inStock ? '● In Stock' : '✕ Sold Out';

  return `
    <div class="item-card ${inStock ? '' : 'is-soldout'}" data-id="${item.id}">
      <div class="item-image">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
        ${badgeHtml}
        <div class="stock-toggle-wrapper">
          <button class="stock-btn ${stockBtnClass}" data-action="toggle-stock" title="Click to toggle availability">
            ${stockBtnText}
          </button>
        </div>
      </div>

      <div class="item-body">
        <div class="item-meta-top">
          <span class="item-category-tag">${escapeHtml(item.category || 'General')}</span>
          <span class="item-rating">★ ${item.rating || '4.8'}</span>
        </div>

        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <p class="item-desc">${escapeHtml(item.description || '')}</p>

        <div class="item-footer">
          <span class="item-price">₹${item.price}</span>
          <div class="item-actions">
            <button class="btn-icon" data-action="edit" title="Edit Dish Details">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-delete" data-action="delete" title="Delete Dish">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachCardEvents(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.item-card');
      const id = card.getAttribute('data-id');
      const action = btn.getAttribute('data-action');

      if (action === 'toggle-stock') {
        toggleItemStock(id);
      } else if (action === 'edit') {
        openItemModal(id);
      } else if (action === 'delete') {
        deleteItem(id);
      }
    });
  });
}

/* ============================================
   ITEM ACTIONS (CRUD)
   ============================================ */
function toggleItemStock(id) {
  const item = currentItems.find(i => i.id === id);
  if (!item) return;

  item.inStock = item.inStock === false ? true : false;
  saveMenuItems(currentItems);
  updateStats();
  renderFilteredItems();

  const msg = item.inStock ? `"${item.title}" is now In Stock!` : `"${item.title}" marked as Sold Out!`;
  showToast(msg, item.inStock ? 'success' : 'info');
}

function deleteItem(id) {
  const item = currentItems.find(i => i.id === id);
  if (!item) return;

  if (confirm(`Are you sure you want to delete "${item.title}" from the menu?`)) {
    currentItems = currentItems.filter(i => i.id !== id);
    saveMenuItems(currentItems);
    updateStats();
    renderFilteredItems();
    showToast(`Deleted "${item.title}"`, 'info');
  }
}

function openItemModal(id = null) {
  const modal = document.getElementById('item-modal');
  const modalTitle = document.getElementById('modal-title');
  const editIdInput = document.getElementById('edit-item-id');
  const titleInput = document.getElementById('item-title');
  const priceInput = document.getElementById('item-price');
  const categorySelect = document.getElementById('item-category');
  const badgeInput = document.getElementById('item-badge');
  const ratingInput = document.getElementById('item-rating');
  const descInput = document.getElementById('item-desc');
  const inStockCheckbox = document.getElementById('item-instock');
  const imageUrlInput = document.getElementById('item-image-url');
  const saveBtnText = document.getElementById('save-btn-text');

  if (id) {
    // Edit Mode
    const item = currentItems.find(i => i.id === id);
    if (!item) return;

    modalTitle.textContent = 'Edit Dish Details';
    saveBtnText.textContent = 'Save Changes';
    editIdInput.value = item.id;
    titleInput.value = item.title;
    priceInput.value = item.price;
    categorySelect.value = item.category || 'meals';
    badgeInput.value = item.badge || '';
    ratingInput.value = item.rating || '4.8';
    descInput.value = item.description || '';
    inStockCheckbox.checked = item.inStock !== false;
    imageUrlInput.value = item.image;
    setImagePreview(item.image);
  } else {
    // Add Mode
    modalTitle.textContent = 'Add New Dish';
    saveBtnText.textContent = 'Add Dish';
    editIdInput.value = '';
    titleInput.value = '';
    priceInput.value = '';
    categorySelect.value = 'meals';
    badgeInput.value = '';
    ratingInput.value = '4.8';
    descInput.value = '';
    inStockCheckbox.checked = true;
    imageUrlInput.value = 'images/puri-combo.jpg';
    setImagePreview('images/puri-combo.jpg');
  }

  modal.style.display = 'flex';
  titleInput.focus();
}

function closeItemModal() {
  const modal = document.getElementById('item-modal');
  modal.style.display = 'none';
}

function saveItemForm() {
  const editId = document.getElementById('edit-item-id').value;
  const title = document.getElementById('item-title').value.trim();
  const price = parseFloat(document.getElementById('item-price').value);
  const category = document.getElementById('item-category').value;
  const badge = document.getElementById('item-badge').value.trim();
  const rating = parseFloat(document.getElementById('item-rating').value) || 4.8;
  const desc = document.getElementById('item-desc').value.trim();
  const inStock = document.getElementById('item-instock').checked;
  const image = document.getElementById('item-image-url').value.trim() || 'images/puri-combo.jpg';

  if (!title || isNaN(price)) {
    showToast('Please enter a valid title and price', 'error');
    return;
  }

  if (editId) {
    // Update existing item
    const index = currentItems.findIndex(i => i.id === editId);
    if (index !== -1) {
      currentItems[index] = {
        ...currentItems[index],
        title,
        price,
        category,
        badge,
        rating,
        description: desc,
        inStock,
        image
      };
      showToast(`Updated "${title}" successfully!`, 'success');
    }
  } else {
    // Create new item
    const newItem = {
      id: `menu-${Date.now()}`,
      title,
      price,
      category,
      badge,
      rating,
      description: desc,
      inStock,
      image
    };
    currentItems.unshift(newItem); // Place at top of menu
    showToast(`Added "${title}" to the menu!`, 'success');
  }

  saveMenuItems(currentItems);
  updateStats();
  renderFilteredItems();
  closeItemModal();
}

/* ============================================
   GALLERY PICKER
   ============================================ */
function renderGalleryPicker() {
  const picker = document.getElementById('gallery-picker');
  if (!picker || typeof AVAILABLE_GALLERY_IMAGES === 'undefined') return;

  picker.innerHTML = AVAILABLE_GALLERY_IMAGES.map(img => `
    <div class="gallery-thumb" data-path="${img.path}" title="${escapeHtml(img.label)}">
      <img src="${img.path}" alt="${escapeHtml(img.label)}" loading="lazy">
    </div>
  `).join('');

  picker.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const path = thumb.getAttribute('data-path');
      document.getElementById('item-image-url').value = path;
      setImagePreview(path);
    });
  });
}

function setImagePreview(src) {
  selectedImage = src;
  const imgEl = document.getElementById('image-preview');
  if (imgEl) {
    imgEl.src = src;
    imgEl.onerror = () => {
      imgEl.src = 'images/puri-combo.jpg';
    };
  }

  // Highlight matching thumbnail in picker
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    if (thumb.getAttribute('data-path') === src) {
      thumb.classList.add('selected');
    } else {
      thumb.classList.remove('selected');
    }
  });
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
