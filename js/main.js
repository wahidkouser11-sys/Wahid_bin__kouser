/* =========================================================
   main.js — UI + Firestore Rendering
   ========================================================= */

import './data.js';

(function () {
  'use strict';

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.querySelector('.header');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('open');
  });
  nav?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle?.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  function bindReveal() {
    const els = document.querySelectorAll('.reveal:not(.active)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('active'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  function bindNavSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(s => spy.observe(s));
  }

  function bindForm(data) {
    const form = document.getElementById('contactForm');
    const note = document.getElementById('formNote');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const newMsg = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        message: String(fd.get('message') || ''),
        time: Date.now()
      };

      try {
        const fresh = await PortfolioData.load();
        fresh.messages = fresh.messages || [];
        fresh.messages.unshift(newMsg);
        await PortfolioData.save(fresh);
      } catch (err) { console.warn('Message save failed:', err); }

      if (note) {
        note.textContent = '✅ Message sent! Thank you.';
        setTimeout(() => { note.textContent = ''; }, 5000);
      }
      form.reset();
    });
  }

  // ---------- RENDER ----------
  function renderHero(data) {
    const badge    = document.querySelector('.hero-badge');
    const title    = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    const desc     = document.querySelector('.hero-desc');

    if (badge) badge.textContent = data.hero.badge;
    if (title) title.innerHTML = `Hi, I'm <span class="gradient-text">${escapeHtml(data.hero.title.replace(/^Hi, I'm /, ''))}</span>`;
    if (subtitle) subtitle.innerHTML = data.hero.subtitle.replace(/\|/g, '<span class="sep">|</span>');
    if (desc) desc.textContent = data.hero.description;
  }

  function renderAbout(data) {
    const heading = document.querySelector('#about .section-title');
    if (heading) {
      const h = escapeHtml(data.about.heading);
      heading.innerHTML = h.replace(/building step by step\./i, '<span class="gradient-text">building step by step.</span>');
    }

    const textWrap = document.querySelector('.about-text');
    if (textWrap) {
      textWrap.innerHTML = data.about.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }

    const factsList = document.querySelector('.info-card ul');
    if (factsList) {
      factsList.innerHTML = data.about.facts.map(f =>
        `<li><span>${escapeHtml(f.label)}</span><strong>${escapeHtml(f.value)}</strong></li>`
      ).join('');
    }
  }

  function renderSkills(data) {
    const grid = document.querySelector('.skills-grid');
    if (!grid) return;

    const iconSvg = {
      code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      web:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      tools:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      ai:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/></svg>'
    };

    grid.innerHTML = data.skills.map(s => `
      <div class="skill-card reveal">
        <div class="skill-icon">${iconSvg[s.icon] || iconSvg.code}</div>
        <h3>${escapeHtml(s.title)}</h3>
        <div class="tags">
          ${s.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderEducation(data) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    timeline.innerHTML = data.education.map(e => `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <span class="timeline-period">${escapeHtml(e.period)}</span>
          <h3>${escapeHtml(e.degree)}</h3>
          <p class="timeline-place">${escapeHtml(e.place)}</p>
          ${e.meta && e.meta.length
            ? `<div class="timeline-meta">${e.meta.map(m => `<span>${escapeHtml(m)}</span>`).join('')}</div>`
            : ''}
          ${e.badge ? `<span class="timeline-badge">${escapeHtml(e.badge)}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderProjects(data) {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    grid.innerHTML = data.projects.map(p => {
      const hasGh   = p.github && p.github.trim();
      const hasDemo = p.demo && p.demo.trim();
      return `
        <article class="project-card reveal">
          <div class="project-top">
            <span class="project-cat">${escapeHtml(p.category)}</span>
            <span class="project-status">${escapeHtml(p.status)}</span>
          </div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="project-tags">
            ${p.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="project-actions">
            ${hasGh
              ? `<a href="${escapeAttr(p.github)}" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">GitHub</a>`
              : `<span class="btn btn-sm btn-ghost disabled">GitHub</span>`}
            ${hasDemo
              ? `<a href="${escapeAttr(p.demo)}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">Live Demo</a>`
              : `<span class="btn btn-sm btn-primary disabled">Live Demo</span>`}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderContact(data) {
    const links = document.querySelectorAll('.contact-link');
    if (!links.length) return;
    const map = [
      { key: 'email',    prefix: 'mailto:' },
      { key: 'github',   prefix: 'https://' },
      { key: 'linkedin', prefix: 'https://' }
    ];
    links.forEach((link, i) => {
      const m = map[i];
      if (!m) return;
      const val = data.contact[m.key] || '';
      link.setAttribute('href', val.startsWith('http') || val.startsWith('mailto') ? val : m.prefix + val);
      const strong = link.querySelector('strong');
      if (strong) strong.textContent = val;
    });
  }

  function renderAll(data) {
    renderHero(data);
    renderAbout(data);
    renderSkills(data);
    renderEducation(data);
    renderProjects(data);
    renderContact(data);
    bindReveal();
  }

  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function escapeAttr(str = '') { return escapeHtml(str); }

  // ---------- INIT ----------
  (async function init() {
    const data = await PortfolioData.load();
    renderAll(data);
    bindForm(data);
    bindNavSpy();

    PortfolioData.subscribe((updated) => {
      renderAll(updated);
    });
  })();

})();