// === 1. Custom Cursor Logic ===
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
  document.body.classList.add('cursor-enabled');
  window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    if (cursorOutline.animate) {
      cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: "forwards" });
    } else {
      cursorOutline.style.left = `${posX}px`;
      cursorOutline.style.top = `${posY}px`;
    }
  });

  const hoverables = document.querySelectorAll('.data-hover');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
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
    if (event.key === 'Escape') {
      setMobileNav(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      setMobileNav(false);
    }
  });
}

// === 3. Scroll Reveal Engine ===
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// === 4. Dynamic Year ===
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// === 5. Hero Text Cycle ===
const cycleWords = [
  'business',
  'team',
  'workflow',
  'productivity',
  'projects',
  'analytics',
  'dashboard',
  'platform'
];
const cycleWordEl = document.getElementById('hero-cycle-word');
const cycleWrapEl = document.getElementById('hero-cycle-wrap');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (cycleWordEl && cycleWrapEl && cycleWords.length > 1) {
  let cycleIndex = 0;
  const measureEl = document.createElement('span');
  measureEl.className = 'text-cycle-measure';
  document.body.appendChild(measureEl);

  const setWrapWidth = (word) => {
    measureEl.textContent = word;
    const width = Math.ceil(measureEl.getBoundingClientRect().width) + 8;
    cycleWrapEl.style.width = `${width}px`;
  };

  cycleWordEl.textContent = cycleWords[cycleIndex];
  setWrapWidth(cycleWords[cycleIndex]);

  if (!reduceMotion) {
    window.setInterval(() => {
      cycleWordEl.classList.add('is-exiting');
      window.setTimeout(() => {
        cycleIndex = (cycleIndex + 1) % cycleWords.length;
        cycleWordEl.textContent = cycleWords[cycleIndex];
        setWrapWidth(cycleWords[cycleIndex]);
        cycleWordEl.classList.remove('is-exiting');
        cycleWordEl.classList.add('is-entering');
        requestAnimationFrame(() => cycleWordEl.classList.remove('is-entering'));
      }, 180);
    }, 3000);
  }
}

// === 6. Contact Form Handling (mailto fallback for GitHub Pages) ===
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const msg = document.getElementById('message').value;

    const subject = `Inquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`;
    window.location.href = `mailto:willardwells@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (formStatus) {
      formStatus.textContent = 'Your email app should open. Please hit send to complete your message.';
    }
  });
}

// === 7. CTA Tracking (GA4) ===
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
