/* =====================================================
   WIZARD WASHING — script.js
===================================================== */

/* ─── STICKY NAV ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── HAMBURGER MENU (only wires up if elements exist) ─── */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('nav-links');
const navClose   = document.getElementById('nav-close');

if (hamburger && navLinks && navClose) {
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
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

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
      // GA4 + Google Ads conversion
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', { event_category: 'Quote Form', event_label: 'Quote Submitted' });
        gtag('event', 'conversion', {'send_to': 'AW-18009225229/lh7-CLu6k7ocEI3wu4tD'});
      }
      // Meta Pixel lead event
      if (typeof fbq === 'function') {
        fbq('track', 'Lead');
      }
      // Redirect to thank-you page
      window.location.href = '/thank-you.html';
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

// Stats bar counters are always visible on load — animate immediately
document.querySelectorAll('.stats-bar .stat-item__number[data-target]').forEach(el => {
  animateCounter(el);
});

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
