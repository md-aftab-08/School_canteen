/* ============================================
   TANDRA'S — Menu Data & State Management
   Shared between Main Site and Admin Panel
   ============================================ */

const DEFAULT_MENU_ITEMS = [
  {
    id: 'menu-puri-combo',
    title: 'Puri Sabzi Combo',
    category: 'meals specials',
    price: 60,
    rating: 4.9,
    badge: 'Combo Thali',
    image: 'images/puri-combo.jpg',
    description: 'Crispy golden puris served with homestyle spiced curry, rasgulla sweet, and fresh salad.',
    inStock: true
  },
  {
    id: 'menu-momos',
    title: 'Veg Steamed Momos',
    category: 'snacks',
    price: 50,
    rating: 4.9,
    badge: 'Student Favorite',
    image: 'images/momos.png',
    description: 'Handcrafted steamed vegetable dumplings seasoned with herbs, served with fiery red chilli chutney & creamy dip.',
    inStock: true
  },
  {
    id: 'menu-multigrain-bread',
    title: 'Multigrain Cheesy Bun',
    category: 'snacks',
    price: 40,
    rating: 4.8,
    badge: 'Freshly Baked',
    image: 'images/multigrain-bread.jpg',
    description: 'Oven-baked wholesome multigrain bread topped with golden melted cheese, savory herbs, and toasted crust.',
    inStock: true
  },
  {
    id: 'menu-pav-bhaji',
    title: 'Pav Bhaji',
    category: 'meals specials',
    price: 70,
    rating: 4.9,
    badge: 'Canteen Favorite',
    image: 'images/pav-bhaji.png',
    description: 'Rich spiced vegetable mash with dollops of fresh butter, served with buttered grilled pav & crunchy onions.',
    inStock: true
  },
  {
    id: 'menu-white-sauce-pasta',
    title: 'White Sauce Pasta',
    category: 'specials',
    price: 80,
    rating: 4.9,
    badge: "Chef's Special",
    image: 'images/white-sauce-pasta.jpg',
    description: 'Penne pasta tossed in velvety rich cream sauce with sweet corn, Italian herbs, and savory seasoning.',
    inStock: true
  },
  {
    id: 'menu-veg-burger',
    title: 'Veg Burger',
    category: 'snacks',
    price: 50,
    rating: 4.8,
    badge: 'Popular',
    image: 'images/veg-burger.png',
    description: 'Crispy golden patty topped with fresh green lettuce, juicy tomato, sliced onions, and house burger spread.',
    inStock: true
  },
  {
    id: 'menu-coleslaw-sandwich',
    title: 'Coleslaw Sandwich',
    category: 'snacks',
    price: 45,
    rating: 4.7,
    badge: 'Healthy Choice',
    image: 'images/coleslaw-sandwich.jpg',
    description: 'Crisp grilled brown bread stuffed with creamy vegetable coleslaw, lettuce, and diced tomatoes.',
    inStock: true
  },
  {
    id: 'menu-chilli-potatoes',
    title: 'Chilli Potatoes',
    category: 'snacks',
    price: 60,
    rating: 4.8,
    badge: 'Spicy & Tangy',
    image: 'images/chilli-potatoes.jpg',
    description: 'Crispy fried potato wedges tossed in a sizzling sweet-and-spicy chilli sauce, toasted sesame, and fresh coriander.',
    inStock: true
  },
  {
    id: 'menu-chai',
    title: 'Masala Chai',
    category: 'beverages',
    price: 10,
    rating: 4.9,
    badge: '',
    image: 'images/masala-chai-2.jpg',
    description: 'Strong, aromatic Indian tea brewed with ginger, cardamom, and fresh milk. The perfect pick-me-up.',
    inStock: true
  },
  {
    id: 'menu-biryani',
    title: 'Special Dum Biryani',
    category: 'meals specials',
    price: 110,
    rating: 4.9,
    badge: 'Weekend Special',
    image: 'images/biryani.jpg',
    description: 'Fragrant basmati rice slow-cooked with aromatic spices, caramelized onions, fresh mint, and creamy raita.',
    inStock: true
  },
  {
    id: 'menu-paneer',
    title: 'Paneer Butter Masala',
    category: 'meals',
    price: 90,
    rating: 4.8,
    badge: 'Homestyle',
    image: 'images/paneer.jpg',
    description: 'Tender cottage cheese cubes simmered in a silky tomato butter gravy with aromatic kasuri methi.',
    inStock: true
  },
  {
    id: 'menu-samosa',
    title: 'Crispy Samosa (2 pcs)',
    category: 'snacks',
    price: 25,
    rating: 4.9,
    badge: 'Hot & Fresh',
    image: 'images/samosa.jpg',
    description: 'Flaky golden pastry crust stuffed with spiced potato and pea filling, paired with tangy tamarind & mint chutney.',
    inStock: true
  }
];

const AVAILABLE_GALLERY_IMAGES = [
  { path: 'images/puri-combo.jpg', label: 'Puri Sabzi Combo' },
  { path: 'images/momos.png', label: 'Veg Steamed Momos' },
  { path: 'images/multigrain-bread.jpg', label: 'Multigrain Cheesy Bun' },
  { path: 'images/pav-bhaji.png', label: 'Pav Bhaji' },
  { path: 'images/white-sauce-pasta.jpg', label: 'White Sauce Pasta' },
  { path: 'images/veg-burger.png', label: 'Veg Burger' },
  { path: 'images/coleslaw-sandwich.jpg', label: 'Coleslaw Sandwich' },
  { path: 'images/chilli-potatoes.jpg', label: 'Chilli Potatoes' },
  { path: 'images/masala-chai-2.jpg', label: 'Masala Chai' },
  { path: 'images/biryani.jpg', label: 'Dum Biryani' },
  { path: 'images/chicken-curry.jpg', label: 'Chicken Curry' },
  { path: 'images/dal-rice.jpg', label: 'Dal Rice' },
  { path: 'images/egg-roll.jpg', label: 'Egg Roll' },
  { path: 'images/fish-curry.jpg', label: 'Fish Curry' },
  { path: 'images/paneer.jpg', label: 'Paneer Masala' },
  { path: 'images/samosa.jpg', label: 'Samosas' }
];

/* ============================================
   DEFAULT CATEGORIES
   ============================================ */
const DEFAULT_CATEGORIES = [
  { id: 'cat-meals', slug: 'meals', label: 'Meals & Combos', emoji: '🍛', color: '#E8751A' },
  { id: 'cat-snacks', slug: 'snacks', label: 'Snacks', emoji: '🍟', color: '#F59E0B' },
  { id: 'cat-specials', slug: 'specials', label: 'Specials', emoji: '⭐', color: '#8B5CF6' },
  { id: 'cat-beverages', slug: 'beverages', label: 'Beverages', emoji: '☕', color: '#10B981' }
];

/* ============================================
   DEFAULT SITE SETTINGS
   ============================================ */
const DEFAULT_SITE_SETTINGS = {
  faviconUrl: '',
  ogTitle: "Tandra's — Homemade Goodness, Served with Love",
  ogDescription: "Fresh, hygienic, and affordable homemade meals for students. Explore our delicious menu!",
  ogImage: ''
};

const MENU_STORAGE_KEY = 'tandras_menu_items';
const CATEGORIES_STORAGE_KEY = 'tandras_categories';
const SITE_SETTINGS_STORAGE_KEY = 'tandras_site_settings';

/**
 * Retrieve menu items from localStorage or fallback to default dataset
 */
function getMenuItems() {
  try {
    const raw = localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) {
      saveMenuItems(DEFAULT_MENU_ITEMS);
      return DEFAULT_MENU_ITEMS;
    }
    const items = JSON.parse(raw);
    return Array.isArray(items) && items.length > 0 ? items : DEFAULT_MENU_ITEMS;
  } catch (err) {
    console.error('Failed to read menu items from storage:', err);
    return DEFAULT_MENU_ITEMS;
  }
}

/**
 * Save menu items to localStorage and trigger storage sync
 */
function saveMenuItems(items) {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('tandras_menu_updated', { detail: items }));
    return true;
  } catch (err) {
    console.error('Failed to save menu items to storage:', err);
    return false;
  }
}

/**
 * Reset menu items back to default curated list
 */
function resetMenuItems() {
  saveMenuItems(DEFAULT_MENU_ITEMS);
  return DEFAULT_MENU_ITEMS;
}

/* ============================================
   CATEGORIES — CRUD via localStorage
   ============================================ */
function getCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return [...DEFAULT_CATEGORIES];
    }
    const cats = JSON.parse(raw);
    return Array.isArray(cats) && cats.length > 0 ? cats : [...DEFAULT_CATEGORIES];
  } catch (err) {
    console.error('Failed to read categories from storage:', err);
    return [...DEFAULT_CATEGORIES];
  }
}

function saveCategories(cats) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
    window.dispatchEvent(new CustomEvent('tandras_categories_updated', { detail: cats }));
    return true;
  } catch (err) {
    console.error('Failed to save categories to storage:', err);
    return false;
  }
}

function resetCategories() {
  saveCategories(DEFAULT_CATEGORIES);
  return [...DEFAULT_CATEGORIES];
}

/* ============================================
   SITE SETTINGS — Favicon, OG Tags
   ============================================ */
function getSiteSettings() {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (!raw) {
      saveSiteSettings(DEFAULT_SITE_SETTINGS);
      return { ...DEFAULT_SITE_SETTINGS };
    }
    const settings = JSON.parse(raw);
    return settings && typeof settings === 'object' ? settings : { ...DEFAULT_SITE_SETTINGS };
  } catch (err) {
    console.error('Failed to read site settings from storage:', err);
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

function saveSiteSettings(settings) {
  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('tandras_settings_updated', { detail: settings }));
    return true;
  } catch (err) {
    console.error('Failed to save site settings to storage:', err);
    return false;
  }
}

function resetSiteSettings() {
  saveSiteSettings(DEFAULT_SITE_SETTINGS);
  return { ...DEFAULT_SITE_SETTINGS };
}
