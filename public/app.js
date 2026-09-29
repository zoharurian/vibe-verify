// ── Vibe & Verify — Dashboard App ──

const AGENTS = [
  { id: "roni",   name: "רוני",  emoji: "♟", role: "אסטרטגיה", color: "#3A2418", badge: "STRATEGY" },
  { id: "dana",   name: "דנה",   emoji: "✦", role: "חוויה",    color: "#9B1C5E", badge: "EXPERIENCE" },
  { id: "michal", name: "מיכל",  emoji: "◈", role: "נתונים",   color: "#C9521D", badge: "DATA" },
  { id: "yoav",   name: "יואב",  emoji: "◎", role: "לקוח",     color: "#F4A261", badge: "CUSTOMER" },
  { id: "tamar",  name: "תמר",   emoji: "⬡", role: "ביצוע",    color: "#7B2D26", badge: "EXECUTION" },
];

// ── Helpers ──
function esc(s) { return (s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function clean(s) {
  return (s || "").replace(/[—–]/g, ", ").replace(/\*\*/g, "").replace(/ {2,}/g, " ").trim();
}

function parseKV(text) {
  const lines = clean(text).split("\n").map(s => s.trim()).filter(Boolean);
  const result = [];
  for (const line of lines) {
    const ci = line.indexOf(":");
    const isKey = ci > 0 && ci < 60 && !line.slice(0, ci).match(/[.!?]/);
    if (isKey) {
      result.push({ key: line.slice(0, ci).trim(), val: line.slice(ci + 1).trim() });
    } else if (result.length) {
      result[result.length - 1].val += " " + line;
    } else {
      result.push({ key: "", val: line });
    }
  }
  return result;
}

function sectionFrom(text, ...names) {
  if (!text) return "";
  const lines = text.split("\n");
  const out = [];
  let inBlock = false;
  for (const line of lines) {
    const m = line.match(/^==\s*(.+?)\s*==/);
    if (m) {
      const sec = m[1].trim().toLowerCase();
      inBlock = names.some(n => sec === n.toLowerCase());
      continue;
    }
    if (inBlock) out.push(line);
  }
  return out.join("\n").trim();
}

function fmtDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

// ── Render Hero ──
function renderHero(report) {
  document.getElementById("report-date").textContent = fmtDate(report.timestamp);
  document.getElementById("hero-idea").textContent = report.idea;
  const agentsEl = document.getElementById("hero-agents");
  agentsEl.innerHTML = AGENTS.map(a =>
    `<div class="hero-agent-chip" style="--c:${a.color}"><span class="emoji">${a.emoji}</span> ${a.name} · ${a.role}</div>`
  ).join("");
}

// ── Render Verdict Tab ──
function renderVerdict(report) {
  const verdict = report.synth?.verdict || "";
  const kv = parseKV(verdict);

  // Split verdict from Blue Ocean section
  const blueOceanMatch = verdict.match(/==\s*Blue Ocean\s*==([\s\S]*)/);
  const blueOceanText = blueOceanMatch ? blueOceanMatch[1].trim() : "";

  const cards = [
    { key: "מה זה",           label: "מה זה באמת",        color: "#3A2418" },
    { key: "הקטגוריה",        label: "הקטגוריה שמנכסים",  color: "#9B1C5E" },
    { key: "עוצר",            label: "מה עוצר את זה עכשיו", color: "#C9521D" },
    { key: "הצעד",            label: "הצעד שמשנה כיוון",   color: "#F4A261" },
    { key: "מבחן",            label: "מבחן 90 הימים",     color: "#7B2D26" },
    { key: "המנעול",          label: "המנעול הראשי",      color: "#3A2418" },
  ];

  const grid = document.getElementById("verdict-grid");
  grid.innerHTML = cards.map(c => {
    const row = kv.find(r => r.key.includes(c.key));
    if (!row || !row.val) return "";
    return `<div class="verdict-card" style="--card-c:${c.color}">
      <div class="verdict-card-label">${c.label}</div>
      <div class="verdict-card-text">${esc(row.val)}</div>
    </div>`;
  }).join("");

  const boEl = document.getElementById("blue-ocean");
  if (blueOceanText) {
    boEl.innerHTML = `
      <div class="blue-ocean">
        <div class="blue-ocean-label">◆ BLUE OCEAN</div>
        <div class="blue-ocean-title">האוקיינוס הכחול</div>
        <div class="blue-ocean-text">${esc(blueOceanText)}</div>
      </div>`;
  }
}

// ── Render Research Tab ──
function renderResearch(report) {
  const research = report.research || "";

  // Highlights (numbers)
  const numbersRaw = sectionFrom(research, "Numbers");
  const numbers = clean(numbersRaw).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 6);
  const statColors = ["#9B1C5E","#C9521D","#7B2D26","#3A2418","#F4A261","#6B4A33"];
  const hlEl = document.getElementById("research-highlights");
  if (numbers.length) {
    hlEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">RESEARCH HIGHLIGHTS</div>
        <div class="section-title">תגליות מפתח מהמחקר</div>
        <div class="section-divider"></div>
      </div>
      <div class="stat-grid">
        ${numbers.map((line, i) => {
          const cleaned = line.replace(/^\d+\.?\s*/, "");
          const numMatch = cleaned.match(/[\d,.]+/);
          const bigNum = numMatch ? numMatch[0] : "";
          const rest = cleaned.replace(bigNum, "").trim();
          return `<div class="stat-card" style="--stat-c:${statColors[i % statColors.length]}">
            <div class="stat-number">${esc(bigNum)}</div>
            <div class="stat-label">${esc(rest)}</div>
          </div>`;
        }).join("")}
      </div>`;
  }

  // Market Context
  const market = sectionFrom(research, "Market Context");
  const marketEl = document.getElementById("research-market");
  if (market) {
    marketEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">MARKET CONTEXT</div>
        <div class="section-title">הקטגוריה והשוק</div>
        <div class="section-divider"></div>
      </div>
      <div class="research-block">
        <div class="research-block-content">${esc(clean(market))}</div>
      </div>`;
  }

  // Competitors
  const compRaw = sectionFrom(research, "Competitors");
  const competitors = clean(compRaw).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 6);
  const compEl = document.getElementById("research-competitors");
  if (competitors.length) {
    compEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">COMPETITOR LANDSCAPE</div>
        <div class="section-title">מתחרים שנמצאו</div>
        <div class="section-divider"></div>
      </div>
      <div class="research-block">
        <ul class="competitor-list">
          ${competitors.map((line, i) => `
            <li class="competitor-item">
              <span class="competitor-num">${String(i+1).padStart(2,"0")}</span>
              <span class="competitor-text">${esc(line.replace(/^\d+\.?\s*/, ""))}</span>
            </li>`).join("")}
        </ul>
      </div>`;
  }

  // Trends (Tailwinds + Headwinds)
  const tailwinds = clean(sectionFrom(research, "Tailwinds"));
  const headwinds = clean(sectionFrom(research, "Headwinds"));
  const trendsEl = document.getElementById("research-trends");
  if (tailwinds || headwinds) {
    trendsEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">TAILWINDS + HEADWINDS</div>
        <div class="section-title">רוח גבית ואותות אזהרה</div>
        <div class="section-divider"></div>
      </div>
      <div class="trends-grid">
        <div class="trend-card tailwind">
          <h3>רוח גבית ↑</h3>
          <p>${esc(tailwinds)}</p>
        </div>
        <div class="trend-card headwind">
          <h3>אותות אזהרה ↓</h3>
          <p>${esc(headwinds)}</p>
        </div>
      </div>`;
  }

  // Why Now
  const whyNow = clean(sectionFrom(research, "Why Now"));
  const whyEl = document.getElementById("research-why-now");
  if (whyNow) {
    whyEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">WHY NOW</div>
        <div class="section-title">למה עכשיו</div>
        <div class="section-divider"></div>
      </div>
      <div class="research-block">
        <div class="research-block-content">${esc(whyNow)}</div>
      </div>`;
  }

  // Sources
  const sourcesRaw = sectionFrom(research, "Sources");
  const sources = clean(sourcesRaw).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 10);
  const srcEl = document.getElementById("research-sources");
  if (sources.length) {
    srcEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">SOURCES</div>
        <div class="section-title">מקורות המחקר</div>
        <div class="section-divider"></div>
      </div>
      <div class="research-block">
        <ul class="source-list">
          ${sources.map((line, i) => {
            const cleaned = line.replace(/^\d+\.?\s*/, "");
            const urlMatch = cleaned.match(/https?:\/\/[^\s,)\]"']+/);
            const url = urlMatch ? urlMatch[0] : "";
            const desc = cleaned.replace(url, "").replace(/^[\s,()-]+|[\s,()-]+$/g, "").trim();
            return `<li class="source-item">
              <span class="source-num">${String(i+1).padStart(2,"0")}</span>
              <div>
                ${url ? `<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>` : ""}
                <div class="source-desc">${esc(desc)}</div>
              </div>
            </li>`;
          }).join("")}
        </ul>
      </div>`;
  }
}

// ── Render Agents Tab ──
function renderAgents(report) {
  const agentMap = {};
  (report.agents || []).forEach(a => { agentMap[a.id] = a; });

  const grid = document.getElementById("agents-grid");
  grid.innerHTML = AGENTS.map(agent => {
    const data = agentMap[agent.id];
    if (!data) return "";
    const rows = parseKV(data.content || "").filter(r => r.val);
    return `<div class="agent-card" style="--agent-c:${agent.color}">
      <div class="agent-card-header" style="background:${agent.color}">
        <div>
          <div class="agent-card-name">${agent.emoji} ${agent.name}</div>
          <div class="agent-card-role">${agent.role}</div>
        </div>
        <div class="agent-card-badge">${agent.badge}</div>
      </div>
      <div class="agent-card-body">
        ${rows.map(r => `
          <div class="agent-kv">
            ${r.key ? `<div class="agent-kv-key">${esc(r.key)}</div>` : ""}
            <div class="agent-kv-val">${esc(r.val)}</div>
          </div>`).join("")}
      </div>
    </div>`;
  }).join("");
}

// ── Render Synthesis Tab ──
function renderSynthesis(report) {
  const synth = report.synth || {};

  // Tensions
  const tensions = clean(synth.tensions || "").split("\n").map(s => s.trim()).filter(Boolean);
  const tensionsEl = document.getElementById("syn-tensions");
  if (tensions.length) {
    tensionsEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">TENSIONS</div>
        <div class="section-title">מתחים בין הסוכנים</div>
        <div class="section-divider"></div>
      </div>
      <div class="tension-list">
        ${tensions.map((line, i) => `
          <div class="tension-card">
            <div class="tension-num">0${i+1}</div>
            <div class="tension-text">${esc(line.replace(/^מתח\s*\d+\s*:\s*/, ""))}</div>
          </div>`).join("")}
      </div>`;
  }

  // Risks
  const risks = clean(synth.risks || "").split("\n").map(s => s.trim()).filter(Boolean);
  const riskColors = ["#7B2D26", "#C9521D", "#F4A261"];
  const riskLabels = ["HIGH", "MEDIUM", "LOW"];
  const risksEl = document.getElementById("syn-risks");
  if (risks.length) {
    risksEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">RISK MATRIX</div>
        <div class="section-title">שלוש דרגות סיכון</div>
        <div class="section-divider"></div>
      </div>
      <div class="risk-list">
        ${risks.map((line, i) => `
          <div class="risk-card" style="--risk-c:${riskColors[i] || riskColors[2]}">
            <div class="risk-badge">${riskLabels[i] || "—"}</div>
            <div class="risk-text">${esc(line.replace(/^סיכון.*?:\s*/, ""))}</div>
          </div>`).join("")}
      </div>`;
  }

  // Scenarios
  const scenText = synth.scenarios || "";
  const scenBlocks = parseScenarios(scenText);
  const scenColors = ["#3A2418", "#C9521D", "#9B1C5E"];
  const scenLabels = ["שמרני", "אגרסיבי", "שינוי כיוון"];
  const scenEl = document.getElementById("syn-scenarios");
  if (scenBlocks.length) {
    scenEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">SCENARIOS</div>
        <div class="section-title">שלושה תרחישים — 12 חודשים קדימה</div>
        <div class="section-divider"></div>
      </div>
      <div class="scenario-grid">
        ${scenBlocks.map((text, i) => `
          <div class="scenario-card">
            <div class="scenario-header" style="background:${scenColors[i] || scenColors[0]}">
              <div class="scenario-letter">${String.fromCharCode(65 + i)}</div>
              <div class="scenario-label">${scenLabels[i] || ""}</div>
            </div>
            <div class="scenario-body">${esc(text)}</div>
          </div>`).join("")}
      </div>`;
  }

  // Open Questions
  const questions = clean(synth.open_questions || "").split("\n").map(s => s.trim()).filter(Boolean);
  const qEl = document.getElementById("syn-questions");
  if (questions.length) {
    qEl.innerHTML = `
      <div class="section-header">
        <div class="section-eyebrow">OPEN QUESTIONS</div>
        <div class="section-title">שאלות שלא נשאלו עדיין</div>
        <div class="section-divider"></div>
      </div>
      <div class="research-block">
        <ul class="question-list">
          ${questions.map((line, i) => `
            <li class="question-item">
              <span class="question-num">0${i+1}</span>
              <span class="question-text">${esc(line.replace(/^שאלה\s*\d+\s*:\s*/, ""))}</span>
            </li>`).join("")}
        </ul>
      </div>`;
  }
}

function parseScenarios(text) {
  const lines = clean(text || "").split("\n").map(s => s.trim()).filter(Boolean);
  const blocks = [];
  let buf = "";
  for (const l of lines) {
    if (l.startsWith("תרחיש") && l.includes(":")) {
      if (buf.trim()) blocks.push(buf.trim());
      buf = l.replace(/^[^:]*:\s*/, "");
    } else {
      buf += " " + l;
    }
  }
  if (buf.trim()) blocks.push(buf.trim());
  return blocks;
}

// ── Render Actions Tab ──
function renderActions(report, pptx) {
  const synth = report.synth || {};

  // Next Moves
  const movesText = clean(synth.next_moves || "");
  const lines = movesText.split("\n").map(s => s.trim()).filter(Boolean);
  const week  = lines.find(l => l.includes("ימים 1") || l.includes("השבוע")) || "";
  const month = lines.find(l => l.includes("ימים 8") || l.includes("החודש")) || "";
  const milestone = lines.find(l => l.includes("חודש 3") || l.includes("אבן")) || "";

  const moveColors = ["#3A2418", "#C9521D", "#9B1C5E"];
  const moveLabels = ["DAYS 1-7", "DAYS 8-30", "MONTH 3"];
  const moveVals = [week, month, milestone];

  const movesEl = document.getElementById("action-moves");
  movesEl.innerHTML = `
    <div class="section-header">
      <div class="section-eyebrow">NEXT MOVES</div>
      <div class="section-title">הצעדים הבאים</div>
      <div class="section-divider"></div>
    </div>
    <div class="moves-grid">
      ${moveVals.map((line, i) => `
        <div class="move-card">
          <div class="move-header" style="background:${moveColors[i]}">
            <span class="move-label">${moveLabels[i]}</span>
            <span class="move-num">0${i+1}</span>
          </div>
          <div class="move-body">${esc(clean(line.replace(/^[^:]+:\s*/, "")))}</div>
        </div>`).join("")}
    </div>`;

  // Download CTA
  const dlEl = document.getElementById("action-download");
  if (pptx) {
    dlEl.innerHTML = `
      <div class="download-cta">
        <h3>הורד את המצגת המלאה</h3>
        <p>50 שקפים · עיצוב מקצועי · מוכן להצגה</p>
        <a class="download-btn" href="/api/download/${encodeURIComponent(pptx)}">הורד מצגת ↓</a>
      </div>`;
  } else {
    dlEl.innerHTML = `
      <div class="download-cta">
        <h3>צור מצגת 50 עמודים</h3>
        <p>המצגת המלאה עם כל הניתוח, המחקר והסינתזה</p>
        <button class="download-btn" id="gen-pptx-btn">צור מצגת ↓</button>
      </div>`;
    document.getElementById("gen-pptx-btn").addEventListener("click", generatePptx);
  }
}

async function generatePptx() {
  const btn = document.getElementById("gen-pptx-btn");
  btn.textContent = "מייצר מצגת…";
  btn.disabled = true;
  try {
    const res = await fetch("/api/generate-pptx", { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "נכשלה יצירת המצגת");
    }
    const data = await res.json();
    document.getElementById("action-download").innerHTML = `
      <div class="download-cta">
        <h3>המצגת מוכנה!</h3>
        <p>50 שקפים · עיצוב מקצועי · מוכן להצגה</p>
        <a class="download-btn" href="/api/download/${encodeURIComponent(data.filename)}">הורד מצגת ↓</a>
      </div>`;
  } catch (err) {
    btn.textContent = "צור מצגת ↓";
    btn.disabled = false;
    alert("שגיאת יצירת מצגת: " + err.message);
  }
}

// ── Tab Switching ──
function initTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
    });
  });
}

// ── Main ──
async function init() {
  try {
    const res = await fetch("/api/report");
    if (!res.ok) {
      document.getElementById("loading-view").classList.add("hidden");
      document.getElementById("error-view").classList.remove("hidden");
      return;
    }
    const data = await res.json();
    const { report, pptx } = data;

    document.getElementById("loading-view").classList.add("hidden");
    document.getElementById("report-view").classList.remove("hidden");

    renderHero(report);
    renderVerdict(report);
    renderResearch(report);
    renderAgents(report);
    renderSynthesis(report);
    renderActions(report, pptx);
    initTabs();
  } catch (err) {
    document.getElementById("loading-view").classList.add("hidden");
    document.getElementById("error-view").classList.remove("hidden");
    document.querySelector(".error-view p").textContent = "שגיאת תקשורת: " + err.message;
  }
}

init();
