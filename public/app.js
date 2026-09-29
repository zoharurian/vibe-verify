const inputView     = document.getElementById("input-view");
const progressView  = document.getElementById("progress-view");
const resultsView    = document.getElementById("results-view");
const ideaInput     = document.getElementById("idea-input");
const runBtn        = document.getElementById("run-btn");
const phaseIndicator = document.getElementById("phase-indicator");
const agentsGrid    = document.getElementById("agents-grid");
const verdictSection = document.getElementById("verdict-section");
const downloadBtn   = document.getElementById("download-btn");
const agentResults  = document.getElementById("agent-results");
const errorBanner   = document.getElementById("error-banner");
const newAnalysisBtn = document.getElementById("new-analysis-btn");

const AGENTS_INFO = [
  { id: "roni",   name: "רוני",  emoji: "♟", role: "אסטרטגיה", color: "#3A2418", badge: "STRATEGY" },
  { id: "dana",   name: "דנה",   emoji: "✦", role: "חוויה",    color: "#9B1C5E", badge: "EXPERIENCE" },
  { id: "michal", name: "מיכל",  emoji: "◈", role: "נתונים",   color: "#C9521D", badge: "DATA" },
  { id: "yoav",   name: "יואב",  emoji: "◎", role: "לקוח",     color: "#F4A261", badge: "CUSTOMER" },
  { id: "tamar",  name: "תמר",   emoji: "⬡", role: "ביצוע",    color: "#7B2D26", badge: "EXECUTION" },
];

const agentCards = {};

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.classList.remove("hidden");
}

function setPhase(label) {
  phaseIndicator.innerHTML = `${label} <span class="spinner"></span>`;
}

function createAgentCards() {
  agentsGrid.innerHTML = "";
  AGENTS_INFO.forEach(agent => {
    const card = document.createElement("div");
    card.className = "agent-card";
    card.style.setProperty("--card-color", agent.color);
    card.innerHTML = `
      <div class="agent-card-header">
        <span style="font-size:1.2rem">${agent.emoji}</span>
        <span class="agent-card-name">${agent.name}</span>
        <span class="agent-card-role">${agent.role}</span>
      </div>
      <div class="agent-card-badge">${agent.badge}</div>
      <div class="agent-card-status">ממתין...</div>
      <div class="agent-card-result"></div>
    `;
    agentsGrid.appendChild(card);
    agentCards[agent.id] = card;
  });
}

runBtn.addEventListener("click", async () => {
  const idea = ideaInput.value.trim();
  if (!idea) {
    showError("נא להזין רעיון עסקי");
    return;
  }

  inputView.classList.remove("active");
  progressView.classList.add("active");
  errorBanner.classList.add("hidden");
  createAgentCards();

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
      let msg = "שגיאה לא צפויה";
      try { msg = (await response.json()).error || msg; } catch (_) {}
      showError(msg);
      return;
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = "";
    const agentResultsData = {};
    let synthData  = null;
    let filename   = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop();

      for (const evt of events) {
        const lines = evt.split("\n");
        let eventType = "";
        let eventData = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) eventType = line.slice(7);
          if (line.startsWith("data: "))  eventData = line.slice(6);
        }
        if (!eventType || !eventData) continue;

        const data = JSON.parse(eventData);

        switch (eventType) {
          case "phase":
            setPhase(data.label);
            if (data.phase === "agents") {
              Object.values(agentCards).forEach(c => {
                c.querySelector(".agent-card-status").textContent = "עובד...";
              });
            }
            break;

          case "agent_start":
            if (agentCards[data.id]) {
              agentCards[data.id].querySelector(".agent-card-status").textContent = "עובד...";
            }
            break;

          case "agent_done":
            if (agentCards[data.id]) {
              const card = agentCards[data.id];
              card.querySelector(".agent-card-status").textContent = "✓ הושלם";
              card.querySelector(".agent-card-status").classList.add("done");
              card.querySelector(".agent-card-result").textContent = data.result;
            }
            agentResultsData[data.id] = data.result;
            break;

          case "synthesis_done":
            synthData = data.synth;
            break;

          case "done":
            filename  = data.filename;
            synthData = synthData || data.synth;
            progressView.classList.remove("active");
            resultsView.classList.add("active");

            if (synthData && synthData.verdict) {
              verdictSection.innerHTML =
                `<h2>VERDICT</h2><div class="verdict-content">${synthData.verdict}</div>`;
            }
            downloadBtn.href = `/api/download/${filename}`;

            agentResults.innerHTML = "";
            AGENTS_INFO.forEach(agent => {
              const result = agentResultsData[agent.id];
              if (!result) return;
              const card = document.createElement("div");
              card.className = "agent-result-card";
              card.style.setProperty("--card-color", agent.color);
              card.innerHTML =
                `<h3>${agent.emoji} ${agent.name} · ${agent.role}</h3>` +
                `<div class="content">${result}</div>`;
              agentResults.appendChild(card);
            });
            break;

          case "error":
            showError(data.message);
            break;
        }
      }
    }
  } catch (err) {
    showError(`שגיאת תקשורת: ${err.message}`);
  }
});

newAnalysisBtn.addEventListener("click", () => {
  resultsView.classList.remove("active");
  inputView.classList.add("active");
  ideaInput.value = "";
  errorBanner.classList.add("hidden");
});

ideaInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") runBtn.click();
});
