/* ============================================================
   Cherish 博客 · 动态交互脚本
   主题切换 / 阅读进度 / 回到顶部 / 滚动入场 / 打字机 / 粒子网络
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------------- 主题切换 ---------------- */
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('blog-theme', next); } catch (e) {}
    });
  }

  /* ---------------- 阅读进度条 + 回到顶部 ---------------- */
  var bar = document.getElementById('progress-bar');
  var topBtn = document.getElementById('back-to-top');

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
    if (topBtn) topBtn.classList.toggle('show', h.scrollTop > 420);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (topBtn) {
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- 滚动入场（IntersectionObserver） ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      // 首页列表交错入场
      if (el.classList.contains('post-card')) {
        el.style.transitionDelay = Math.min(i, 6) * 90 + 'ms';
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- 打字机效果 ---------------- */
  var typed = document.getElementById('typed');
  if (typed) {
    var phrases = JSON.parse(typed.getAttribute('data-phrases') || '[]');
    var pi = 0, ci = 0, deleting = false;

    function tick() {
      var word = phrases[pi];
      typed.textContent = word.slice(0, ci);

      if (!deleting && ci < word.length) {
        ci++;
        setTimeout(tick, 85);                       // 打字
      } else if (deleting && ci > 0) {
        ci--;
        setTimeout(tick, 38);                        // 删除
      } else {
        if (!deleting) {
          deleting = true;
          setTimeout(tick, 1800);                    // 停留
        } else {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 300);
        }
      }
    }
    tick();
  }

  /* ---------------- 粒子网络背景（Canvas） ---------------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('bg-canvas');

  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var rafId = null;

    // 根据屏幕大小决定粒子数量，保证性能
    var COUNT = Math.min(
      85,
      Math.max(30, Math.floor(window.innerWidth * window.innerHeight / 22000))
    );
    var LINK_DIST = 130;          // 粒子连线距离
    var MOUSE_RADIUS = 150;       // 鼠标影响半径

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          r: Math.random() * 1.8 + 0.7
        });
      }
    }

    function palette() {
      return root.getAttribute('data-theme') === 'light'
        ? { dot: '59, 91, 219',  line: '59, 91, 219' }
        : { dot: '139, 156, 255', line: '110, 160, 255' };
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      var c = palette();

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // 鼠标轻微吸引
        var mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < MOUSE_RADIUS * MOUSE_RADIUS) {
          p.x += mdx * 0.0016;
          p.y += mdy * 0.0016;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + c.dot + ', 0.75)';
        ctx.fill();
      }

      // 粒子间连线
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var p1 = particles[a], p2 = particles[b];
          var dx = p1.x - p2.x, dy = p1.y - p2.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var alpha = 0.16 * (1 - d2 / (LINK_DIST * LINK_DIST));
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(' + c.line + ', ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(frame);
    }

    resize();
    initParticles();
    frame();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); initParticles(); }, 200);
    });

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    // 标签页隐藏时暂停动画，省电
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        rafId = requestAnimationFrame(frame);
      }
    });
  }
})();
