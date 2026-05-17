/* ═══════════════════════════════════════════════════════════════
   Audessa — app.js
   Handles: scroll-reveal, mobile nav, email modal / waitlist
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Scroll Reveal ─────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
})();

/* ── Sticky nav scroll shadow ──────────────────────────────── */
(function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();

/* ── Waitlist endpoint (same Edge Function as extension) ───── */
const WAITLIST_ENDPOINT = 'https://supbhdpwvjlqwufvsmiv.supabase.co/functions/v1/waitlist-submit';

/* ── Email Modal ───────────────────────────────────────────── */
let currentTier = 'upgrade';

/* openModal — called via onclick="openModal('upgrade')" or onclick="openModal('mobile-waitlist')" */
window.openModal = function(tier) {
  currentTier = tier || 'upgrade';
  const overlay  = document.getElementById('emailModalOverlay');
  const form     = document.getElementById('emailForm');
  const success  = document.getElementById('emailSuccess');
  const input    = document.getElementById('emailInput');
  const err      = document.getElementById('emailError');
  const submitBtn = document.getElementById('emailSubmit');
  const title    = document.getElementById('modalTitle');
  const desc     = document.getElementById('modalDesc');
  if (!overlay) return;

  // Update modal copy based on tier
  if (tier === 'mobile-waitlist') {
    if (title) title.textContent = 'Join the Mobile Waitlist';
    if (desc) desc.textContent = "Be first to know when Audessa for Android launches. We'll only email you once.";
  } else {
    if (title) title.textContent = 'Hear It First';
    if (desc) desc.textContent = "Get early access to premium voices and new features. We'll only email you once.";
  }

  // Reset state
  if (form)    { form.style.display = ''; }
  if (success) { success.classList.remove('show'); }
  if (input)   { input.value = ''; }
  if (err)     { err.style.display = 'none'; err.textContent = ''; }
  if (submitBtn) { submitBtn.textContent = 'Notify me'; submitBtn.disabled = false; }

  overlay.classList.add('open');
  setTimeout(() => { if (input) input.focus(); }, 120);
};

(function initModal() {
  const overlay   = document.getElementById('emailModalOverlay');
  const closeBtn  = document.getElementById('modalClose');
  const doneBtn   = document.getElementById('modalDone');
  const submitBtn = document.getElementById('emailSubmit');
  const input     = document.getElementById('emailInput');
  if (!overlay) return;

  function closeModal() {
    overlay.classList.remove('open');
  }

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (doneBtn)  doneBtn.addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  async function submitEmail() {
    const email = input ? input.value.trim() : '';
    const err   = document.getElementById('emailError');
    const successMsg = document.getElementById('emailSuccessMsg');

    // Validate
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (err) { err.textContent = 'Please enter a valid email address.'; err.style.display = 'block'; }
      return;
    }
    if (err) err.style.display = 'none';
    if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; }

    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, tier: currentTier })
      });

      const form    = document.getElementById('emailForm');
      const success = document.getElementById('emailSuccess');

      if (res.ok || res.status === 201) {
        // Successful insert
        if (currentTier === 'mobile-waitlist') {
          if (successMsg) successMsg.textContent = "You're on the list! We'll email you when Android launches.";
        } else {
          if (successMsg) successMsg.textContent = "We'll let you know when new tiers launch.";
        }
        if (form)    form.style.display = 'none';
        if (success) success.classList.add('show');
      } else if (res.status === 409) {
        // Duplicate email
        if (successMsg) successMsg.textContent = "You're already on the list!";
        if (form)    form.style.display = 'none';
        if (success) success.classList.add('show');
      } else {
        let errorCode = '';
        try {
          const body = await res.json();
          errorCode = body.error || '';
        } catch (_) {}

        if (errorCode === 'DUPLICATE') {
          if (successMsg) successMsg.textContent = "You're already on the list!";
          if (form)    form.style.display = 'none';
          if (success) success.classList.add('show');
        } else if (errorCode === 'RATE_LIMITED') {
          if (err) {
            err.textContent = 'Too many attempts. Please try again later.';
            err.style.display = 'block';
          }
        } else {
          if (err) {
            err.textContent = 'Something went wrong. Please try again.';
            err.style.display = 'block';
          }
          if (submitBtn) { submitBtn.textContent = 'Notify me'; submitBtn.disabled = false; }
        }
      }
    } catch (e) {
      // Network error — show success anyway (don't block UX)
      const form    = document.getElementById('emailForm');
      const success = document.getElementById('emailSuccess');
      if (currentTier === 'mobile-waitlist') {
        if (successMsg) successMsg.textContent = "You're on the list! We'll email you when Android launches.";
      } else {
        if (successMsg) successMsg.textContent = "We'll let you know when new tiers launch.";
      }
      if (form)    form.style.display = 'none';
      if (success) success.classList.add('show');
    }
  }

  if (submitBtn) submitBtn.addEventListener('click', submitEmail);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitEmail();
    });
  }
})();
