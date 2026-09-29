import './style.css';
import { slides, agents } from './slides.js';

const total = slides.length;
const pad = (n) => String(n).padStart(2, '0');

// ── Shared elements ──
function promoBar(num) {
  return `<div class="promo-bar" dir="ltr">
    <span class="promo-left">◆ VIBE & VERIFY</span>
    <span class="promo-center">MULTI-AGENT INTELLIGENCE</span>
    <span class="promo-right">SLIDE ${pad(num)} / ${pad(total)}</span>
  </div>`;
}

function headerEyebrow(num, label, accent) {
  return `${promoBar(num)}
    <div class="header-eyebrow" dir="ltr">
      <span class="eyebrow-num">${pad(num)}</span>
      <span class="eyebrow-label">${label}</span>
    </div>
    <div class="header-line">
      <div class="header-accent" style="background:${accent || 'var(--brown-lt)'}"></div>
    </div>`;
}

function footerLine(text) {
  return `<div class="footer-line" dir="ltr">${text}</div>`;
}

function colorStripe() {
  return `<div class="color-stripe">${agents.map(a => `<div style="background:${a.color}"></div>`).join('')}</div>`;
}

// ── Cover ──
function renderCover(s, num) {
  return `
    ${promoBar(num)}
    <div class="cover-body">
      <div class="cover-eyebrow" dir="ltr">
        <span>VIBE & VERIFY</span>
        <span class="cover-date">${s.date}</span>
      </div>
      <div class="cover-divider"></div>
      <div class="cover-big">
        <div class="cover-big-line" style="color:var(--brown)">${s.big1}</div>
        <div class="cover-big-line" style="color:var(--fuchsia)">${s.big2}</div>
      </div>
      ${colorStripe()}
      <div class="cover-subtitle">${s.subtitle}</div>
      <div class="cover-footer" dir="ltr">5 AGENTS · WEB RESEARCH · STRATEGIC SYNTHESIS</div>
    </div>`;
}

// ── Brief ──
function renderBrief(s, num) {
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <div class="brief-label">${s.title}</div>
        <div class="brief-text">${s.content}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Process ──
function renderProcess(s, num) {
  const portraits = agents.map(a => `
    <div class="process-agent">
      <div class="process-agent-bar" style="background:${a.color}"></div>
      <img src="${a.portrait}" alt="${a.name}" class="process-portrait">
      <div class="process-agent-name" dir="rtl">${a.name}</div>
      <div class="process-agent-role" dir="rtl">${a.role}</div>
    </div>`).join('');
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <h2 class="slide-title-rtl">${s.title}</h2>
        <p class="slide-subtitle-rtl">${s.subtitle}</p>
        <div class="process-flow" dir="ltr">
          <div class="process-stage">
            <div class="stage-num">01</div>
            <div class="stage-label">BRIEF</div>
            <div class="stage-desc" dir="rtl">הרעיון נכנס</div>
          </div>
          <div class="process-arrow">→</div>
          <div class="process-stage process-stage--main">
            <div class="stage-num">02</div>
            <div class="stage-label">MULTI-AGENT RACE</div>
            <div class="process-agents">${portraits}</div>
          </div>
          <div class="process-arrow">→</div>
          <div class="process-stage process-stage--dark">
            <div class="stage-num">03</div>
            <div class="stage-label">VERDICT</div>
            <div class="stage-desc" dir="rtl">פסק דין</div>
          </div>
        </div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Text ──
function renderText(s, num) {
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <h2 class="slide-title-rtl">${s.title}</h2>
        <div class="body-text-rtl">${s.content}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── List ──
function renderList(s, num) {
  const items = s.items.map((item, i) => `
    <div class="list-row">
      <div class="list-num" style="${s.bulletColor ? `color:${s.bulletColor}` : 'color:var(--orange-dk)'}">${s.bullet || pad(i + 1)}</div>
      <div class="list-text">${item}</div>
    </div>`).join('');
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <h2 class="slide-title-rtl">${s.title}</h2>
        <div class="list-container">${items}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Two-column ──
function renderTwoColumn(s, num) {
  const renderCol = (col) => `
    <div class="tc-col">
      <h3 class="tc-title">${col.title}</h3>
      <div class="tc-bar" style="background:${col.color}"></div>
      <div class="tc-items">${col.items.map(item => `<div class="tc-item">${item}</div>`).join('')}</div>
    </div>`;
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <div class="tc-grid">${renderCol(s.left)}${renderCol(s.right)}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Dark hero ──
function renderDarkHero(s, num) {
  return `
    ${promoBar(num)}
    <div class="dark-header" dir="ltr">
      <span class="dark-num">${pad(num)}</span>
      <span class="dark-label">${s.label}</span>
    </div>
    <div class="dark-line"></div>
    <div class="dark-hero-body">
      <div class="dark-big">
        <div class="dark-big-line" style="color:var(--cream)">${s.big1}</div>
        <div class="dark-big-line" style="color:var(--orange-lt)">${s.big2}</div>
      </div>
      <div class="dark-content-rtl">${s.content}</div>
    </div>
    <div class="dark-footer" dir="ltr">${s.footer}</div>`;
}

// ── Team ──
function renderTeam(s, num) {
  const cards = agents.map((a, i) => `
    <div class="team-card">
      <div class="team-card-top" style="background:${a.color}"></div>
      <div class="team-card-num">${pad(i + 1)}</div>
      <img src="${a.portrait}" alt="${a.name}" class="team-portrait">
      <div class="team-badge" style="color:${a.color}">${a.badge}</div>
      <div class="team-name" dir="rtl">${a.name}</div>
      <div class="team-role" dir="rtl">${a.role}</div>
    </div>`).join('');
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <h2 class="slide-title-rtl slide-title--large">${s.title}</h2>
        <div class="team-grid">${cards}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Agent grid ──
function renderAgentGrid(s, num) {
  const cards = agents.map(a => `
    <div class="ag-card">
      <div class="ag-card-top" style="background:${a.color}"></div>
      <img src="${a.portrait}" alt="${a.name}" class="ag-portrait">
      <div class="ag-name" dir="rtl">${a.name}</div>
      <div class="ag-role" dir="rtl">${a.role}</div>
      <div class="ag-divider" style="background:${a.color}"></div>
      <div class="ag-insight">${s.insights[a.id]}</div>
    </div>`).join('');
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <h2 class="slide-title-rtl">${s.title}</h2>
        <div class="ag-grid">${cards}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Verdict ──
function renderVerdict(s, num) {
  return `
    ${promoBar(num)}
    <div class="dark-header" dir="ltr">
      <span class="dark-num">${pad(num)}</span>
      <span class="dark-label">THE VERDICT</span>
      <span class="dark-author">◆ ZOHAR URIAN</span>
    </div>
    <div class="dark-line"></div>
    <div class="verdict-body">
      <div class="verdict-big" style="color:var(--cream)">${s.big}</div>
      <div class="verdict-content-rtl">${s.content}</div>
      <div class="verdict-divider"></div>
      <div class="verdict-category-label">${s.category}</div>
      <div class="verdict-category-content">${s.categoryContent}</div>
    </div>
    <div class="dark-footer" dir="ltr">${s.footer}</div>`;
}

// ── Move ──
function renderMove(s, num) {
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <div class="move-big">
          <div class="move-big-line" style="color:var(--brown)">${s.big1}</div>
          <div class="move-big-line" style="color:var(--fuchsia)">${s.big2}</div>
        </div>
        <div class="move-content-rtl">${s.content}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Test ──
function renderTest(s, num) {
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content test-layout" dir="ltr">
        <div class="test-big" style="color:var(--orange-dk)">${s.big}</div>
        <div class="test-right">
          <div class="test-unit">${s.unit}</div>
          <div class="test-title-rtl" dir="rtl">${s.title}</div>
          <div class="test-content-rtl" dir="rtl">${s.content}</div>
        </div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Next moves ──
function renderNextMoves(s, num) {
  const cards = s.columns.map((col, i) => `
    <div class="nm-card" style="background:${col.color}">
      <div class="nm-card-header" dir="ltr">
        <span>${col.label}</span><span>${pad(i + 1)}</span>
      </div>
      <div class="nm-card-sep"></div>
      <div class="nm-card-body" dir="rtl">${col.content}</div>
    </div>`).join('');
  return `
    ${headerEyebrow(num, s.label)}
    <div class="slide-body">
      <div class="slide-content">
        <div class="nm-headlines" dir="ltr">
          <span class="nm-headline" style="color:var(--brown)">${s.title1}</span>
          <span class="nm-headline" style="color:var(--orange-dk)">${s.title2}</span>
        </div>
        <div class="nm-grid">${cards}</div>
      </div>
      ${footerLine(s.footer)}
    </div>`;
}

// ── Endcap ──
function renderEndcap(s, num) {
  return `
    ${promoBar(num)}
    <div class="endcap-body">
      <div class="endcap-big">
        <div class="endcap-big-line" style="color:var(--cream)">${s.big1}</div>
        <div class="endcap-amp" style="color:var(--orange-lt)">${s.big2}</div>
        <div class="endcap-big-line" style="color:var(--fuchsia)">${s.big3}</div>
      </div>
      <div class="endcap-stripe">${colorStripe()}</div>
      <div class="endcap-footer" dir="ltr">${s.footer}</div>
    </div>`;
}

const renderers = {
  cover: renderCover, brief: renderBrief, process: renderProcess,
  text: renderText, list: renderList, 'two-column': renderTwoColumn,
  'dark-hero': renderDarkHero, team: renderTeam, 'agent-grid': renderAgentGrid,
  verdict: renderVerdict, move: renderMove, test: renderTest,
  'next-moves': renderNextMoves, endcap: renderEndcap,
};

// ── Deck setup ──
const deck = document.getElementById('deck');
slides.forEach((slide, i) => {
  const el = document.createElement('section');
  el.className = `slide slide--${slide.type}`;
  el.innerHTML = renderers[slide.type](slide, i + 1);
  deck.appendChild(el);
});

// ── Navigation ──
let current = 0;
function goTo(index) { current = Math.max(0, Math.min(index, total - 1)); updateDeck(); }
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function updateDeck() {
  [...deck.children].forEach((el, i) => {
    el.classList.remove('active', 'prev', 'next');
    if (i === current) el.classList.add('active');
    else if (i < current) el.classList.add('prev');
    else el.classList.add('next');
  });
  document.getElementById('counter').textContent = `${pad(current + 1)} / ${pad(total)}`;
  document.getElementById('progress-bar').style.width = `${((current + 1) / total) * 100}%`;
}

// ── Events ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End') goTo(total - 1);
});
document.getElementById('next').addEventListener('click', (e) => { e.stopPropagation(); next(); });
document.getElementById('prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); });

let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
});

document.addEventListener('click', (e) => {
  if (e.target.closest('#nav') || e.target.closest('a') || e.target.closest('button')) return;
  const x = e.clientX;
  if (x < window.innerWidth * 0.25) prev();
  else if (x > window.innerWidth * 0.75) next();
});

updateDeck();
