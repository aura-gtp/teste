/**
 * main.js — Aura Publicidade
 * Módulos: Navbar, Reveal Animations, Stats Counter,
 *          Clients Carousel, Portfolio Tabs, Video Player,
 *          Lightbox, Contact Form, WhatsApp Float.
 */

'use strict';

/* ─── UTILITÁRIOS ────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 1. NAVBAR ─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = $('#navbar');
  const toggle   = $('#nav-toggle');
  const navMenu  = $('#nav-menu');
  const navLinks = $$('.navbar__link');

  // Scroll → adiciona classe scrolled
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hambúrguer
  toggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha ao clicar em link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Active link por URL atual
  const path = window.location.pathname;
  navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href !== 'index.html' && path.includes(href)) {
      link.classList.add('active');
    } else if ((path.endsWith('/') || path.includes('index.html')) && href === 'index.html') {
      link.classList.add('active');
    }
  });
})();

/* ─── 2. REVEAL ANIMATIONS (IntersectionObserver) ──────────── */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ─── 3. CONTADOR DE ESTATÍSTICAS ───────────────────────────── */
(function initStats() {
  const statEls = $$('[data-count]');
  if (!statEls.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el) => {
    const target  = parseFloat(el.dataset.count);
    const prefix  = el.dataset.prefix || '';
    const suffix  = el.dataset.suffix || '';
    const isFloat = String(target).includes('.');
    const duration = 1800;
    let start = null;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased    = easeOut(progress);
      const value    = target * eased;
      el.textContent = prefix + (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (isFloat ? target.toFixed(1) : target) + suffix;
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    statEls.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
})();

/* ─── 4. CARROSSEL DE CLIENTES (CSS + JS fallback) ─────────── */
(function initClientsCarousel() {
  const track = $('#clients-track');
  if (!track) return;

  // Gera logos a partir dos 20 arquivos da pasta clientes/
  const logos = Array.from({ length: 20 }, (_, i) => `${i + 1}.png`);

  const buildLogos = (list) => list.map(file => {
    const div = document.createElement('div');
    div.className = 'clients__logo';
    const img = document.createElement('img');
    img.src     = `clientes/${file}`;
    img.alt     = `Logo de cliente da Aura Publicidade`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width  = 110;
    img.height = 50;
    img.onerror = () => { div.style.display = 'none'; };
    div.appendChild(img);
    return div;
  });

  // Duplica para loop infinito
  [...buildLogos(logos), ...buildLogos(logos)].forEach(el => track.appendChild(el));
})();

/* ─── 5. ABAS DO PORTFÓLIO ──────────────────────────────────── */
(function initPortfolioTabs() {
  const tabs   = $$('.portfolio-tab');
  const panels = $$('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        const isTarget = panel.id === `tab-${target}`;
        panel.hidden = !isTarget;
      });
    });
  });
})();

/* ─── 6. PLAYER DE VÍDEO (lazy iframe) ──────────────────────── */
(function initVideoPlayers() {
  const videoWrappers = $$('.video-item__wrapper');

  const loadVideo = (wrapper) => {
    const videoId  = wrapper.dataset.videoId;
    if (!videoId) return;

    const playDiv  = wrapper.querySelector('.video-item__play');
    const thumbImg = wrapper.querySelector('.video-item__thumb');

    // Remove thumb e play, insere iframe
    if (thumbImg) thumbImg.remove();
    if (playDiv)  playDiv.classList.add('hidden');

    const iframe = document.createElement('iframe');
    iframe.src     = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title   = 'Vídeo de portfólio Aura Publicidade';
    iframe.allow   = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.classList.add('active');

    wrapper.appendChild(iframe);
  };

  videoWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', () => loadVideo(wrapper));
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadVideo(wrapper);
      }
    });
  });
})();

/* ─── 7. LIGHTBOX ───────────────────────────────────────────── */
(function initLightbox() {
  const lightbox    = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const closeBtn    = $('#lightbox-close');
  if (!lightbox || !lightboxImg) return;

  const open = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  };

  $$('.creative-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src || item.querySelector('img')?.src;
      const alt = item.querySelector('img')?.alt || '';
      if (src) open(src, alt);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const src = item.dataset.src || item.querySelector('img')?.src;
        const alt = item.querySelector('img')?.alt || '';
        if (src) open(src, alt);
      }
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('open')) close(); });
})();

/* ─── 8. FORMULÁRIO DE CONTATO ──────────────────────────────── */
(function initContactForm() {
  const form     = $('#contact-form');
  const feedback = $('#form-feedback');
  const submitBtn = $('#form-submit');
  const btnText   = $('#btn-text');
  const btnIcon   = $('#btn-icon');
  const btnSpinner = $('#btn-spinner');
  if (!form) return;

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? 'Enviando...' : 'Enviar mensagem';
    btnIcon.style.display   = loading ? 'none' : '';
    btnSpinner.style.display = loading ? '' : 'none';
  };

  const showFeedback = (type, message) => {
    feedback.className = `form__feedback ${type}`;
    const icon = type === 'success'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    feedback.innerHTML = icon + message;
  };

  // Máscara de telefone
  const whatsappInput = $('#whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', () => {
      let v = whatsappInput.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d+)$/, '($1) $2');
      }
      whatsappInput.value = v;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validação básica
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ff7070';
        field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
      }
    });
    if (!valid) {
      showFeedback('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    feedback.className = 'form__feedback';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, { method: 'POST', body: data });
      const json = await res.json();

      if (json.success) {
        showFeedback('success', 'Mensagem enviada com sucesso! Entraremos em contato em breve. 🎉');
        form.reset();
      } else {
        showFeedback('error', json.message || 'Erro ao enviar. Tente pelo WhatsApp.');
      }
    } catch {
      showFeedback('error', 'Erro de conexão. Fale conosco pelo WhatsApp: (49) 92000-6769');
    } finally {
      setLoading(false);
    }
  });
})();

/* ─── 9. SCROLL SUAVE PARA ÂNCORAS ─────────────────────────── */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
})();

