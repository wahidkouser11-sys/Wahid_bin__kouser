/* =========================================================
   admin.js — Admin Panel (Firebase Auth + Firestore)
   ========================================================= */

import { auth } from './firebase.js';
import './data.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

(function () {
  'use strict';

  // ---------- DOM ----------
  const loginWrap  = document.getElementById('loginWrap');
  const adminShell = document.getElementById('adminShell');
  const loginForm  = document.getElementById('loginForm');
  const loginUser  = document.getElementById('loginUser');
  const loginPass  = document.getElementById('loginPass');
  const loginNote  = document.getElementById('loginNote');
  const logoutBtn  = document.getElementById('logoutBtn');
  const saveAllBtn = document.getElementById('saveAllBtn');
  const saveStatus = document.getElementById('saveStatus');
  const pageTitle  = document.getElementById('pageTitle');

  let data = null;
  let unsubscribe = null;

  // =========================================================
  // AUTH
  // =========================================================
  function showDashboard() {
    loginWrap.style.display = 'none';
    adminShell.hidden = false;
    loadAndRender();
  }

  function showLogin() {
    loginWrap.style.display = 'grid';
    adminShell.hidden = true;
    if (unsubscribe) unsubscribe();
  }

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginUser.value.trim();
    const pass  = loginPass.value;

    try {
      loginNote.textContent = 'Logging in...';
      loginNote.style.color = '#9a9aab';
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error(err);
      loginNote.textContent = '❌ ' + (err.code || 'Login failed');
      loginNote.style.color = '#ff8a8a';
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await signOut(auth);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginNote.textContent = '';
      showDashboard();
    } else {
      showLogin();
    }
  });

  // =========================================================
  // LOAD & RENDER
  // =========================================================
  async function loadAndRender() {
    data = await PortfolioData.load();
    renderAll();

    unsubscribe = PortfolioData.subscribe((updated) => {
      data = updated;
      renderAll();
    });
  }

  function persist(silent = true) {
    PortfolioData.save(data).then(ok => {
      if (!silent) flashSaved();
      refreshStats();
    });
  }

  function flashSaved() {
    if (!saveStatus) return;
    saveStatus.classList.add('show');
    saveStatus.textContent = 'All changes saved ✓';
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(() => saveStatus.classList.remove('show'), 1800);
  }

  saveAllBtn?.addEventListener('click', () => persist(false));

  // =========================================================
  // TABS
  // =========================================================
  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const tabs    = document.querySelectorAll('.admin-tab');

  function switchTab(name) {
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    const btn = [...navBtns].find(b => b.dataset.tab === name);
    if (btn) pageTitle.textContent = btn.textContent.replace(/\d+/g, '').trim();
  }
  navBtns.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.querySelectorAll('.quick-btn').forEach(b =>
    b.addEventListener('click', () => switchTab(b.dataset.goto)));

  // =========================================================
  // STATS
  // =========================================================
  function refreshStats() {
    if (!data) return;
    document.getElementById('statSkills').textContent    = data.skills.length;
    document.getElementById('statProjects').textContent  = data.projects.length;
    document.getElementById('statEducation').textContent = data.education.length;
    document.getElementById('statMessages').textContent  = data.messages.length;
    document.getElementById('msgCount').textContent      = data.messages.length;
  }

  // =========================================================
  // HERO
  // =========================================================
  function bindHero() {
    const map = {
      heroBadge: 'badge', heroTitle: 'title',
      heroSubtitle: 'subtitle', heroDesc: 'description'
    };
    Object.entries(map).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = data.hero[key] || '';
      el.oninput = () => { data.hero[key] = el.value; persist(); };
    });
  }

  // =========================================================
  // ABOUT
  // =========================================================
  function renderAbout() {
    document.getElementById('aboutHeading').value = data.about.heading || '';

    const pWrap = document.getElementById('aboutParagraphs');
    pWrap.innerHTML = data.about.paragraphs.map((text, i) => `
      <div class="repeat-row">
        <div class="row-head">
          <strong>Paragraph ${i + 1}</strong>
          <div class="row-actions">
            <button class="icon-btn danger" data-del-para="${i}">✕</button>
          </div>
        </div>
        <textarea rows="3" data-para="${i}">${escapeHtml(text)}</textarea>
      </div>
    `).join('');

    pWrap.querySelectorAll('textarea[data-para]').forEach(ta => {
      ta.oninput = () => { data.about.paragraphs[+ta.dataset.para] = ta.value; persist(); };
    });
    pWrap.querySelectorAll('[data-del-para]').forEach(btn => {
      btn.onclick = () => {
        data.about.paragraphs.splice(+btn.dataset.delPara, 1);
        persist(); renderAbout();
      };
    });

    const fWrap = document.getElementById('aboutFacts');
    fWrap.innerHTML = data.about.facts.map((f, i) => `
      <div class="repeat-row">
        <div class="row-head">
          <strong>Fact ${i + 1}</strong>
          <div class="row-actions">
            <button class="icon-btn danger" data-del-fact="${i}">✕</button>
          </div>
        </div>
        <div class="two-col">
          <input type="text" placeholder="Label" value="${escapeAttr(f.label)}" data-fact-label="${i}">
          <input type="text" placeholder="Value" value="${escapeAttr(f.value)}" data-fact-value="${i}">
        </div>
      </div>
    `).join('');

    fWrap.querySelectorAll('[data-fact-label]').forEach(inp => {
      inp.oninput = () => { data.about.facts[+inp.dataset.factLabel].label = inp.value; persist(); };
    });
    fWrap.querySelectorAll('[data-fact-value]').forEach(inp => {
      inp.oninput = () => { data.about.facts[+inp.dataset.factValue].value = inp.value; persist(); };
    });
    fWrap.querySelectorAll('[data-del-fact]').forEach(btn => {
      btn.onclick = () => {
        data.about.facts.splice(+btn.dataset.delFact, 1);
        persist(); renderAbout();
      };
    });

    document.getElementById('aboutHeading').oninput = (e) => {
      data.about.heading = e.target.value; persist();
    };
    document.getElementById('addAboutPara').onclick = () => {
      data.about.paragraphs.push(''); persist(); renderAbout();
    };
    document.getElementById('addFact').onclick = () => {
      data.about.facts.push({ label: 'New', value: '' }); persist(); renderAbout();
    };
  }

  // =========================================================
  // SKILLS
  // =========================================================
  function renderSkills() {
    const wrap = document.getElementById('skillsList');
    wrap.innerHTML = data.skills.map((s, i) => `
      <div class="repeat-row">
        <div class="row-head">
          <strong>Skill #${i + 1}</strong>
          <div class="row-actions">
            <button class="icon-btn danger" data-del-skill="${i}">✕</button>
          </div>
        </div>
        <input type="text" placeholder="Category title" value="${escapeAttr(s.title)}" data-skill-title="${i}">
        <input type="text" placeholder="Tags (comma separated)" value="${escapeAttr(s.tags.join(', '))}" data-skill-tags="${i}">
      </div>
    `).join('');

    wrap.querySelectorAll('[data-skill-title]').forEach(inp => {
      inp.oninput = () => { data.skills[+inp.dataset.skillTitle].title = inp.value; persist(); };
    });
    wrap.querySelectorAll('[data-skill-tags]').forEach(inp => {
      inp.oninput = () => {
        data.skills[+inp.dataset.skillTags].tags = inp.value.split(',').map(t => t.trim()).filter(Boolean);
        persist();
      };
    });
    wrap.querySelectorAll('[data-del-skill]').forEach(btn => {
      btn.onclick = () => {
        data.skills.splice(+btn.dataset.delSkill, 1);
        persist(); renderSkills();
      };
    });
  }
  document.getElementById('addSkill')?.addEventListener('click', () => {
    data.skills.push({ id: 's' + Date.now(), title: 'New Skill', icon: 'code', tags: [] });
    persist(); renderSkills();
  });

  // =========================================================
  // EDUCATION
  // =========================================================
  function renderEducation() {
    const wrap = document.getElementById('eduList');
    wrap.innerHTML = data.education.map((e, i) => `
      <div class="repeat-row">
        <div class="row-head">
          <strong>Entry #${i + 1}</strong>
          <div class="row-actions">
            <button class="icon-btn danger" data-del-edu="${i}">✕</button>
          </div>
        </div>
        <div class="two-col">
          <input type="text" placeholder="Period" value="${escapeAttr(e.period)}" data-edu-period="${i}">
          <input type="text" placeholder="Badge (optional)" value="${escapeAttr(e.badge || '')}" data-edu-badge="${i}">
        </div>
        <input type="text" placeholder="Degree / Certificate" value="${escapeAttr(e.degree)}" data-edu-degree="${i}">
        <input type="text" placeholder="Institution" value="${escapeAttr(e.place)}" data-edu-place="${i}">
        <input type="text" placeholder="Meta (comma separated)" value="${escapeAttr((e.meta || []).join(', '))}" data-edu-meta="${i}">
      </div>
    `).join('');

    const bind = (sel, key, tf) => {
      wrap.querySelectorAll(sel).forEach(inp => {
        inp.oninput = () => {
          const idx = +inp.getAttribute(sel.match(/\[(.*?)\]/)[1]);
          data.education[idx][key] = tf ? tf(inp.value) : inp.value;
          persist();
        };
      });
    };
    bind('[data-edu-period]', 'period');
    bind('[data-edu-badge]',  'badge');
    bind('[data-edu-degree]', 'degree');
    bind('[data-edu-place]',  'place');
    bind('[data-edu-meta]',   'meta', v => v.split(',').map(t => t.trim()).filter(Boolean));

    wrap.querySelectorAll('[data-del-edu]').forEach(btn => {
      btn.onclick = () => {
        data.education.splice(+btn.dataset.delEdu, 1);
        persist(); renderEducation();
      };
    });
  }
  document.getElementById('addEdu')?.addEventListener('click', () => {
    data.education.push({
      id: 'e' + Date.now(), period: '2025', degree: 'New Degree',
      place: 'Institution', meta: [], badge: ''
    });
    persist(); renderEducation();
  });

  // =========================================================
  // PROJECTS
  // =========================================================
  function renderProjects() {
    const wrap = document.getElementById('projectsList');
    wrap.innerHTML = data.projects.map((p, i) => `
      <div class="repeat-row">
        <div class="row-head">
          <strong>${escapeHtml(p.title || 'Untitled')}</strong>
          <div class="row-actions">
            <button class="icon-btn danger" data-del-proj="${i}">✕</button>
          </div>
        </div>
        <div class="two-col">
          <input type="text" placeholder="Category" value="${escapeAttr(p.category)}" data-proj-cat="${i}">
          <input type="text" placeholder="Status" value="${escapeAttr(p.status)}" data-proj-status="${i}">
        </div>
        <input type="text" placeholder="Title" value="${escapeAttr(p.title)}" data-proj-title="${i}">
        <textarea rows="2" placeholder="Description" data-proj-desc="${i}">${escapeHtml(p.description)}</textarea>
        <input type="text" placeholder="Tags (comma separated)" value="${escapeAttr(p.tags.join(', '))}" data-proj-tags="${i}">
        <div class="two-col">
          <input type="text" placeholder="GitHub URL" value="${escapeAttr(p.github)}" data-proj-gh="${i}">
          <input type="text" placeholder="Live Demo URL" value="${escapeAttr(p.demo)}" data-proj-demo="${i}">
        </div>
      </div>
    `).join('');

    const bind = (sel, key, tf) => {
      wrap.querySelectorAll(sel).forEach(inp => {
        inp.oninput = () => {
          const idx = +inp.getAttribute(sel.match(/\[(.*?)\]/)[1]);
          data.projects[idx][key] = tf ? tf(inp.value) : inp.value;
          persist();
        };
      });
    };
    bind('[data-proj-cat]',    'category');
    bind('[data-proj-status]', 'status');
    bind('[data-proj-title]',  'title');
    bind('[data-proj-desc]',   'description');
    bind('[data-proj-tags]',   'tags', v => v.split(',').map(t => t.trim()).filter(Boolean));
    bind('[data-proj-gh]',     'github');
    bind('[data-proj-demo]',   'demo');

    wrap.querySelectorAll('[data-del-proj]').forEach(btn => {
      btn.onclick = () => {
        data.projects.splice(+btn.dataset.delProj, 1);
        persist(); renderProjects();
      };
    });
  }
  document.getElementById('addProject')?.addEventListener('click', () => {
    data.projects.push({
      id: 'p' + Date.now(), category: 'Web', status: 'Planned',
      title: 'New Project', description: '', tags: [], github: '', demo: ''
    });
    persist(); renderProjects();
  });

  // =========================================================
  // CONTACT
  // =========================================================
  function bindContact() {
    const map = {
      contactEmail: 'email', contactGithub: 'github', contactLinkedin: 'linkedin'
    };
    Object.entries(map).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = data.contact[key] || '';
      el.oninput = () => { data.contact[key] = el.value; persist(); };
    });
  }

  // =========================================================
  // MESSAGES
  // =========================================================
  function renderMessages() {
    const wrap = document.getElementById('messagesList');
    if (!wrap) return;
    if (!data.messages.length) {
      wrap.innerHTML = `<div class="empty-state">📭 No messages yet.</div>`;
      return;
    }
    wrap.innerHTML = data.messages.map(m => `
      <div class="msg-card">
        <div class="msg-head">
          <strong>${escapeHtml(m.name)}</strong>
          <small>${new Date(m.time).toLocaleString()}</small>
        </div>
        <p>${escapeHtml(m.message)}</p>
        <a href="mailto:${escapeAttr(m.email)}">${escapeHtml(m.email)}</a>
      </div>
    `).join('');
  }
  document.getElementById('clearMessages')?.addEventListener('click', () => {
    if (!confirm('Delete all messages?')) return;
    data.messages = [];
    persist(); renderMessages();
  });

  // =========================================================
  // SETTINGS
  // =========================================================
  document.getElementById('exportBtn')?.addEventListener('click', () => {
    PortfolioData.export(data);
  });

  document.getElementById('importFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    PortfolioData.import(file, (err, imported) => {
      if (err) return alert('Invalid JSON file.');
      data = { ...data, ...imported };
      persist(); renderAll();
      alert('Imported successfully ✓');
    });
  });

  document.getElementById('resetBtn')?.addEventListener('click', async () => {
    if (!confirm('Reset everything to defaults? This cannot be undone.')) return;
    data = await PortfolioData.reset();
    renderAll();
    alert('Reset complete ✓');
  });

  // =========================================================
  // HELPERS
  // =========================================================
  function escapeHtml(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function escapeAttr(str = '') { return escapeHtml(str); }

  // =========================================================
  // RENDER ALL
  // =========================================================
  function renderAll() {
    bindHero();
    renderAbout();
    renderSkills();
    renderEducation();
    renderProjects();
    bindContact();
    renderMessages();
    refreshStats();
  }

})();
