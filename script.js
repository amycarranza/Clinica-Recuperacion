// ===== Header que cambia al hacer scroll =====
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Menú móvil =====
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

function toggleMenu(open) {
  menu.classList.toggle('open', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
}

hamburger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));

// ===== Enlace activo según la sección visible =====
const links = document.querySelectorAll('.menu-link');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));

// ===== Elementos que aparecen al hacer scroll =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    // Escalonado entre tarjetas hermanas; se quita al terminar para no retrasar el hover
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = siblings.indexOf(el) * 0.1 + 's';
    el.classList.add('visible');
    el.addEventListener('transitionend', () => (el.style.transitionDelay = ''), { once: true });
    revealObserver.unobserve(el);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Formulario con validación =====
const form = document.getElementById('form');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');

const rules = {
  nombre: v => v.trim().length >= 3 || 'Ingresa tu nombre completo (mínimo 3 letras).',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Ingresa un correo válido.',
  telefono: v => v.replace(/\D/g, '').length >= 8 || 'Ingresa un teléfono válido (mínimo 8 dígitos).',
  servicio: v => v !== '' || 'Selecciona un servicio.'
};

function validate(input) {
  const result = rules[input.name](input.value);
  const field = input.closest('.field');
  const message = result === true ? '' : result;
  field.classList.toggle('invalid', !!message);
  field.querySelector('.error').textContent = message;
  return !message;
}

Object.keys(rules).forEach(name => {
  const input = form.elements[name];
  input.addEventListener('blur', () => validate(input));
  input.addEventListener('input', () => input.closest('.field').classList.contains('invalid') && validate(input));
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const inputs = Object.keys(rules).map(name => form.elements[name]);
  const valid = inputs.map(validate).every(Boolean);
  if (!valid) {
    inputs.find(i => i.closest('.field').classList.contains('invalid')).focus();
    return;
  }
  const nombre = form.elements.nombre.value.trim().split(' ')[0];
  document.getElementById('modal-text').textContent =
    `Gracias, ${nombre}. Recibimos tu solicitud para ${form.elements.servicio.value}. Te contactaremos en menos de 24 h para confirmar tu cita.`;
  openModal();
  form.reset();
});

// ===== Modal de confirmación =====
function openModal() {
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('show'));
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove('show');
  setTimeout(() => (modal.hidden = true), 300);
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => e.target === modal && closeModal());
document.addEventListener('keydown', e => e.key === 'Escape' && !modal.hidden && closeModal());
