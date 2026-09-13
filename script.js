/* ============================================
   TANDRA'S — Food & Canteen Services
   JavaScript — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // -------- Navigation --------
  initNavbar();
  initMobileMenu();

  // -------- Scroll Animations --------
  initScrollReveal();

  // -------- Menu Filters --------
  initMenuFilters();

  // -------- Testimonial Carousel --------
  initTestimonialCarousel();

  // -------- Contact Form --------
  initContactForm();

  // -------- Counter Animation --------
  initCounterAnimation();
});

/* ============================================
   NAVBAR — Scroll Shrink & Active Link
   ============================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  const sections = document.querySelectorAll('section[id]');

  // Scroll effect
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial call
}

/* ============================================
   MOBILE MENU
   ============================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const overlay = document.getElementById('mobile-overlay');
  const links = navLinks.querySelectorAll('a');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  links.forEach(link => link.addEventListener('click', closeMenu));
}

/* ============================================
   SCROLL REVEAL ANIMATION
   ============================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================
   MENU DYNAMIC RENDERING & FILTER TABS
   ============================================ */
function initMenuFilters() {
  const menuGrid = document.getElementById('menu-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderDynamicMenu() {
    if (!menuGrid || typeof getMenuItems !== 'function') return;

    const items = getMenuItems();
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

    menuGrid.innerHTML = items.map(item => {
      const inStock = item.inStock !== false;
      const badgeHtml = item.badge ? `<span class="menu-card-badge">${escapeHtml(item.badge)}</span>` : '';
      const soldOutHtml = !inStock ? `<span class="menu-card-soldout">Sold Out</span>` : '';

      // Format category label
      let catLabel = item.category || 'Special';
      if (catLabel.includes('meals')) catLabel = 'Meals & Combos';
      else if (catLabel.includes('snacks')) catLabel = 'Snacks';
      else if (catLabel.includes('beverages')) catLabel = 'Beverages';
      else if (catLabel.includes('specials')) catLabel = 'Specials';

      return `
        <div class="menu-card ${!inStock ? 'is-soldout' : ''}" data-category="${escapeHtml(item.category || '')}" id="${escapeHtml(item.id)}">
          <div class="menu-card-image">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="400" height="300" loading="lazy">
            ${badgeHtml}
            ${soldOutHtml}
          </div>
          <div class="menu-card-body">
            <div class="menu-card-category">${escapeHtml(catLabel)}</div>
            <h3 class="menu-card-title">${escapeHtml(item.title)}</h3>
            <p class="menu-card-desc">${escapeHtml(item.description || '')}</p>
            <div class="menu-card-footer">
              <span class="menu-card-price">₹${item.price}</span>
              <span class="menu-card-rating">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                ${item.rating || '4.8'}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    applyFilter(currentFilter);
  }

  function applyFilter(filter) {
    const cards = menuGrid.querySelectorAll('.menu-card');
    cards.forEach(card => {
      const categories = (card.getAttribute('data-category') || '').split(/\s+/);
      if (filter === 'all' || categories.includes(filter)) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeInUp 0.35s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // Filter button clicks
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  // Initial render
  renderDynamicMenu();

  // Storage and live custom event sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'tandras_menu_items') {
      renderDynamicMenu();
    }
  });

  window.addEventListener('tandras_menu_updated', () => {
    renderDynamicMenu();
  });
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

// Add fadeInUp animation dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

/* ============================================
   TESTIMONIAL CAROUSEL
   ============================================ */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonial-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let currentIndex = 0;
  const totalCards = cards.length;
  let autoPlayInterval;

  function goToSlide(index) {
    if (index < 0) index = totalCards - 1;
    if (index >= totalCards) index = 0;
    currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Button events
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  // Dot events
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoPlay();
    });
  });

  // Auto-play
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  // Touch/Swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
      resetAutoPlay();
    }
  }, { passive: true });

  startAutoPlay();
}

/* ============================================
   CONTACT FORM
   ============================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#form-name').value.trim();
    const email = form.querySelector('#form-email').value.trim();
    const message = form.querySelector('#form-message').value.trim();

    // Simple validation
    if (!name || !email || !message) {
      showFormFeedback('Please fill in all fields.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFormFeedback('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate submission
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      showFormFeedback('Thank you! Your message has been sent successfully. 🎉', 'success');
      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
    }, 1500);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormFeedback(message, type) {
  // Remove existing feedback
  const existing = document.querySelector('.form-feedback');
  if (existing) existing.remove();

  const feedback = document.createElement('div');
  feedback.className = `form-feedback form-feedback-${type}`;
  feedback.textContent = message;
  feedback.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1rem;
    animation: fadeInUp 0.3s ease;
    ${type === 'success'
      ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
      : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
  `;

  const form = document.getElementById('contact-form');
  form.insertBefore(feedback, form.firstChild);

  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transition = 'opacity 0.3s ease';
    setTimeout(() => feedback.remove(), 300);
  }, 4000);
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounterAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');

  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ============================================
   SMOOTH SCROLL (for anchor links)
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
