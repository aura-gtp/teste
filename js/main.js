// main.js — navegação, CTA fixo, WhatsApp e carrossel de produto. Vanilla JS, zero dependências.

(() => {
  'use strict';

  /* ===== Hero em vídeo — só ativa em telas >=768px, sem "reduzir movimento" e sem
     Data Saver. A <img> de fundo já está no DOM e cobre 100% dos casos em que o
     vídeo não entra ou falha; o <video> nunca começa a baixar nada sem passar
     nessas checagens (preload="none", sem <source> no HTML). ===== */
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    const saveData = navigator.connection && navigator.connection.saveData;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const qualifies = window.innerWidth >= 768 && !reducedMotion && !saveData;

    if (qualifies) {
      const webm = document.createElement('source');
      webm.src = '/assets/videos/hero.webm';
      webm.type = 'video/webm';
      const mp4 = document.createElement('source');
      mp4.src = '/assets/videos/hero.mp4';
      mp4.type = 'video/mp4';
      heroVideo.append(webm, mp4);

      heroVideo.addEventListener('loadeddata', () => heroVideo.classList.add('is-playing'));
      heroVideo.addEventListener('error', () => heroVideo.classList.remove('is-playing'));

      heroVideo.load();
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* autoplay bloqueado ou falha silenciosa — a imagem de fundo permanece visível */
        });
      }
    }
  }

  /* ===== Menu mobile ===== */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    const closeNav = () => {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    const openNav = () => {
      mobileNav.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('is-open');
      isOpen ? closeNav() : openNav();
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ===== CTA fixo (sticky) — aparece após passar a seção Hero, some perto do rodapé
     (senão a barra fixa cobre o crédito "Desenvolvido por" em páginas curtas) ===== */
  const stickyCta = document.querySelector('.sticky-cta');
  const heroSection = document.querySelector('[data-hero]');
  const footer = document.querySelector('.site-footer');

  if (stickyCta) {
    let pastHero = !heroSection;
    let atFooter = false;

    const updateStickyCta = () => {
      stickyCta.classList.toggle('is-visible', pastHero && !atFooter);
    };

    if (heroSection && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            pastHero = !entry.isIntersecting;
            updateStickyCta();
          });
        },
        { rootMargin: '-10% 0px 0px 0px' }
      );
      heroObserver.observe(heroSection);
    } else {
      window.addEventListener('scroll', () => {
        pastHero = window.scrollY > 480;
        updateStickyCta();
      }, { passive: true });
    }

    if (footer && 'IntersectionObserver' in window) {
      const footerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            atFooter = entry.isIntersecting;
            updateStickyCta();
          });
        },
        { rootMargin: '0px 0px -1px 0px' }
      );
      footerObserver.observe(footer);
    }
  }

  /* ===== Carrossel de produto ===== */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;
    const AUTO_MS = 10000;

    const dots = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Ir para imagem ${i + 1} de ${slides.length}`);
      btn.addEventListener('click', () => goTo(i, true));
      dotsWrap?.appendChild(btn);
      return btn;
    });

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    }

    function goTo(i, isManual) {
      index = (i + slides.length) % slides.length;
      render();
      if (isManual) restartAuto();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function restartAuto() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, AUTO_MS);
    }

    prevBtn?.addEventListener('click', () => goTo(index - 1, true));
    nextBtn?.addEventListener('click', () => goTo(index + 1, true));

    carousel.addEventListener('mouseenter', () => timer && clearInterval(timer));
    carousel.addEventListener('mouseleave', restartAuto);

    render();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      restartAuto();
    }
  });

  /* ===== Ano corrente no rodapé ===== */
  document.querySelectorAll('[data-current-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
