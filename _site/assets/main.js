// === 1. Custom Cursor Logic ===
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
  document.body.classList.add('cursor-enabled');

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;
  let cursorX = 0, cursorY = 0;
  let animating = false;

  const updateCursor = () => {
    cursorX = mouseX;
    cursorY = mouseY;
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;

    const dotTransform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    const outlineTransform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

    cursorDot.style.transform = dotTransform;
    cursorOutline.style.transform = outlineTransform;

    const dx = Math.abs(mouseX - outlineX);
    const dy = Math.abs(mouseY - outlineY);
    if (dx > 0.1 || dy > 0.1) {
      requestAnimationFrame(updateCursor);
    } else {
      animating = false;
    }
  };

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!animating) {
      animating = true;
      requestAnimationFrame(updateCursor);
    }
  }, { passive: true });

  const hoverables = document.querySelectorAll('.data-hover');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'), { passive: true });
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'), { passive: true });
  });
}

// === 2. Mobile Navigation ===
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

if (menuToggle && mobileNav) {
  const setMobileNav = (isOpen) => {
    mobileNav.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMobileNav(!isOpen);
  });

  const mobileNavClose = document.getElementById('mobile-nav-close');
  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => setMobileNav(false));
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => setMobileNav(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMobileNav(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) setMobileNav(false);
  });
}

// === 3. Scroll Reveal Engine ===
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// === 4. Dynamic Year ===
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// === 5. Hero Text Cycle ===
const cycleWords = [
  'business', 'team', 'workflow', 'productivity',
  'projects', 'analytics', 'dashboard', 'platform'
];
const cycleWordEl = document.getElementById('hero-cycle-word');
const cycleWrapEl = document.getElementById('hero-cycle-wrap');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (cycleWordEl && cycleWrapEl && cycleWords.length > 1) {
  let cycleIndex = 0;

  // Pre-measure all words once at startup — avoids getBoundingClientRect in setInterval
  const measureEl = document.createElement('span');
  measureEl.className = 'text-cycle-measure';
  measureEl.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap;';
  document.body.appendChild(measureEl);
  const wordWidths = cycleWords.map(w => {
    measureEl.textContent = w;
    return Math.ceil(measureEl.getBoundingClientRect().width) + 8;
  });
  document.body.removeChild(measureEl);

  cycleWordEl.textContent = cycleWords[0];
  cycleWrapEl.style.width = `${wordWidths[0]}px`;

  if (!reduceMotion) {
    setInterval(() => {
      cycleWordEl.classList.add('is-exiting');
      setTimeout(() => {
        cycleIndex = (cycleIndex + 1) % cycleWords.length;
        cycleWordEl.textContent = cycleWords[cycleIndex];
        cycleWrapEl.style.width = `${wordWidths[cycleIndex]}px`;
        cycleWordEl.classList.remove('is-exiting');
        cycleWordEl.classList.add('is-entering');
        requestAnimationFrame(() => cycleWordEl.classList.remove('is-entering'));
      }, 180);
    }, 3000);
  }
}

// === 6. Contact Form — Formspree + client-side validation ===
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const formSubmit = document.getElementById('form-submit');

function showFieldError(fieldId, message) {
  const errEl = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  if (errEl) errEl.textContent = message;
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (input) input.style.borderColor = message ? '#ff4d4d' : '';
}

function clearErrors() {
  ['name', 'email', 'message'].forEach(id => showFieldError(id, ''));
}

function validateForm(name, email, message) {
  let valid = true;
  if (!name.trim()) { showFieldError('name', 'Please enter your name or organization.'); valid = false; }
  if (!email.trim()) { showFieldError('email', 'Please enter your email address.'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError('email', 'Please enter a valid email address.'); valid = false; }
  if (!message.trim()) { showFieldError('message', 'Please describe your project or inquiry.'); valid = false; }
  return valid;
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const msg = document.getElementById('message').value;

    if (!validateForm(name, email, msg)) return;

    // Show loading state
    if (formSubmit) { formSubmit.textContent = 'Sending…'; formSubmit.disabled = true; }
    if (formStatus) { formStatus.textContent = ''; formStatus.className = 'form-status'; }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        if (formStatus) {
          formStatus.textContent = 'Message sent. I\'ll respond within 24 hours.';
          formStatus.style.color = 'var(--accent-cyan)';
        }
        form.reset();
        if (window.gtag) window.gtag('event', 'form_submit_success', { event_category: 'engagement' });
      } else {
        throw new Error('Server error');
      }
    } catch {
      if (formStatus) {
        formStatus.innerHTML = 'Something went wrong. Email me directly at <a href="mailto:willardwells@gmail.com" style="color:var(--accent-cyan)">willardwells@gmail.com</a>';
      }
    } finally {
      if (formSubmit) { formSubmit.textContent = 'Send Message'; formSubmit.disabled = false; }
    }
  });
}

// === 7. Marquee Pause/Play (WCAG 2.2.2) ===
const marqueeTrack = document.getElementById('marquee-track');
const marqueePauseBtn = document.getElementById('marquee-pause');
const marqueePauseIcon = document.getElementById('marquee-icon-pause');
const marqueePlayIcon = document.getElementById('marquee-icon-play');

if (marqueePauseBtn && marqueeTrack) {
  marqueePauseBtn.addEventListener('click', () => {
    const isPaused = marqueePauseBtn.getAttribute('aria-pressed') === 'true';
    const next = !isPaused;
    marqueePauseBtn.setAttribute('aria-pressed', String(next));
    marqueePauseBtn.setAttribute('aria-label', next ? 'Play scrolling text' : 'Pause scrolling text');
    marqueeTrack.style.animationPlayState = next ? 'paused' : 'running';
    if (marqueePauseIcon) marqueePauseIcon.style.display = next ? 'none' : '';
    if (marqueePlayIcon) marqueePlayIcon.style.display = next ? '' : 'none';
  });
}

// === 8. Stats Counter Animation (Fix #23) ===
const statsSection = document.getElementById('stats-section');

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

if (statsSection && !reduceMotion) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statsSection.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          animateCount(el, target, suffix, 1200);
        });
        // Static range values: fade-in with scale
        statsSection.querySelectorAll('[data-static]').forEach(el => {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          el.style.opacity = '0';
          el.style.transform = 'scale(0.9)';
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
          });
        });
        statsObserver.unobserve(statsSection);
      }
    });
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}

// === 9. CTA Tracking (GA4) ===
document.querySelectorAll('[data-gtag-event]').forEach((el) => {
  el.addEventListener('click', () => {
    const eventName = el.getAttribute('data-gtag-event');
    if (window.gtag && eventName) {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: el.textContent.trim() || el.getAttribute('aria-label') || 'cta'
      });
    }
  });
});
