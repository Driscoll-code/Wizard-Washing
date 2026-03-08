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

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  });
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

/* ─── BEFORE/AFTER CAROUSEL ─── */
const track   = document.getElementById('carousel-track');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
const dotsEl  = document.getElementById('carousel-dots');

if (track) {
  const slides   = Array.from(track.children);
  const dots     = dotsEl ? Array.from(dotsEl.children) : [];
  let current    = 0;
  let autoTimer  = null;

  function goTo(index) {
    // Wrap around: past last → back to 0, before first → go to last
    current = ((index % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 3500);
  }

  function resetAuto() {
    startAuto(); // restart the 3.5s timer after any manual interaction
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

  // Pause on hover, resume on leave
  track.closest('.carousel').addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.closest('.carousel').addEventListener('mouseleave', () => startAuto());

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    clearInterval(autoTimer);
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  });

  goTo(0);
  startAuto();
}
