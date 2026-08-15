// ========== Бургер-меню ==========
const burgerBtn = document.getElementById('burgerBtn');
const navbarContent = document.getElementById('navbarSupportedContent');

if (burgerBtn && navbarContent) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
  });

  document.querySelectorAll('#navbarSupportedContent .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navbarContent.classList.contains('show')) {
        new mdb.Collapse(navbarContent, { toggle: true });
        burgerBtn.classList.remove('active');
      }
    });
  });
}

// ========== Анімації + Sticky + ScrollTop ==========
document.addEventListener('DOMContentLoaded', () => {

  // 1. Фото і текст психолога
  const logo3 = document.querySelector('.logo3');
  const wrap2 = document.querySelector('.wrap2');
  if (logo3) setTimeout(() => logo3.classList.add('show'), 100);
  if (wrap2) setTimeout(() => wrap2.classList.add('show'), 500);

  // 2. Блоки освіти
  document.querySelectorAll('.wrap3').forEach((block, index) => {
    setTimeout(() => block.classList.add('show'), 200 * index);
  });

  // 3. IntersectionObserver для .pre_item і .slider
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.pre_item, .slider').forEach(el => {
    observer.observe(el);
  });

  // 4. Форма (Calendly блок)
  const formWrap = document.querySelector('.formz_wrap');
  if (formWrap) {
    const checkScroll = () => {
      const triggerBottom = window.innerHeight * 0.85;
      if (formWrap.getBoundingClientRect().top < triggerBottom) {
        formWrap.classList.add('active');
      }
    };
    window.addEventListener('scroll', checkScroll);
    checkScroll();
  }

  // 5. Sticky navbar shadow
  const navbar = document.getElementById('mainNavbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // 6. Кнопка «Нагору»
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
