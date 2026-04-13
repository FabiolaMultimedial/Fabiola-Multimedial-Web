/* ================================================
   FABIOLA MULTIMEDIAL — SCRIPT.JS
   1. Tags orgánicas con física de repulsión al mouse
   2. Carrusel del portfolio
   3. Servicios: toggle en click (móvil) / hover (desktop)
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* =============================================
     1. TAGS ORGÁNICAS — Física de partículas
     ============================================= */
  var heroSection = document.querySelector('.hero');
  var tags = Array.from(document.querySelectorAll('.htag'));
  var mouse = { x: -9999, y: -9999 };
  var heroRect = { left: 0, top: 0, width: 0, height: 0 };

  /* Estado de cada tag */
  var tagStates = tags.map(function (el, i) {
    /* Leer posición inicial del CSS (aproximada) */
    var rect = el.getBoundingClientRect();
    return {
      el: el,
      x: rect.left - heroSection.getBoundingClientRect().left,
      y: rect.top  - heroSection.getBoundingClientRect().top,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      ox: rect.left - heroSection.getBoundingClientRect().left,  /* origen */
      oy: rect.top  - heroSection.getBoundingClientRect().top
    };
  });

  function updateHeroRect() {
    heroRect = heroSection.getBoundingClientRect();
  }
  updateHeroRect();
  window.addEventListener('resize', updateHeroRect);

  heroSection.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX - heroRect.left;
    mouse.y = e.clientY - heroRect.top;
  });
  heroSection.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  var REPULSION   = 8000;   /* fuerza de repulsión */
  var REPEL_DIST  = 140;    /* distancia de efecto (px) */
  var RETURN      = 0.03;   /* fuerza de retorno al origen */
  var DAMPING     = 0.88;   /* amortiguación */
  var FLOAT_FORCE = 0.015;  /* flotación suave */

  function animateTags() {
    tagStates.forEach(function (s) {
      var elW = s.el.offsetWidth;
      var elH = s.el.offsetHeight;
      var cx  = s.x + elW / 2;
      var cy  = s.y + elH / 2;

      /* Distancia al mouse */
      var dx   = cx - mouse.x;
      var dy   = cy - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;

      /* Repulsión */
      if (dist < REPEL_DIST) {
        var force = REPULSION / (dist * dist);
        s.vx += (dx / dist) * force * 0.016;
        s.vy += (dy / dist) * force * 0.016;
      }

      /* Retorno suave al origen */
      s.vx += (s.ox - s.x) * RETURN;
      s.vy += (s.oy - s.y) * RETURN;

      /* Flotación orgánica */
      s.vy += Math.sin(Date.now() * 0.001 + s.ox * 0.01) * FLOAT_FORCE;
      s.vx += Math.cos(Date.now() * 0.0008 + s.oy * 0.01) * FLOAT_FORCE * 0.5;

      /* Aplicar física */
      s.vx *= DAMPING;
      s.vy *= DAMPING;
      s.x  += s.vx;
      s.y  += s.vy;

      /* Límites del hero */
      var maxX = heroRect.width  - elW - 10;
      var maxY = heroRect.height - elH - 10;
      if (s.x < 10)   { s.x = 10;   s.vx = Math.abs(s.vx) * 0.5; }
      if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx) * 0.5; }
      if (s.y < 70)   { s.y = 70;   s.vy = Math.abs(s.vy) * 0.5; }
      if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy) * 0.5; }

      s.el.style.left      = s.x + 'px';
      s.el.style.top       = s.y + 'px';
      s.el.style.position  = 'absolute';
    });

    requestAnimationFrame(animateTags);
  }

  /* Esperar a que el layout esté listo antes de arrancar la animación */
  setTimeout(function () {
    updateHeroRect();
    tagStates.forEach(function (s) {
      var rect = s.el.getBoundingClientRect();
      s.x  = rect.left - heroRect.left;
      s.y  = rect.top  - heroRect.top;
      s.ox = s.x;
      s.oy = s.y;
    });
    animateTags();
  }, 200);


  /* =============================================
     2. CARRUSEL DEL PORTFOLIO
     ============================================= */
  var carousel = document.getElementById('carousel');
  if (carousel) {
    var slides   = carousel.querySelectorAll('.slide');
    var totalSl  = slides.length;
    var dotsWrap = document.getElementById('dots');
    var curSlide = 0;
    var startX   = 0;
    var dragging = false;

    if (document.getElementById('total')) {
      document.getElementById('total').textContent = totalSl;
    }

    /* Crear dots */
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' dot--active' : '');
      dot.setAttribute('aria-label', 'Ir al proyecto ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      curSlide = (index + totalSl) % totalSl;
      carousel.style.transform = 'translateX(-' + (curSlide * 100) + '%)';
      if (document.getElementById('current')) {
        document.getElementById('current').textContent = curSlide + 1;
      }
      dotsWrap.querySelectorAll('.dot').forEach(function (d, i) {
        d.classList.toggle('dot--active', i === curSlide);
      });
    }

    document.getElementById('prev').addEventListener('click', function () { goTo(curSlide - 1); });
    document.getElementById('next').addEventListener('click', function () { goTo(curSlide + 1); });

    /* Touch swipe */
    carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend',   function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? curSlide + 1 : curSlide - 1); }
    });

    /* Mouse drag */
    carousel.addEventListener('mousedown',  function (e) { startX = e.clientX; dragging = true; });
    carousel.addEventListener('mouseup',    function (e) {
      if (!dragging) return;
      var diff = startX - e.clientX;
      if (Math.abs(diff) > 60) { goTo(diff > 0 ? curSlide + 1 : curSlide - 1); }
      dragging = false;
    });
    carousel.addEventListener('mouseleave', function () { dragging = false; });

    /* Teclado (solo cuando el portfolio es visible) */
    document.addEventListener('keydown', function (e) {
      var pf = document.getElementById('portfolio');
      var rect = pf.getBoundingClientRect();
      var inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') goTo(curSlide + 1);
      if (e.key === 'ArrowLeft')  goTo(curSlide - 1);
    });
  }


  /* =============================================
     3. SERVICIOS — Toggle en click (móvil)
     En desktop el hover lo maneja CSS.
     En móvil añadimos clase .active al click.
     ============================================= */
  var svcCards = document.querySelectorAll('.svc');
  var isMobile = window.matchMedia('(pointer: coarse)').matches;

  if (isMobile) {
    svcCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var isActive = card.classList.contains('active');
        /* Cerrar todas */
        svcCards.forEach(function (c) { c.classList.remove('active'); });
        /* Abrir esta si no estaba activa */
        if (!isActive) { card.classList.add('active'); }
      });
    });
  }

});
