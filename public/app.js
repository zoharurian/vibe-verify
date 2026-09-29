const inputView     = document.getElementById("input-view");
const resultsView    = document.getElementById("results-view");
const ideaInput     = document.getElementById("idea-input");
const runBtn        = document.getElementById("run-btn");
const verdictSection = document.getElementById("verdict-section");
const downloadBtn   = document.getElementById("download-btn");
const agentResults  = document.getElementById("agent-results");
const errorBanner   = document.getElementById("error-banner");
const newAnalysisBtn = document.getElementById("new-analysis-btn");
const generateBtn   = document.getElementById("generate-pptx-btn");

const AGENTS_INFO = [
  { id: "roni",   name: "רוני",  emoji: "♟", role: "אסטרטגיה", color: "#3A2418", badge: "STRATEGY" },
  { id: "dana",   name: "דנה",   emoji: "✦", role: "חוויה",    color: "#9B1C5E", badge: "EXPERIENCE" },
  { id: "michal", name: "מיכל",  emoji: "◈", role: "נתונים",   color: "#C9521D", badge: "DATA" },
  { id: "yoav",   name: "יואב",  emoji: "◎", role: "לקוח",     color: "#F4A261", badge: "CUSTOMER" },
  { id: "tamar",  name: "תמר",   emoji: "⬡", role: "ביצוע",    color: "#7B2D26", badge: "EXECUTION" },
];

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.classList.remove("hidden");
}

function showResults(report, pptx) {
  inputView.classList.remove("active");
  resultsView.classList.add("active");
  errorBanner.classList.add("hidden");

  // Verdict
  if (report.synth && report.synth.verdict) {
    verdictSection.innerHTML =
      `<h2>VERDICT</h2><div class="verdict-content">${report.synth.verdict}</div>`;
  } else {
    verdictSection.innerHTML = `<h2>VERDICT</h2><div class="verdict-content">אין פסק דין זמין</div>`;
  }

  // Download
  if (pptx) {
    downloadBtn.href = `/api/download/${pptx}`;
    downloadBtn.style.display = "";
    generateBtn.style.display = "none";
  } else {
    downloadBtn.style.display = "none";
    generateBtn.style.display = "";
  }

  // Agent results
  agentResults.innerHTML = "";
  const agentMap = {};
  if (report.agents) {
    report.agents.forEach(a => { agentMap[a.id] = a; });
  }
  AGENTS_INFO.forEach(agent => {
    const data = agentMap[agent.id];
    if (!data) return;
    const card = document.createElement("div");
    card.className = "agent-result-card";
    card.style.setProperty("--card-color", agent.color);
    card.innerHTML =
      `<h3>${agent.emoji} ${agent.name} · ${agent.role}</h3>` +
      `<div class="content">${(data.content || "").replace(/</g, "&lt;")}</div>`;
    agentResults.appendChild(card);
  });
}

async function loadReport() {
  errorBanner.classList.add("hidden");
  try {
    const res = await fetch("/api/report");
    if (!res.ok) {
      showError('לא נמצא דוח. הרץ בטרמינל: node run.js "הרעיון שלך" ולחץ שוב.');
      return;
    }
    const data = await res.json();
    showResults(data.report, data.pptx);
  } catch (err) {
    showError(`שגיאת תקשורת: ${err.message}`);
  }
}

// On page load, try to load existing report
loadReport();

// Button click — re-check for report
runBtn.addEventListener("click", loadReport);

// New analysis — back to input
newAnalysisBtn.addEventListener("click", () => {
  resultsView.classList.remove("active");
  inputView.classList.add("active");
  errorBanner.classList.add("hidden");
});

ideaInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runBtn.click();
});

// Generate PPTX
generateBtn.addEventListener("click", async () => {
  generateBtn.textContent = "מייצר מצגת...";
  generateBtn.disabled = true;
  try {
    const res = await fetch("/api/generate-pptx", { method: "POST" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "נכשלה יצירת המצגת");
    }
    const data = await res.json();
    downloadBtn.href = `/api/download/${data.filename}`;
    downloadBtn.style.display = "";
    generateBtn.style.display = "none";
  } catch (err) {
    showError(`שגיאת יצירת מצגת: ${err.message}`);
    generateBtn.textContent = "צור מצגת 50 עמודים ↓";
    generateBtn.disabled = false;
  }
});
