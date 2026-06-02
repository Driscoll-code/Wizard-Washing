/* =====================================================
   WIZARD WASHING — script.js
===================================================== */

/* ─── STICKY NAV ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── HAMBURGER MENU ─── */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('nav-links');
const navClose   = document.getElementById('nav-close');

function closeNav() {
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  const spans = hamburger.querySelectorAll('span');
  spans[0].style.transform = '';
  spans[1].style.opacity   = '';
  spans[2].style.transform = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  // Animate hamburger to X
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

navClose.addEventListener('click', closeNav);

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

/* ─── FAQ ACCORDION ─── */
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item     = btn.closest('.faq__item');
    const isOpen   = item.classList.contains('open');

    // Close all items
    document.querySelectorAll('.faq__item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked item
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ─── QUOTE FORM — Formspree fetch + inline success ─── */
const form        = document.getElementById('quote-form');
const successBox  = document.getElementById('form-success');
const submitBtn   = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Client-side validation
  let valid = true;
  const requiredFields = form.querySelectorAll('[required]');

  requiredFields.forEach(field => {
    field.classList.remove('error');
    const val = field.value.trim();
    if (!val) {
      field.classList.add('error');
      valid = false;
    }
  });

  // Basic email format check
  const emailField = form.querySelector('#email');
  if (emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    emailField.classList.add('error');
    valid = false;
  }

  if (!valid) {
    const firstError = form.querySelector('.error');
    if (firstError) firstError.focus();
    return;
  }

  // Disable button while submitting
  submitBtn.disabled   = true;
  submitBtn.textContent = 'Sending…';

  try {
    const data     = new FormData(form);
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      // Hide form, show success
      form.style.display     = 'none';
      successBox.classList.add('visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const json = await response.json().catch(() => ({}));
      const msg  = json.errors ? json.errors.map(e => e.message).join(', ') : 'Something went wrong. Please try again.';
      alert(msg);
      submitBtn.disabled   = false;
      submitBtn.textContent = 'Request My Free Quote ✨';
    }
  } catch {
    alert('Network error — please check your connection and try again.');
    submitBtn.disabled   = false;
    submitBtn.textContent = 'Request My Free Quote ✨';
  }
});

// Remove error styling on input
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('error'));
});

/* ─── SCROLL FADE-IN ─── */
/* Progressive enhancement: elements visible by default.
   Only hide elements below the fold so if observer fails, content is always visible. */
document.querySelectorAll('.fade-up').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top >= window.innerHeight) {
    el.classList.add('fade-anim');
  } else {
    el.classList.add('visible');
    const counter = el.querySelector('.stat-item__number[data-target]');
    if (counter) animateCounter(counter);
  }
});

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('fade-anim');
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
      const counter = entry.target.querySelector('.stat-item__number[data-target]');
      if (counter) animateCounter(counter);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-up.fade-anim').forEach(el => fadeObserver.observe(el));

/* ─── GOOGLE REVIEWS ─── */
const GOOGLE_API_KEY = 'AIzaSyCC0Vehyu-pGswSgaXsvW2Ez7JeeQoBHDE';

async function loadGoogleReviews() {
  try {
    const res = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.reviews'
        },
        body: JSON.stringify({ textQuery: 'Wizard Washing Chilliwack BC' })
      }
    );
    if (!res.ok) return;
    const data = await res.json();
    const reviews = data.places?.[0]?.reviews;
    if (!reviews || !reviews.length) return;

    const top3 = reviews
      .sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
      .slice(0, 3);

    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    grid.innerHTML = top3.map((r, i) => `
      <div class="review-card fade-up" ${i > 0 ? `style="transition-delay:${i * 0.15}s"` : ''}>
        <div class="review-card__stars">${'★'.repeat(r.rating || 5)}</div>
        <p class="review-card__quote">"${r.text?.text || ''}"</p>
        <p class="review-card__name">— ${r.authorAttribution?.displayName || 'Google Reviewer'} <span class="review-card__time">${r.relativePublishTimeDescription || ''}</span></p>
      </div>
    `).join('');

    grid.querySelectorAll('.review-card.fade-up').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight) {
        el.classList.add('fade-anim');
        fadeObserver.observe(el);
      } else {
        el.classList.add('visible');
      }
    });

  } catch {
    // API failed — hardcoded reviews remain visible as fallback
  }
}

loadGoogleReviews();

/* ─── STATS COUNTER ─── */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const decimals = parseInt(el.dataset.decimals || '0');
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value    = (target * eased).toFixed(decimals);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ─── BUTTON WATER RIPPLE ─── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top  = (e.clientY - rect.top) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

/* ─── CURSOR SPARKLE TRAIL (desktop only) ─── */
if (window.matchMedia('(pointer: fine)').matches) {
  const CHARS = ['✦', '★', '✦', '✧', '★'];
  let lastSpawn = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSpawn < 80) return; // throttle: max ~12/sec
    if (Math.random() > 0.55) return; // random skip for natural look
    lastSpawn = now;

    const el = document.createElement('span');
    el.className  = 'cursor-sparkle';
    el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    el.style.left = e.clientX + 'px';
    el.style.top  = e.clientY + 'px';
    el.style.fontSize = (0.5 + Math.random() * 0.6) + 'rem';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  });
}

/* ─── BEFORE/AFTER DRAG SLIDERS ─── */
document.querySelectorAll('.ba-slider').forEach(slider => {
  const afterImg = slider.querySelector('.ba-slider__after');
  const handle   = slider.querySelector('.ba-slider__handle');
  let dragging   = false;

  function setPos(clientX) {
    const rect = slider.getBoundingClientRect();
    const pct  = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    afterImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left       = pct + '%';
  }

  slider.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove',  e => { if (dragging) setPos(e.clientX); });
  window.addEventListener('mouseup',    ()  => { dragging = false; });

  slider.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove',  e => { if (dragging) setPos(e.touches[0].clientX); },  { passive: true });
  window.addEventListener('touchend',   ()  => { dragging = false; });
});
