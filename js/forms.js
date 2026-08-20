// forms.js — validação client-side do formulário de orçamento. Feedback acessível via aria-live.

(() => {
  'use strict';

  const form = document.querySelector('[data-quote-form]');
  if (!form) return;

  const rules = {
    nome: { required: true, minLength: 3, message: 'Informe seu nome completo.' },
    empresa: { required: true, minLength: 2, message: 'Informe o nome da empresa ou propriedade.' },
    telefone: {
      required: true,
      pattern: /^[\d\s()+-]{8,20}$/,
      message: 'Informe um telefone/WhatsApp válido, com DDD.',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Informe um e-mail válido.',
    },
  };

  function fieldWrap(input) {
    return input.closest('.form-field');
  }

  function setError(input, message) {
    const wrap = fieldWrap(input);
    if (!wrap) return;
    wrap.classList.toggle('has-error', Boolean(message));
    const errorEl = wrap.querySelector('.form-error');
    if (errorEl) errorEl.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const value = input.value.trim();

    if (rule.required && value.length === 0) {
      setError(input, rule.message);
      return false;
    }
    if (rule.minLength && value.length < rule.minLength) {
      setError(input, rule.message);
      return false;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      setError(input, rule.message);
      return false;
    }
    setError(input, '');
    return true;
  }

  Object.keys(rules).forEach((name) => {
    const input = form.elements.namedItem(name);
    if (input) {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (fieldWrap(input)?.classList.contains('has-error')) validateField(input);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    let valid = true;
    Object.keys(rules).forEach((name) => {
      const input = form.elements.namedItem(name);
      if (input && !validateField(input)) valid = false;
    });

    if (!valid) {
      e.preventDefault();
      const firstInvalid = form.querySelector('.has-error input, .has-error textarea');
      firstInvalid?.focus();
    }
    // Se válido, o formulário segue seu envio nativo (Netlify Forms) até /orcamento-recebido.html
  });
})();
