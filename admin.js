/* ============================================
   TANDRA'S — Admin Dashboard Logic
   Authentication, Menu CRUD, Category Management,
   Site Settings, Live Storage Sync
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTabs();
  initDashboard();
  initCategoryManager();
  initSiteSettings();
});

// Current active session state
let currentItems = [];
let currentCategories = [];
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
    refreshCategoryData();
    loadSiteSettingsForm();
  }

  function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
}

/* ============================================
   TAB NAVIGATION
   ============================================ */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      // Update button states
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels
      tabPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });
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
    if (e.key === 'tandras_categories') {
      refreshCategoryData();
    }
  });
}

/* ============================================
   CATEGORY FILTER & SELECT POPULATION
   ============================================ */
function populateCategoryDropdowns() {
  const cats = getCategories();
  
  // Populate the category filter dropdown
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    const currentVal = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.slug;
      opt.textContent = `${cat.emoji} ${cat.label}`;
      categoryFilter.appendChild(opt);
    });
    categoryFilter.value = currentVal || 'all';
  }

  // Populate the item modal category select
  const itemCategorySelect = document.getElementById('item-category');
  if (itemCategorySelect) {
    const currentVal = itemCategorySelect.value;
    itemCategorySelect.innerHTML = '';
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.slug;
      opt.textContent = `${cat.emoji} ${cat.label}`;
      itemCategorySelect.appendChild(opt);
    });
    // Add combo options for items with multiple categories
    if (cats.length >= 2) {
      const comboOpt = document.createElement('option');
      comboOpt.value = cats.map(c => c.slug).slice(0, 2).join(' ');
      comboOpt.textContent = `${cats[0].emoji}+${cats[1].emoji} ${cats[0].label} & ${cats[1].label}`;
      itemCategorySelect.appendChild(comboOpt);
    }
    if (currentVal) {
      itemCategorySelect.value = currentVal;
    }
  }
}

/* ============================================
   DATA LOADING & RENDERING
   ============================================ */
function refreshMenuData() {
  currentItems = getMenuItems();
  currentCategories = getCategories();
  populateCategoryDropdowns();
  updateStats();
  renderFilteredItems();
}

function refreshCategoryData() {
  currentCategories = getCategories();
  populateCategoryDropdowns();
  renderCategoriesTable();
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
  document.getElementById('stat-categories-count').textContent = currentCategories.length;
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

  // Refresh categories in modal dropdown
  populateCategoryDropdowns();

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
    categorySelect.value = currentCategories.length > 0 ? currentCategories[0].slug : 'meals';
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
   CATEGORY MANAGEMENT
   ============================================ */
function initCategoryManager() {
  const btnAddCategory = document.getElementById('btn-add-category');
  const btnResetCategories = document.getElementById('btn-reset-categories');
  const catModal = document.getElementById('category-modal');
  const catModalClose = document.getElementById('cat-modal-close');
  const catModalCancel = document.getElementById('cat-modal-cancel');
  const catForm = document.getElementById('category-form');
  const catColorInput = document.getElementById('cat-color');
  const catColorHex = document.getElementById('cat-color-hex');
  const catLabelInput = document.getElementById('cat-label');
  const catSlugInput = document.getElementById('cat-slug');

  // Open add category modal
  btnAddCategory.addEventListener('click', () => {
    openCategoryModal();
  });

  // Reset categories
  btnResetCategories.addEventListener('click', () => {
    if (confirm('Reset all categories to defaults? Custom categories will be lost.')) {
      resetCategories();
      refreshCategoryData();
      refreshMenuData();
      showToast('Categories reset to defaults!', 'info');
    }
  });

  // Modal close handlers
  catModalClose.addEventListener('click', closeCategoryModal);
  catModalCancel.addEventListener('click', closeCategoryModal);
  catModal.addEventListener('click', (e) => {
    if (e.target === catModal) closeCategoryModal();
  });

  // Color picker live preview
  catColorInput.addEventListener('input', () => {
    catColorHex.textContent = catColorInput.value.toUpperCase();
  });

  // Auto-generate slug from label
  catLabelInput.addEventListener('input', () => {
    const editId = document.getElementById('edit-cat-id').value;
    if (!editId) {
      // Only auto-slug on new categories
      catSlugInput.value = catLabelInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  });

  // Form submit
  catForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCategoryForm();
  });

  // Initial render
  renderCategoriesTable();
}

function openCategoryModal(id = null) {
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('cat-modal-title');
  const editIdInput = document.getElementById('edit-cat-id');
  const labelInput = document.getElementById('cat-label');
  const emojiInput = document.getElementById('cat-emoji');
  const slugInput = document.getElementById('cat-slug');
  const colorInput = document.getElementById('cat-color');
  const colorHex = document.getElementById('cat-color-hex');
  const saveBtnText = document.getElementById('cat-save-btn-text');

  if (id) {
    const cat = currentCategories.find(c => c.id === id);
    if (!cat) return;

    title.textContent = 'Edit Category';
    saveBtnText.textContent = 'Save Changes';
    editIdInput.value = cat.id;
    labelInput.value = cat.label;
    emojiInput.value = cat.emoji;
    slugInput.value = cat.slug;
    colorInput.value = cat.color || '#E8751A';
    colorHex.textContent = (cat.color || '#E8751A').toUpperCase();
  } else {
    title.textContent = 'Add New Category';
    saveBtnText.textContent = 'Add Category';
    editIdInput.value = '';
    labelInput.value = '';
    emojiInput.value = '';
    slugInput.value = '';
    colorInput.value = '#E8751A';
    colorHex.textContent = '#E8751A';
  }

  modal.style.display = 'flex';
  labelInput.focus();
}

function closeCategoryModal() {
  document.getElementById('category-modal').style.display = 'none';
}

function saveCategoryForm() {
  const editId = document.getElementById('edit-cat-id').value;
  const label = document.getElementById('cat-label').value.trim();
  const emoji = document.getElementById('cat-emoji').value.trim();
  const slug = document.getElementById('cat-slug').value.trim().toLowerCase();
  const color = document.getElementById('cat-color').value;

  if (!label || !emoji || !slug) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  // Validate slug format
  if (!/^[a-z0-9\-]+$/.test(slug)) {
    showToast('Slug must contain only lowercase letters, numbers, and hyphens', 'error');
    return;
  }

  const cats = getCategories();

  if (editId) {
    // Update existing
    const index = cats.findIndex(c => c.id === editId);
    if (index !== -1) {
      // Check duplicate slug (excluding current)
      const duplicate = cats.find(c => c.slug === slug && c.id !== editId);
      if (duplicate) {
        showToast(`Slug "${slug}" is already used by "${duplicate.label}"`, 'error');
        return;
      }
      cats[index] = { ...cats[index], label, emoji, slug, color };
      showToast(`Updated category "${label}"!`, 'success');
    }
  } else {
    // Check duplicate slug
    if (cats.find(c => c.slug === slug)) {
      showToast(`A category with slug "${slug}" already exists`, 'error');
      return;
    }
    cats.push({
      id: `cat-${Date.now()}`,
      slug,
      label,
      emoji,
      color
    });
    showToast(`Added category "${label}"!`, 'success');
  }

  saveCategories(cats);
  refreshCategoryData();
  refreshMenuData();
  closeCategoryModal();
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categories-table-body');
  const emptyState = document.getElementById('categories-empty');
  const table = document.getElementById('categories-table');
  const cats = getCategories();

  if (!cats.length) {
    table.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  table.style.display = '';
  emptyState.style.display = 'none';

  // Count items per category
  const items = getMenuItems();
  const countMap = {};
  cats.forEach(c => countMap[c.slug] = 0);
  items.forEach(item => {
    (item.category || '').split(/\s+/).forEach(slug => {
      if (countMap[slug] !== undefined) countMap[slug]++;
    });
  });

  tbody.innerHTML = cats.map((cat, idx) => `
    <tr data-cat-id="${cat.id}">
      <td class="td-drag">
        <span class="drag-handle" title="Drag to reorder">⠿</span>
      </td>
      <td>
        <span class="cat-emoji-display">${escapeHtml(cat.emoji)}</span>
      </td>
      <td>
        <span class="cat-label-display">${escapeHtml(cat.label)}</span>
      </td>
      <td>
        <code class="cat-slug-display">${escapeHtml(cat.slug)}</code>
      </td>
      <td>
        <span class="cat-color-swatch" style="background:${escapeHtml(cat.color || '#E8751A')}"></span>
        <span class="cat-color-text">${escapeHtml(cat.color || '#E8751A')}</span>
      </td>
      <td>
        <span class="cat-item-count">${countMap[cat.slug] || 0}</span>
      </td>
      <td class="td-actions">
        <button class="btn-icon" data-cat-action="edit" data-cat-id="${cat.id}" title="Edit Category">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="btn-icon btn-delete" data-cat-action="delete" data-cat-id="${cat.id}" title="Delete Category">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');

  // Attach events
  tbody.querySelectorAll('[data-cat-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-cat-action');
      const catId = btn.getAttribute('data-cat-id');

      if (action === 'edit') {
        openCategoryModal(catId);
      } else if (action === 'delete') {
        deleteCategoryById(catId);
      }
    });
  });
}

function deleteCategoryById(id) {
  const cats = getCategories();
  const cat = cats.find(c => c.id === id);
  if (!cat) return;

  // Count items using this category
  const items = getMenuItems();
  const count = items.filter(item => (item.category || '').split(/\s+/).includes(cat.slug)).length;

  const warning = count > 0
    ? `\n\n⚠️ ${count} menu item(s) are using this category. They will keep their category text but it won't appear in filters.`
    : '';

  if (confirm(`Delete category "${cat.label}"?${warning}`)) {
    const updated = cats.filter(c => c.id !== id);
    saveCategories(updated);
    refreshCategoryData();
    refreshMenuData();
    showToast(`Deleted category "${cat.label}"`, 'info');
  }
}

/* ============================================
   SITE SETTINGS (Favicon, OG Tags)
   ============================================ */
function initSiteSettings() {
  const form = document.getElementById('site-settings-form');
  const btnReset = document.getElementById('btn-reset-settings');
  const faviconInput = document.getElementById('setting-favicon');
  const ogTitleInput = document.getElementById('setting-og-title');
  const ogDescInput = document.getElementById('setting-og-desc');
  const ogImageInput = document.getElementById('setting-og-image');
  const ogImageUpload = document.getElementById('og-image-upload');

  // Character counters
  ogTitleInput.addEventListener('input', () => {
    document.getElementById('og-title-count').textContent = `${ogTitleInput.value.length}/120`;
    updateSocialPreview();
  });

  ogDescInput.addEventListener('input', () => {
    document.getElementById('og-desc-count').textContent = `${ogDescInput.value.length}/300`;
    updateSocialPreview();
  });

  // Favicon live preview
  faviconInput.addEventListener('input', () => {
    updateFaviconPreview(faviconInput.value.trim());
  });

  // OG Image live preview
  ogImageInput.addEventListener('input', () => {
    updateOgImagePreview(ogImageInput.value.trim());
    updateSocialPreview();
  });

  // OG Image file upload
  ogImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        ogImageInput.value = evt.target.result;
        updateOgImagePreview(evt.target.result);
        updateSocialPreview();
      };
      reader.readAsDataURL(file);
    }
  });

  // Save settings
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = {
      faviconUrl: faviconInput.value.trim(),
      ogTitle: ogTitleInput.value.trim(),
      ogDescription: ogDescInput.value.trim(),
      ogImage: ogImageInput.value.trim()
    };
    saveSiteSettings(settings);
    showToast('Site settings saved successfully! Changes will apply on the public website.', 'success');
  });

  // Reset settings
  btnReset.addEventListener('click', () => {
    if (confirm('Reset all site settings to defaults?')) {
      resetSiteSettings();
      loadSiteSettingsForm();
      showToast('Site settings reset to defaults!', 'info');
    }
  });
}

function loadSiteSettingsForm() {
  const settings = getSiteSettings();

  const faviconInput = document.getElementById('setting-favicon');
  const ogTitleInput = document.getElementById('setting-og-title');
  const ogDescInput = document.getElementById('setting-og-desc');
  const ogImageInput = document.getElementById('setting-og-image');

  faviconInput.value = settings.faviconUrl || '';
  ogTitleInput.value = settings.ogTitle || '';
  ogDescInput.value = settings.ogDescription || '';
  ogImageInput.value = settings.ogImage || '';

  // Update counters
  document.getElementById('og-title-count').textContent = `${(settings.ogTitle || '').length}/120`;
  document.getElementById('og-desc-count').textContent = `${(settings.ogDescription || '').length}/300`;

  // Update previews
  updateFaviconPreview(settings.faviconUrl || '');
  updateOgImagePreview(settings.ogImage || '');
  updateSocialPreview();
}

function updateFaviconPreview(url) {
  const img = document.getElementById('favicon-preview-img');
  const placeholder = document.getElementById('favicon-placeholder');

  if (url) {
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
      placeholder.textContent = 'Invalid URL';
    };
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    placeholder.textContent = 'No favicon set';
  }
}

function updateOgImagePreview(url) {
  const img = document.getElementById('og-image-preview-img');
  const placeholder = document.getElementById('og-image-placeholder');

  if (url) {
    img.src = url;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    img.onerror = () => {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    };
  } else {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

function updateSocialPreview() {
  const titleInput = document.getElementById('setting-og-title');
  const descInput = document.getElementById('setting-og-desc');
  const imageInput = document.getElementById('setting-og-image');

  const previewTitle = document.getElementById('social-preview-title');
  const previewDesc = document.getElementById('social-preview-desc');
  const previewImg = document.getElementById('social-preview-img');
  const previewImgEmpty = document.getElementById('social-preview-img-empty');

  previewTitle.textContent = titleInput.value || "Tandra's — Homemade Goodness, Served with Love";
  previewDesc.textContent = descInput.value || 'Fresh, hygienic, and affordable homemade meals for students.';

  const imgUrl = imageInput.value.trim();
  if (imgUrl) {
    previewImg.src = imgUrl;
    previewImg.style.display = 'block';
    previewImgEmpty.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    previewImgEmpty.style.display = 'flex';
  }
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
