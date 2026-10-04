/**
 * Calcutta Heritage Kitchen & Bistro
 * Void-Style Minimalist Client Application, Day/Night Theme Engine, Heritage System & In-Browser CMS
 * Palette: Pure Black, Crisp White, Natural Green (#15803d) - Zero gradient, Zero glow
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'calcutta_heritage_void_v4';
  const THEME_STORAGE_KEY = 'calcutta_heritage_theme';

  // State
  let appData = null;
  let activeCategory = 'all';
  let searchQuery = '';
  let activeDietFilter = 'all';
  let editingDishId = null;

  // Hero Carousel Configuration
  let currentHeroSlide = 0;
  let heroCarouselTimer = null;
  const heroSlideMeta = [
    {
      title: "Royal Kolkata Mutton Dum Biryani",
      sub: "₹495 • Aged Basmati, Golden Potato & Saffron",
      dishName: "Royal Kolkata Mutton Dum Biryani",
      price: 495
    },
    {
      title: "Slow-Braised Kosha Mangsho & Luchi",
      sub: "₹520 • Dark Velvet Gravy & Puffed Golden Luchis",
      dishName: "Slow-Braised Kosha Mangsho & Luchi",
      price: 520
    },
    {
      title: "Smoked Daab Chingri in Green Coconut",
      sub: "₹640 • Jumbo Tiger Prawns in Coconut Mustard",
      dishName: "Smoked Daab Chingri in Green Coconut",
      price: 640
    },
    {
      title: "Gondhoraj Bhetki Paturi in Banana Leaf",
      sub: "₹490 • Fresh Barramundi & Stone-Ground Mustard",
      dishName: "Gondhoraj Bhetki Paturi",
      price: 490
    }
  ];

  function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  function getWhatsAppUrl(text) {
    const phone = appData.restaurant.whatsapp.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${phone}?text=${encoded}`;
  }

  // =========================================================================
  // DAY / NIGHT THEME TOGGLE ENGINE
  // =========================================================================
  function initThemeEngine() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const mobileToggleBtn = document.getElementById('mobileThemeToggleBtn');
    const root = document.documentElement;

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Storage unavailable:', e);
      }
      const isDark = theme === 'dark';
      const label = isDark ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)';
      if (toggleBtn) {
        toggleBtn.setAttribute('title', label);
        toggleBtn.setAttribute('aria-label', label);
      }
      if (mobileToggleBtn) {
        mobileToggleBtn.setAttribute('title', label);
        mobileToggleBtn.setAttribute('aria-label', label);
        const textEl = mobileToggleBtn.querySelector('.theme-mode-text');
        if (textEl) {
          textEl.textContent = isDark ? 'Night Mode (Tap for Day)' : 'Day Mode (Tap for Night)';
        }
      }
    }

    // Load initial theme from localStorage or system preference
    let currentTheme = 'dark';
    try {
      currentTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      currentTheme = null;
    }
    if (!currentTheme) {
      currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    applyTheme(currentTheme);

    function toggleTheme() {
      const active = root.getAttribute('data-theme') || 'dark';
      const nextTheme = active === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
    if (mobileToggleBtn) {
      mobileToggleBtn.addEventListener('click', toggleTheme);
    }

    // Keyboard shortcut: Shift+D or Alt+D to toggle Day / Night
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'd' || e.key === 'D') && (e.shiftKey || e.altKey) && !e.target.matches('input, textarea, select')) {
        toggleTheme();
      }
    });
  }

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        appData = JSON.parse(stored);
      } else {
        appData = JSON.parse(JSON.stringify(DEFAULT_RESTAURANT_DATA));
      }
    } catch (e) {
      console.error('Failed to load storage, using defaults:', e);
      appData = JSON.parse(JSON.stringify(DEFAULT_RESTAURANT_DATA));
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  function renderRestaurantInfo() {
    const r = appData.restaurant;

    const annEl = document.getElementById('announcementText');
    if (annEl) annEl.textContent = r.bannerAnnouncement;

    document.querySelectorAll('.js-restaurant-name').forEach(el => el.textContent = r.name);
    
    const hlEl = document.getElementById('heroHeadline');
    if (hlEl) {
      hlEl.innerHTML = `Royalty, Romance &amp; <span class="em">Heritage Dum</span>`;
    }
    const shEl = document.getElementById('heroSubhead');
    if (shEl) shEl.textContent = r.subheadline;

    const waLinks = document.querySelectorAll('.js-wa-link');
    waLinks.forEach(el => {
      el.href = getWhatsAppUrl(`Namaskar! I would like to make an enquiry / order at ${r.name}.`);
    });

    const addrEl = document.getElementById('contactAddress');
    if (addrEl) addrEl.textContent = r.address;

    const lunchEl = document.getElementById('lunchHours');
    if (lunchEl) lunchEl.textContent = r.lunchHours;

    const dinnerEl = document.getElementById('dinnerHours');
    if (dinnerEl) dinnerEl.textContent = r.dinnerHours;
  }

  // =========================================================================
  // HERO CAROUSEL CONTROLLER
  // =========================================================================
  function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const counter = document.getElementById('carouselCounter');
    const captionTitle = document.getElementById('carouselCaptionTitle');
    const captionSub = document.getElementById('carouselCaptionSub');
    const waBtn = document.getElementById('carouselWaBtn');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const carouselEl = document.getElementById('heroCarousel');

    if (!slides.length) return;

    function goToSlide(index) {
      currentHeroSlide = (index + slides.length) % slides.length;

      slides.forEach((s, idx) => {
        s.classList.toggle('active', idx === currentHeroSlide);
      });

      if (counter) {
        counter.textContent = `0${currentHeroSlide + 1} / 0${slides.length}`;
      }

      const meta = heroSlideMeta[currentHeroSlide];
      if (meta) {
        if (captionTitle) captionTitle.textContent = meta.title;
        if (captionSub) captionSub.textContent = meta.sub;
        if (waBtn) {
          const text = `Hello! I would like to order: *${meta.dishName}* (${formatINR(meta.price)}) from Calcutta Heritage.`;
          waBtn.href = getWhatsAppUrl(text);
        }
      }
    }

    function nextSlide() {
      goToSlide(currentHeroSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentHeroSlide - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

    function startTimer() {
      stopTimer();
      heroCarouselTimer = setInterval(nextSlide, 4500);
    }

    function stopTimer() {
      if (heroCarouselTimer) clearInterval(heroCarouselTimer);
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopTimer);
      carouselEl.addEventListener('mouseleave', startTimer);
    }

    goToSlide(0);
    startTimer();
  }

  // =========================================================================
  // BENTO GRID RENDERER (Front & Center Featured Section)
  // =========================================================================
  function renderBentoGrid() {
    const container = document.getElementById('bentoGridContainer');
    if (!container) return;

    const featured = appData.dishes.filter(d => d.isFeatured);
    if (!featured.length) {
      container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-secondary);">No featured dishes selected.</p>`;
      return;
    }

    const flagship = featured[0];
    const otherFeatured = featured.slice(1);
    const flagshipWaUrl = getWhatsAppUrl(`Hello! I would like to order: *${flagship.name}* (${formatINR(flagship.price)}).`);

    let html = `
      <!-- Bento 1: Flagship Dual Column Card (Span 8) -->
      <article class="bento-card bento-span-8 bento-flagship framer-fade-in is-visible">
        <div class="bento-flagship-media paper-overlay-wrap">
          <img src="${flagship.image}" 
               alt="${flagship.name}" 
               class="bento-flagship-img" 
               loading="lazy" 
               width="500" 
               height="380"
               onerror="this.src='assets/images/biryani_hero.jpg'">
          <div class="diet-indicator ${flagship.isVeg ? 'veg' : 'non-veg'}" 
               style="position:absolute; top:0.8rem; left:0.8rem; z-index:3;"></div>
        </div>
        <div class="bento-flagship-content">
          <div>
            <div class="bento-tag-line">
              <span class="bento-badge-natural">${flagship.badge || "Signature"}</span>
              <span class="bento-price-text">${formatINR(flagship.price)}</span>
            </div>
            <h3 class="bento-dish-name">${flagship.name}</h3>
            ${flagship.bengaliName ? `<div class="bento-bengali-sub">${flagship.bengaliName}</div>` : ''}
            <p class="bento-dish-desc">${flagship.description}</p>
          </div>
          <div class="bento-card-action-row">
            <span style="font-size:0.75rem; color:var(--text-muted);">
              ${flagship.spiceLevel ? '🌶️'.repeat(flagship.spiceLevel) + ' Awadhi Spiced' : '🌱 Aromatic'}
            </span>
            <a href="${flagshipWaUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-minimal" title="Quick Order on WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.974.53 1.957.817 2.795.817 3.183 0 5.768-2.587 5.768-5.768 0-3.181-2.585-5.768-5.767-5.768zm0 10.364c-.812 0-1.608-.225-2.302-.649l-.165-.101-1.713.449.457-1.67-.107-.171c-.463-.736-.708-1.593-.707-2.457 0-2.536 2.064-4.6 4.601-4.6 2.535 0 4.598 2.064 4.598 4.6 0 2.536-2.063 4.6-4.602 4.6z"/>
              </svg>
            </a>
          </div>
        </div>
      </article>

      <!-- Bento 2: Heritage Preview Card (Span 4) -->
      <article class="bento-card bento-span-4 bento-info-box framer-fade-in is-visible">
        <div>
          <div class="bento-info-icon">🌿</div>
          <h3 style="font-family:var(--font-serif); font-size:1.3rem; font-weight:500; color:var(--text-white); margin-bottom:0.5rem;">
            Awadh Dum &amp; Bengal Alchemy
          </h3>
          <p style="font-size:0.86rem; color:var(--text-secondary); line-height:1.6;">
            Slow-cooked in seasoned iron and sealed with dough in heavy brass handis. Authentic Park Street culinary heritage.
          </p>
        </div>
        <div style="padding-top:1.2rem; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:1rem; font-weight:600; color:var(--text-white); font-family:var(--font-serif);">100% Natural</div>
            <div style="font-size:0.72rem; color:var(--text-dim);">Cold-Pressed Mustard Oil</div>
          </div>
          <a href="#heritage" class="btn-minimal-outline" style="font-size:0.75rem; padding:0.35rem 0.75rem;">Heritage System</a>
        </div>
      </article>
    `;

    // Remaining featured cards
    otherFeatured.forEach((dish, idx) => {
      const waUrl = getWhatsAppUrl(`Hello! I would like to order: *${dish.name}* (${formatINR(dish.price)}).`);
      const spanClass = (idx === 3 || idx === 4) ? 'bento-span-6' : 'bento-span-4';

      html += `
        <article class="bento-card ${spanClass} framer-fade-in is-visible">
          <div class="bento-standard-media paper-overlay-wrap">
            <img src="${dish.image}" 
                 alt="${dish.name}" 
                 style="width:100%; height:100%; object-fit:cover;" 
                 loading="lazy" 
                 width="400" 
                 height="220"
                 onerror="this.src='assets/images/biryani_hero.jpg'">
            ${dish.badge ? `<span class="menu-card-badge">${dish.badge}</span>` : ''}
            <div class="diet-indicator ${dish.isVeg ? 'veg' : 'non-veg'}"></div>
          </div>
          <div class="bento-standard-body">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.25rem;">
                <h4 style="font-family:var(--font-serif); font-size:1.15rem; font-weight:500; color:var(--text-white);">${dish.name}</h4>
                <span style="font-family:var(--font-serif); font-size:1.15rem; font-weight:600; color:var(--text-white); white-space:nowrap;">${formatINR(dish.price)}</span>
              </div>
              ${dish.bengaliName ? `<div style="font-size:0.76rem; color:var(--green-natural); margin-bottom:0.4rem;">${dish.bengaliName}</div>` : ''}
              <p style="font-size:0.84rem; color:var(--text-secondary); line-height:1.55; margin-bottom:1rem;">
                ${dish.description}
              </p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
              <span style="font-size:0.72rem; color:var(--text-dim);">
                ${dish.spiceLevel ? '🌶️'.repeat(dish.spiceLevel) : '🌱 Mild'}
              </span>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-minimal" title="Quick Order on WhatsApp" style="width:32px; height:32px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.974.53 1.957.817 2.795.817 3.183 0 5.768-2.587 5.768-5.768 0-3.181-2.585-5.768-5.767-5.768zm0 10.364c-.812 0-1.608-.225-2.302-.649l-.165-.101-1.713.449.457-1.67-.107-.171c-.463-.736-.708-1.593-.707-2.457 0-2.536 2.064-4.6 4.601-4.6 2.535 0 4.598 2.064 4.598 4.6 0 2.536-2.063 4.6-4.602 4.6z"/>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    });

    container.innerHTML = html;
  }

  // =========================================================================
  // FULL MENU RENDERER
  // =========================================================================
  function renderFullMenu() {
    const container = document.getElementById('fullMenuContainer');
    if (!container) return;

    let filtered = appData.dishes;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(d => d.category === activeCategory);
    }

    if (activeDietFilter === 'veg') {
      filtered = filtered.filter(d => d.isVeg === true);
    } else if (activeDietFilter === 'non-veg') {
      filtered = filtered.filter(d => d.isVeg === false);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.bengaliName && d.bengaliName.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q)
      );
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <p style="font-size: 1rem; margin-bottom: 0.5rem;">No dishes match your selection.</p>
          <button id="resetMenuFiltersBtn" class="btn-minimal-outline" style="margin-top: 0.5rem;">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetMenuFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeCategory = 'all';
          activeDietFilter = 'all';
          searchQuery = '';
          const searchInput = document.getElementById('menuSearchInput');
          if (searchInput) searchInput.value = '';
          updateFilterPills();
          renderFullMenu();
        });
      }
      return;
    }

    container.innerHTML = filtered.map(dish => {
      const waUrl = getWhatsAppUrl(`Hello! I would like to order: *${dish.name}* (${formatINR(dish.price)}) from Calcutta Heritage.`);
      return `
        <article class="menu-card framer-fade-in is-visible">
          <div class="menu-card-media paper-overlay-wrap">
            <img src="${dish.image}" 
                 alt="${dish.name}" 
                 class="menu-card-img" 
                 loading="lazy" 
                 width="400" 
                 height="250"
                 onerror="this.src='assets/images/biryani_hero.jpg'">
            ${dish.badge ? `<span class="menu-card-badge">${dish.badge}</span>` : ''}
            <div class="diet-indicator ${dish.isVeg ? 'veg' : 'non-veg'}"></div>
          </div>
          <div class="menu-card-body">
            <div class="menu-card-title-row">
              <h4 class="menu-card-title">${dish.name}</h4>
              <span class="menu-card-price">${formatINR(dish.price)}</span>
            </div>
            ${dish.bengaliName ? `<div class="menu-card-bengali">${dish.bengaliName}</div>` : ''}
            <p class="menu-card-desc">${dish.description}</p>
            <div class="menu-card-footer">
              <span style="font-size:0.72rem; color:var(--text-dim);">
                ${dish.spiceLevel ? '🌶️'.repeat(dish.spiceLevel) : '🌱 Mild'}
              </span>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-minimal" title="Quick Order on WhatsApp" style="width:32px; height:32px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.974.53 1.957.817 2.795.817 3.183 0 5.768-2.587 5.768-5.768 0-3.181-2.585-5.768-5.767-5.768zm0 10.364c-.812 0-1.608-.225-2.302-.649l-.165-.101-1.713.449.457-1.67-.107-.171c-.463-.736-.708-1.593-.707-2.457 0-2.536 2.064-4.6 4.601-4.6 2.535 0 4.598 2.064 4.598 4.6 0 2.536-2.063 4.6-4.602 4.6z"/>
                </svg>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // =========================================================================
  // TESTIMONIALS / REVIEWS
  // =========================================================================
  function renderTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container) return;

    container.innerHTML = appData.testimonials.map(t => `
      <article class="bento-card bento-span-4 bento-info-box framer-fade-in is-visible">
        <div>
          <div style="color:var(--green-natural); font-size:0.85rem; margin-bottom:0.75rem; letter-spacing:1px;">
            ${'★'.repeat(t.rating)}
          </div>
          <p style="font-size:0.88rem; color:var(--text-white); line-height:1.65; font-style:italic; margin-bottom:1.5rem;">
            “${t.review}”
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem; padding-top:0.8rem; border-top:1px solid var(--border-subtle);">
          <div style="width:32px; height:32px; border-radius:var(--radius-sm); background:var(--bg-elevated); border:1px solid var(--border-card); display:flex; align-items:center; justify-content:center; color:var(--green-natural); font-weight:600; font-size:0.8rem;">
            ${t.name.charAt(0)}
          </div>
          <div>
            <strong style="display:block; font-size:0.85rem; color:var(--text-white);">${t.name}</strong>
            <span style="font-size:0.72rem; color:var(--text-dim);">${t.role}</span>
          </div>
        </div>
      </article>
    `).join('');
  }

  // =========================================================================
  // FILTERS
  // =========================================================================
  function setupMenuFilters() {
    const filterButtons = document.querySelectorAll('.filter-pill');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderFullMenu();
      });
    });

    const dietPills = document.querySelectorAll('.diet-pill');
    dietPills.forEach(pill => {
      pill.addEventListener('click', () => {
        dietPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeDietFilter = pill.getAttribute('data-diet');
        renderFullMenu();
      });
    });

    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderFullMenu();
      });
    }
  }

  function updateFilterPills() {
    document.querySelectorAll('.filter-pill').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-category') === activeCategory);
    });
    document.querySelectorAll('.diet-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-diet') === activeDietFilter);
    });
  }

  // =========================================================================
  // FRAMER SCROLL REVEAL
  // =========================================================================
  function setupFramerRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.framer-fade-in').forEach(el => observer.observe(el));
  }

  // =========================================================================
  // RESERVATION FORM
  // =========================================================================
  function setupReservationForm() {
    const form = document.getElementById('reservationForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('resName').value;
      const guestPhone = document.getElementById('resPhone').value;
      const guests = document.getElementById('resGuests').value;
      const date = document.getElementById('resDate').value;
      const timeSlot = document.getElementById('resTime').value;
      const seating = document.getElementById('resSeating').value;
      const notes = document.getElementById('resNotes').value;

      const message = `Table Booking Request for *${appData.restaurant.name}*:\n` +
                      `• Name: ${guestName}\n` +
                      `• Phone: ${guestPhone}\n` +
                      `• Guests: ${guests} Person(s)\n` +
                      `• Date & Time: ${date} at ${timeSlot}\n` +
                      `• Seating: ${seating}\n` +
                      (notes ? `• Special Requests: ${notes}\n` : '') +
                      `Please confirm table availability. Thank you!`;

      window.open(getWhatsAppUrl(message), '_blank');
      alert(`Thank you, ${guestName}! Your booking details have been prepared for WhatsApp.`);
      form.reset();
    });
  }

  // =========================================================================
  // LIGHT DISMISS DIALOG
  // =========================================================================
  function setupLightDismiss(dialog) {
    if (!dialog) return;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }

  // =========================================================================
  // IN-BROWSER VISUAL ADMIN CMS
  // =========================================================================
  function setupAdminCMS() {
    const adminDialog = document.getElementById('adminDialog');
    if (!adminDialog) return;
    setupLightDismiss(adminDialog);

    document.querySelectorAll('.js-open-admin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAdminPanel();
      });
    });

    const closeBtn = document.getElementById('closeAdminBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => adminDialog.close());

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openAdminPanel();
      }
    });

    const adminTabs = document.querySelectorAll('.admin-tab-btn');
    adminTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        adminTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const view = tab.getAttribute('data-admin-view');
        document.querySelectorAll('.admin-view-panel').forEach(p => p.style.display = 'none');
        const activePanel = document.getElementById(`adminView_${view}`);
        if (activePanel) activePanel.style.display = 'block';
      });
    });

    const dishForm = document.getElementById('adminDishForm');
    if (dishForm) {
      dishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveDish();
      });
    }

    const settingsForm = document.getElementById('adminSettingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSaveSettings();
      });
    }

    const exportBtn = document.getElementById('adminExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportDataJson);

    const importInput = document.getElementById('adminImportInput');
    if (importInput) importInput.addEventListener('change', handleImportJson);

    const resetBtn = document.getElementById('adminResetDefaultsBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Restore all original handcrafted Kolkata dishes and default settings?")) {
          appData = JSON.parse(JSON.stringify(DEFAULT_RESTAURANT_DATA));
          saveData();
          renderAll();
          renderAdminDishesList();
          populateSettingsForm();
          alert("Menu & settings restored to factory defaults!");
        }
      });
    }

    const newDishBtn = document.getElementById('adminNewDishBtn');
    if (newDishBtn) {
      newDishBtn.addEventListener('click', () => {
        editingDishId = null;
        dishForm.reset();
        document.getElementById('adminDishFormTitle').textContent = "Add New Culinary Dish";
        document.getElementById('dishFeaturedToggle').checked = true;
        document.getElementById('adminDishFormModal').style.display = 'block';
      });
    }

    const cancelDishFormBtn = document.getElementById('cancelDishFormBtn');
    if (cancelDishFormBtn) {
      cancelDishFormBtn.addEventListener('click', () => {
        document.getElementById('adminDishFormModal').style.display = 'none';
      });
    }
  }

  function openAdminPanel() {
    const adminDialog = document.getElementById('adminDialog');
    if (!adminDialog) return;
    renderAdminDishesList();
    populateSettingsForm();
    adminDialog.showModal();
  }

  function renderAdminDishesList() {
    const listEl = document.getElementById('adminDishesList');
    if (!listEl) return;

    listEl.innerHTML = appData.dishes.map(d => `
      <div class="admin-dish-row" data-id="${d.id}">
        <img src="${d.image}" class="admin-dish-thumb" alt="${d.name}" onerror="this.src='assets/images/biryani_hero.jpg'">
        <div>
          <strong>${d.name}</strong>
          <div style="font-size:0.72rem; color:var(--text-dim);">${d.category.toUpperCase()} • ${d.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}</div>
        </div>
        <div style="font-weight:600; color:var(--text-white);">${formatINR(d.price)}</div>
        <div>
          <label style="font-size:0.72rem; display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="checkbox" class="js-toggle-featured" data-id="${d.id}" ${d.isFeatured ? 'checked' : ''}>
            ${d.isFeatured ? 'Bento' : 'Normal'}
          </label>
        </div>
        <div>
          <button class="btn-action-sm btn-edit js-edit-dish" data-id="${d.id}">Edit</button>
        </div>
        <div>
          <button class="btn-action-sm btn-delete js-delete-dish" data-id="${d.id}">Del</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.js-toggle-featured').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const dish = appData.dishes.find(item => item.id === id);
        if (dish) {
          dish.isFeatured = e.target.checked;
          saveData();
          renderBentoGrid();
        }
      });
    });

    listEl.querySelectorAll('.js-edit-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditDishForm(id);
      });
    });

    listEl.querySelectorAll('.js-delete-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Delete this dish?")) {
          appData.dishes = appData.dishes.filter(item => item.id !== id);
          saveData();
          renderAll();
          renderAdminDishesList();
        }
      });
    });
  }

  function openEditDishForm(id) {
    const dish = appData.dishes.find(item => item.id === id);
    if (!dish) return;
    editingDishId = id;

    document.getElementById('adminDishFormTitle').textContent = `Edit "${dish.name}"`;
    document.getElementById('dishNameInput').value = dish.name;
    document.getElementById('dishBengaliNameInput').value = dish.bengaliName || '';
    document.getElementById('dishCategorySelect').value = dish.category;
    document.getElementById('dishPriceInput').value = dish.price;
    document.getElementById('dishDescInput').value = dish.description;
    document.getElementById('dishBadgeInput').value = dish.badge || '';
    document.getElementById('dishImageInput').value = dish.image || '';
    document.getElementById('dishSpiceInput').value = dish.spiceLevel || 0;
    document.getElementById('dishVegSelect').value = dish.isVeg ? 'true' : 'false';
    document.getElementById('dishFeaturedToggle').checked = dish.isFeatured;

    document.getElementById('adminDishFormModal').style.display = 'block';
  }

  function handleSaveDish() {
    const name = document.getElementById('dishNameInput').value;
    const bengaliName = document.getElementById('dishBengaliNameInput').value;
    const category = document.getElementById('dishCategorySelect').value;
    const price = Number(document.getElementById('dishPriceInput').value);
    const description = document.getElementById('dishDescInput').value;
    const badge = document.getElementById('dishBadgeInput').value;
    const image = document.getElementById('dishImageInput').value || 'assets/images/biryani_hero.jpg';
    const spiceLevel = Number(document.getElementById('dishSpiceInput').value);
    const isVeg = document.getElementById('dishVegSelect').value === 'true';
    const isFeatured = document.getElementById('dishFeaturedToggle').checked;

    if (editingDishId) {
      const idx = appData.dishes.findIndex(d => d.id === editingDishId);
      if (idx !== -1) {
        appData.dishes[idx] = {
          ...appData.dishes[idx],
          name, bengaliName, category, price, description, badge, image, spiceLevel, isVeg, isFeatured
        };
      }
    } else {
      const newId = 'dish-' + Date.now();
      appData.dishes.unshift({
        id: newId,
        name, bengaliName, category, price, description, badge, image, spiceLevel, isVeg, isFeatured
      });
    }

    saveData();
    renderAll();
    renderAdminDishesList();
    document.getElementById('adminDishFormModal').style.display = 'none';
  }

  function populateSettingsForm() {
    const r = appData.restaurant;
    document.getElementById('settingsNameInput').value = r.name;
    document.getElementById('settingsSubtitleInput').value = r.subtitle;
    document.getElementById('settingsHeadlineInput').value = r.headline;
    document.getElementById('settingsPhoneInput').value = r.phone;
    document.getElementById('settingsWaInput').value = r.whatsapp;
    document.getElementById('settingsBannerInput').value = r.bannerAnnouncement;
    document.getElementById('settingsLunchInput').value = r.lunchHours;
    document.getElementById('settingsDinnerInput').value = r.dinnerHours;
    document.getElementById('settingsAddressInput').value = r.address;
  }

  function handleSaveSettings() {
    appData.restaurant.name = document.getElementById('settingsNameInput').value;
    appData.restaurant.subtitle = document.getElementById('settingsSubtitleInput').value;
    appData.restaurant.headline = document.getElementById('settingsHeadlineInput').value;
    appData.restaurant.phone = document.getElementById('settingsPhoneInput').value;
    appData.restaurant.whatsapp = document.getElementById('settingsWaInput').value;
    appData.restaurant.bannerAnnouncement = document.getElementById('settingsBannerInput').value;
    appData.restaurant.lunchHours = document.getElementById('settingsLunchInput').value;
    appData.restaurant.dinnerHours = document.getElementById('settingsDinnerInput').value;
    appData.restaurant.address = document.getElementById('settingsAddressInput').value;

    saveData();
    renderAll();
    alert("Settings saved successfully!");
  }

  function exportDataJson() {
    const jsonStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calcutta-heritage-menu-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.dishes && parsed.restaurant) {
          appData = parsed;
          saveData();
          renderAll();
          renderAdminDishesList();
          populateSettingsForm();
          alert("Menu data loaded successfully!");
        } else {
          alert("Invalid JSON structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function setupMobileNavigation() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const navMenu = document.getElementById('navMenu');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // =========================================================================
  // SCROLLSPY NAVIGATION
  // =========================================================================
  function setupScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    const sections = document.querySelectorAll('section[id], header[id]');

    function onScroll() {
      const scrollPos = window.scrollY + 120;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function renderAll() {
    renderRestaurantInfo();
    renderBentoGrid();
    renderFullMenu();
    renderTestimonials();
    setupFramerRevealObserver();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeEngine();
    loadData();
    renderAll();
    initHeroCarousel();
    setupMenuFilters();
    setupReservationForm();
    setupAdminCMS();
    setupMobileNavigation();
    setupScrollSpy();
  });

})();
