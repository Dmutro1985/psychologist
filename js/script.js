// Бургер меню
const burgerBtn = document.getElementById('burgerBtn');
const navbarContent = document.getElementById('navbarSupportedContent');

burgerBtn.addEventListener('click', () => {
  burgerBtn.classList.toggle('active');
});

// Закриття меню при кліку на пункт
const navLinks = document.querySelectorAll('#navbarSupportedContent .nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navbarContent.classList.contains('show')) {
      // Використовуємо MDB Collapse для плавного закриття
      new mdb.Collapse(navbarContent, {toggle: true});
      burgerBtn.classList.remove('active');
    }
  });
});


/// Анімація появи фото і тексту
window.addEventListener('DOMContentLoaded', () => {
  const wrap2 = document.querySelector('.wrap2');
  const logo3 = document.querySelector('.logo3');

  // Спочатку фото
  setTimeout(() => {
    logo3.classList.add('show');
  }, 100); // через 100мс після завантаження

  // Потім текст
  setTimeout(() => {
    wrap2.classList.add('show');
  }, 500); // через 500мс після завантаження
});

// Анімація появи секції освіти
window.addEventListener('DOMContentLoaded', () => {
  const wrap3Blocks = document.querySelectorAll('.wrap3');

  wrap3Blocks.forEach((block, index) => {
    setTimeout(() => {
      block.classList.add('show');
    }, 200 * index); // Затримка між блоками 200мс
  });
});

// Анімація появи всіх секцій wrap3
window.addEventListener('DOMContentLoaded', () => {
  const wrap3Blocks = document.querySelectorAll('.wrap3');

  wrap3Blocks.forEach((block, index) => {
    setTimeout(() => {
      block.classList.add('show');
    }, 200 * index); // Кожен блок з’являється з інтервалом 200мс
  });
});


const preItems = document.querySelectorAll('.pre_item');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

preItems.forEach(item => observer.observe(item));

window.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.pre_item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target); // один раз показуємо
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => observer.observe(item));
});

// Анімація появи блоків при скролі
window.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.pre_item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show'); // додаємо клас для анімації
        observer.unobserve(entry.target);   // показуємо блок один раз
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => observer.observe(item));
});


// Анімація появи слайдера при скролі
window.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        slider.classList.add('show');
        observer.unobserve(slider);
      }
    });
  }, {threshold: 0.2});
  observer.observe(slider);
});



// Поява форми при скролі
document.addEventListener('DOMContentLoaded', function () {
  const formWrap = document.querySelector('.formz_wrap');

  function checkScroll() {
    const triggerBottom = window.innerHeight * 0.85;
    const formTop = formWrap.getBoundingClientRect().top;

    if (formTop < triggerBottom) {
      formWrap.classList.add('active');
    }
  }

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // перевірка відразу при завантаженні
});
