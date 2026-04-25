/* ============================================================
   lakshaykumar.tech — v2.1 runtime
   Editorial · single accent · mobile-first
   ============================================================ */

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Nav: burger + scrolled state */
  const burger = $('#burger');
  const navLinks = $('#navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('show'));
    navLinks.addEventListener('click', e => {
      if (e.target.tagName === 'A') navLinks.classList.remove('show');
    });
  }

  const nav = $('#nav');
  if (nav) {
    const toggle = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  /* Reveal on scroll */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* Hero typewriter */
  const tw = $('[data-typewriter]');
  if (tw) {
    let phrases;
    try { phrases = JSON.parse(tw.dataset.typewriter); }
    catch { phrases = ['ship.']; }
    let pi = 0, ci = 0, deleting = false;
    const tick = () => {
      const phrase = phrases[pi];
      if (!deleting) {
        tw.textContent = phrase.slice(0, ci++);
        if (ci > phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
      } else {
        tw.textContent = phrase.slice(0, ci--);
        if (ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; }
      }
      setTimeout(tick, deleting ? 35 : 75);
    };
    tick();
  }

  /* Agent terminal stream */
  const term = $('[data-terminal]');
  if (term) {
    const body = term.querySelector('.terminal-body');
    const cursorLine = body ? body.querySelector('.t-line') : null;
    if (!body || !cursorLine) return;

    const script = [
      { type: 'cmd', text: 'agent.init --task="introduce_lakshay"' },
      { type: 'meta', text: '> spawning planner-agent · loading context · 184ms' },
      { type: 'ok', text: '✓ tool registry loaded · 14 tools available' },
      { type: 'cmd', text: 'planner.plan()' },
      { type: 'block', label: 'plan', lines: [
        '01 → fetch_profile(source="resume.pdf")',
        '02 → query_projects(domain="agentic_ai")',
        '03 → synthesize_pitch(audience="recruiter")',
        '04 → emit_response(format="terminal")'
      ]},
      { type: 'cmd', text: 'executor.run(plan)' },
      { type: 'info', text: 'i  step 01 → loaded 12 entities (skills, roles, books)' },
      { type: 'info', text: 'i  step 02 → matched: dociq · oms-v1 · ai-battlefield · rags' },
      { type: 'info', text: 'i  step 03 → drafting...' },
      { type: 'out', text: '"Lakshay Kumar — GenAI Engineer @ Zato. Builds production' },
      { type: 'out', text: ' multi-agent systems: enterprise RAG, ERP copilots, AI ops"' },
      { type: 'ok', text: '✓ pipeline complete · 4 steps · 2.1s · 0 errors' },
      { type: 'cmd', text: 'agent.handoff(channel="contact")' },
      { type: 'key', text: '⚡ ready. ask anything via /agent dock →' }
    ];

    let idx = 0;
    const renderLine = (item) => {
      const line = document.createElement('div');
      if (item.type === 'block') {
        line.className = 't-block';
        line.innerHTML = `<span class="label">${item.label}</span>` + item.lines.map(l => `<div>${l}</div>`).join('');
        return line;
      }
      line.className = 't-line';
      const map = { cmd: 'prompt', meta: 'meta', ok: 'ok', info: 'info', out: 'out', key: 'key' };
      const cls = map[item.type] || 'info';
      if (item.type === 'cmd') {
        line.innerHTML = `<span class="prompt">$</span><span>${item.text}</span>`;
      } else {
        line.innerHTML = `<span class="${cls}">${item.text}</span>`;
      }
      return line;
    };

    const advance = () => {
      if (idx >= script.length) {
        setTimeout(() => {
          body.querySelectorAll('.t-line:not(:last-child), .t-block').forEach(el => el.remove());
          idx = 0;
          advance();
        }, 6500);
        return;
      }
      const el = renderLine(script[idx]);
      body.insertBefore(el, cursorLine);
      const delay = script[idx].type === 'block' ? 700 : (script[idx].type === 'cmd' ? 800 : 420);
      idx++;
      setTimeout(advance, delay);
    };

    if ('IntersectionObserver' in window) {
      const tio = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          tio.disconnect();
          setTimeout(advance, 600);
        }
      }, { threshold: 0.3 });
      tio.observe(term);
    } else {
      setTimeout(advance, 600);
    }
  }

  /* Agent dock */
  const dockToggle = $('#dockToggle');
  const dockBody = $('#dockBody');
  const dockSuggest = $('#dockSuggest');
  const dockPanel = $('.dock-panel');

  const KB = {
    who: "Lakshay Kumar — AI Agent Engineer based in Bangalore. GenAI Engineer at Zato. Builds production multi-agent systems: DocIQ (doc intelligence), OMS-v1 (ops copilot), AI-Battlefield (multi-agent sim). Author of 'From Data to World'. Microsoft Learn Student Ambassador.",
    projects: "Production agents:\n• DocIQ — multi-tenant RAG for enterprise docs\n• OMS-v1 — agentic order-management copilot\n• AI-Battlefield — adversarial multi-agent simulator\n• ERP-v1 — agent-driven ERP automation\n• Hyderabad-Rent — geospatial agent search\nFull list at /agents.",
    stack: "Python · FastAPI · LangChain/LangGraph · Anthropic Claude · OpenAI · Pinecone/Qdrant · Postgres · React/Next · Docker · GCP/Azure. Patterns: planner-executor, ReAct, hierarchical multi-agent, RAG+tools.",
    experience: "GenAI Engineer @ Zato (full-time). Microsoft Learn Student Ambassador. Project Manager @ Atria Foundation. Speaker — Microsoft Reactor, ThoughtWorks, Solapur FOSS, TinyML, AI Unleashed.",
    book: "'From Data to World' — 5 real-life secrets with data science. Read /from-data-to-world.html",
    contact: "lakshay@zatohq.com · +91 8595984485\nlinkedin.com/in/lakshaykumar-tech",
    chat: "Working full-time at Zato. Always up for a tech chat — agents, RAG, ML — or speaking inquiries. Drop a line: lakshay@zatohq.com or /contact.",
    agents: "I build agents that ship. Patterns: planner-executor, ReAct, multi-agent orchestration, RAG-augmented agents, tool-calling. Frameworks: LangGraph, Anthropic Claude SDK, custom orchestration.",
    talk: "Speaker at Microsoft Reactor (drones, packages), ThoughtWorks, Solapur FOSS, AI Unleashed, TinyML, panel discussions. /talks for the full list."
  };

  const route = (q) => {
    const t = q.toLowerCase();
    if (/(who|about|you)/.test(t)) return KB.who;
    if (/(project|build|ship|work|portfolio)/.test(t)) return KB.projects;
    if (/(stack|tech|tool)/.test(t)) return KB.stack;
    if (/(exp|role|company|zato|career)/.test(t)) return KB.experience;
    if (/(book|author|writ)/.test(t)) return KB.book;
    if (/(contact|email|reach|phone)/.test(t)) return KB.contact;
    if (/(hire|job|opportun|consult|chat|talk to)/.test(t)) return KB.chat;
    if (/(agent|llm|gen.?ai)/.test(t)) return KB.agents;
    if (/(talk|speak|conf)/.test(t)) return KB.talk;
    return "I can answer: who is Lakshay · what projects · what stack · how to contact · talks · book. Try one ↓";
  };

  const addMsg = (role, text) => {
    if (!dockBody) return;
    const m = document.createElement('div');
    m.className = `msg ${role}`;
    m.textContent = text;
    dockBody.appendChild(m);
    dockBody.scrollTop = dockBody.scrollHeight;
  };

  if (dockToggle && dockPanel) {
    dockToggle.addEventListener('click', () => {
      dockPanel.classList.toggle('open');
      if (dockPanel.classList.contains('open') && dockBody.children.length === 0) {
        addMsg('bot', "Hi — I'm Lakshay's agent. Ask about his work, agents he's built, or how to reach him.");
      }
    });
  }
  if (dockSuggest) {
    dockSuggest.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        const q = b.textContent;
        addMsg('user', q);
        setTimeout(() => addMsg('bot', route(q)), 380);
      });
    });
  }

  /* Project filter chips (used on /agents page) */
  const filterBox = $('[data-filter]');
  if (filterBox) {
    const cards = $$('[data-tag]');
    filterBox.querySelectorAll('button').forEach(chip => {
      chip.addEventListener('click', () => {
        filterBox.querySelectorAll('button').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.f;
        cards.forEach(c => {
          c.style.display = (f === 'all' || c.dataset.tag.split(' ').includes(f)) ? '' : 'none';
        });
      });
    });
  }

  /* Year stamp */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* Spline: mark stage as loaded + hide watermark */
  const splineViewers = $$('spline-viewer');
  splineViewers.forEach(v => {
    const stage = v.closest('.hero-stage');
    const markLoaded = () => stage && stage.classList.add('loaded');
    v.addEventListener('load', markLoaded);
    v.addEventListener('load-complete', markLoaded);
    setTimeout(markLoaded, 4000);
  });

  const hideSplineLogo = () => {
    splineViewers.forEach(v => {
      try {
        const root = v.shadowRoot;
        if (!root) return;
        ['#logo', '.logo', 'a[href*="spline"]'].forEach(sel => {
          root.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
        });
      } catch (_) {}
    });
  };
  [800, 1800, 3500, 6000].forEach(t => setTimeout(hideSplineLogo, t));

})();
