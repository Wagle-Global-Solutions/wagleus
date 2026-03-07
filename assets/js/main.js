/* ============================================================
   WAGLE UNIVERSAL SOLUTIONS — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initScrollTop();
});

/* ---------- Navigation ---------- */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  // Scroll effect
  const onScroll = () => {
    if (window.scrollY > 20) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      overlay?.classList.toggle('active');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });

    // Close on overlay click
    overlay?.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ---------- Scroll Reveal (replaces AOS library) ---------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
}

/* ---------- Scroll to Top ---------- */
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Contact Form (Web3Forms) ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = form.querySelector('.form-success');
  const errorMsg = form.querySelector('.form-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide previous messages
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';

    // Disable button
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        if (successMsg) {
          successMsg.textContent = 'Thank you! Your message has been sent. We\'ll get back to you shortly.';
          successMsg.style.display = 'block';
        }
        form.reset();
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Failed to send message. Please try again or email us directly.';
        errorMsg.style.display = 'block';
      }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Also init contact form on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initContactForm);