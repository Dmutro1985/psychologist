// ========== Курс НБУ для сторінки цін ==========
(function () {
  const priceEls = document.querySelectorAll('.uslugi_money[data-uah]');
  if (!priceEls.length) return;

  const CACHE_KEY = 'nbu_rates_v1';
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  function applyRates(usd, eur) {
    if (!usd || !eur) return;
    priceEls.forEach((el) => {
      const uah = parseFloat(el.dataset.uah);
      if (!uah) return;
      const usdEl = el.querySelector('.price-usd');
      const eurEl = el.querySelector('.price-eur');
      if (usdEl) usdEl.textContent = Math.round(uah / usd);
      if (eurEl) eurEl.textContent = Math.round(uah / eur);
    });
  }

  // 1. Спробувати взяти свіжий кеш за сьогодні
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.date === today && cached.usd && cached.eur) {
      applyRates(cached.usd, cached.eur);
      return; // вже є актуальні дані
    }
  } catch (e) {}

  // 2. Запит безпосередньо до API НБУ (підтримує CORS *)
  const fetchRate = (valcode) =>
    fetch(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json&valcode=${valcode}`)
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) && data[0] && data[0].rate ? Number(data[0].rate) : null))
      .catch(() => null);

  Promise.all([fetchRate('usd'), fetchRate('eur')])
    .then(([usd, eur]) => {
      if (usd && eur) {
        applyRates(usd, eur);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, usd, eur }));
        } catch (e) {}
        return;
      }
      // Якщо прямий запит не вдався — пробуємо старий PHP-проксі (якщо він є)
      return fetch('./nbu-rates.php')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.usd && data.eur) {
            applyRates(data.usd, data.eur);
          }
        });
    })
    .catch(() => {
      // Курс не вдалося отримати — залишаємо значення за замовчуванням у розмітці
    });
})();

// ========== Кнопка "Записатися" на головному екрані → скрол до форми ==========
document.querySelectorAll('.js-scroll-to-booking').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const firstField = target.querySelector('input[name="name"]');
    if (firstField) {
      setTimeout(() => firstField.focus({ preventScroll: true }), 500);
    }
  });
});

// ========== Форма запису на консультацію ==========
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusEl = bookingForm.querySelector('.form-status');
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const formData = new FormData(bookingForm);

    submitBtn.disabled = true;
    statusEl.textContent = 'Надсилаємо...';
    statusEl.classList.remove('form-status-success', 'form-status-error');

    try {
      const res = await fetch('./send-form.php', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        statusEl.textContent = 'Дякуємо! Заявку надіслано, ми звʼяжемось із вами найближчим часом.';
        statusEl.classList.add('form-status-success');
        bookingForm.reset();
      } else {
        statusEl.textContent = data.error || 'Щось пішло не так. Спробуйте ще раз або напишіть у Telegram.';
        statusEl.classList.add('form-status-error');
      }
    } catch (err) {
      statusEl.textContent = 'Помилка зʼєднання. Спробуйте ще раз або напишіть у Telegram.';
      statusEl.classList.add('form-status-error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ========== Бургер-меню ==========
const burgerBtn = document.getElementById('burgerBtn');
const navbarContent = document.getElementById('navbarSupportedContent');

if (burgerBtn && navbarContent) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('active');
    const expanded = burgerBtn.classList.contains('active');
    burgerBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });

  document.querySelectorAll('#navbarSupportedContent .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navbarContent.classList.contains('show')) {
        new mdb.Collapse(navbarContent, { toggle: true });
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
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
