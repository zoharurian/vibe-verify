#!/usr/bin/env node
/**
 * VIBE & VERIFY, v3
 * זרימה: Research → 5 Agents (parallel) → Synthesis → PPTX
 *
 * Usage:
 *   node run.js "הרעיון שלך"
 *
 * שינוי מ-v2: משתמש ב-Anthropic SDK במקום claude CLI.
 * עובד מקלוד קוד באפליקציה (Cowork/Code tab) וגם מהטרמינל.
 */

const Anthropic = require("@anthropic-ai/sdk");
const readline  = require("readline");
const fs        = require("fs");
const path      = require("path");
const { AGENTS, ORCHESTRATOR, RESEARCHER } = require("./agents");

const client = new Anthropic();

// ── Sanitize ─────────────────────────────────────────────────
function sanitize(text) {
  return (text || "")
    .replace(/[—–]/g, ", ")
    .replace(/−/g, "-")
    .replace(/\*\*/g, "")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`{1,3}/g, "")
    .replace(/ {2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

// ── Call Claude via SDK ───────────────────────────────────────
async function callClaude(systemPrompt, userMessage, opts = {}) {
  const tools = opts.web ? [{ type: "web_search_20250305", name: "web_search" }] : [];

  const params = {
    model:      "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system:     systemPrompt,
    messages:   [{ role: "user", content: userMessage }],
  };
  if (tools.length) params.tools = tools;

  const response = await client.messages.create(params);

  // Extract text from all content blocks
  const text = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");

  return sanitize(text);
}

// ── Terminal helpers ──────────────────────────────────────────
const TC = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  pink: "\x1b[95m", green: "\x1b[32m", blue: "\x1b[34m",
  yellow: "\x1b[33m", purple: "\x1b[35m", cyan: "\x1b[36m",
  red: "\x1b[31m", white: "\x1b[97m",
};
const COLOR_MAP = {
  "#3A2418": TC.yellow, "#9B1C5E": TC.purple, "#C9521D": TC.red,
  "#F4A261": TC.yellow, "#7B2D26": TC.red,
};
const SPIN   = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];
const STATUS = ["מנתח...", "חוקר...", "מעמיק...", "מסכם...", "מוכן ✓"];
const BAR_W  = 26;

function bar(pct, col) {
  const f = Math.round(BAR_W * Math.min(pct, 100) / 100);
  return `${col}${"█".repeat(f)}${"░".repeat(BAR_W - f)}${TC.reset}`;
}

function renderAgentLine(s) {
  const col = COLOR_MAP[s.color] || TC.white;
  const sp  = s.done ? "✓" : SPIN[s.spinFrame % SPIN.length];
  const st  = STATUS[Math.min(s.statusIdx, STATUS.length - 1)];
  const pct = Math.round(Math.min(s.progress, 100));
  return [
    `${col}${TC.bold}${s.emoji} ${s.name}${TC.reset}  ${TC.dim}${s.role}${TC.reset}  ${sp}  ${TC.dim}${st}${TC.reset}`,
    `   ${bar(pct, col)}  ${col}${pct}%${TC.reset}`,
    "",
  ].join("\n");
}

function startTicker(state, capPct = 82) {
  return setInterval(() => {
    if (state.progress < capPct) {
      state.progress  = Math.min(capPct, state.progress + Math.random() * 5 + 1.5);
      state.statusIdx = Math.min(3, Math.floor(state.progress / (capPct / 4)));
    }
    state.spinFrame = (state.spinFrame + 1) % SPIN.length;
  }, 200);
}

// ── Run research (web search) ─────────────────────────────────
async function runResearch(idea, state) {
  state.progress = 5;
  const ticker   = startTicker(state, 90);
  try {
    const userMsg = `הרעיון לחקירה:\n${idea}\n\nחקור ברשת לעומק (5-10 חיפושים). עבור על המחקר עד שיש לך נתונים אמיתיים, מתחרים אמיתיים, ומקורות. ענה בעברית בלבד בפורמט שהוגדר.`;
    state.result    = await callClaude(RESEARCHER.systemPrompt, userMsg, { web: true });
    state.progress  = 100;
    state.statusIdx = 4;
    state.done      = true;
  } catch (err) {
    state.result   = `שגיאה במחקר: ${err.message}\n\n(ממשיכים בלי מחקר)`;
    state.progress = 100;
    state.done     = true;
  } finally {
    clearInterval(ticker);
  }
}

// ── Run single agent ─────────────────────────────────────────
async function runAgent(state, idea, research, startDelay) {
  await sleep(startDelay);
  state.progress = 5;
  const ticker   = startTicker(state);
  try {
    const userMsg = `הרעיון:\n${idea}\n\nמחקר רקע (השתמש בנתונים האלה ובמתחרים האלה בתשובתך):\n${research}\n\nענה בעברית בלבד. השתמש בפורמט שהוגדר בדיוק. התבסס על המחקר ועל הניסיון שלך כדמות.`;
    state.result    = await callClaude(state.systemPrompt, userMsg);
    state.progress  = 100;
    state.statusIdx = 4;
    state.done      = true;
  } catch (err) {
    state.result   = `שגיאה: ${err.message}`;
    state.progress = 100;
    state.done     = true;
  } finally {
    clearInterval(ticker);
  }
}

// ── Run synthesis ─────────────────────────────────────────────
async function runSynth(idea, research, agentResults) {
  const body    = agentResults.map(s => `=== ${s.name} (${s.role}) ===\n${s.result}`).join("\n\n");
  const userMsg = `הרעיון:\n${idea}\n\nמחקר רקע:\n${research}\n\nניתוח מ-5 הסוכנים:\n${body}\n\nעכשיו, סנתזי הכל לפלט בפורמט שהוגדר. ענה בעברית בלבד.`;
  return callClaude(ORCHESTRATOR.synthSystemPrompt, userMsg);
}

// ── Parse synthesis ───────────────────────────────────────────
function parseSynth(text) {
  const sections = {};
  const re       = /==\s*(\w[\w\s]*?)\s*==\s*\n([\s\S]*?)(?=\n==\s|\s*$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const key      = m[1].trim().toLowerCase().replace(/\s+/g, "_");
    sections[key]  = m[2].trim();
  }
  return sections;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const idea = await getIdea();
  if (!idea) { console.error("No idea provided."); process.exit(1); }

  console.clear();
  printBanner();
  console.log(`\n${TC.bold}${TC.white}הרעיון:${TC.reset} ${idea}\n`);
  console.log(`${TC.dim}${"─".repeat(58)}${TC.reset}\n`);

  // Phase 1: Research
  const researchState = {
    name: "מחקר", emoji: "⌬", role: "Research", color: "#C9521D",
    progress: 0, statusIdx: 1, spinFrame: 0, done: false, result: null,
  };

  console.log(`${TC.bold}${TC.cyan}▶ שלב 1 — מחקר רשת${TC.reset} ${TC.dim}(1-3 דקות)${TC.reset}\n`);

  let lastLines = 0;
  const renderTimer = setInterval(() => {
    if (lastLines > 0) process.stdout.write(`\x1b[${lastLines}A`);
    const out = renderAgentLine(researchState);
    process.stdout.write(out);
    lastLines = out.split("\n").length;
  }, 130);

  await runResearch(idea, researchState);
  clearInterval(renderTimer);
  if (lastLines > 0) process.stdout.write(`\x1b[${lastLines}A`);
  process.stdout.write(renderAgentLine(researchState));
  console.log(`\n${TC.green}✓ מחקר הושלם${TC.reset}\n`);

  // Phase 2: 5 agents in parallel
  console.log(`${TC.bold}${TC.cyan}▶ שלב 2 — חמישה סוכנים${TC.reset}\n`);

  const states = AGENTS.map(a => ({
    ...a, progress: 0, statusIdx: 0, spinFrame: 0, done: false, result: null,
  }));

  let last2 = 0;
  const t2 = setInterval(() => {
    if (last2 > 0) process.stdout.write(`\x1b[${last2}A`);
    const out = states.map(renderAgentLine).join("");
    process.stdout.write(out);
    last2 = out.split("\n").length;
  }, 130);

  await Promise.all(states.map((s, i) => runAgent(s, idea, researchState.result, i * 300)));

  clearInterval(t2);
  if (last2 > 0) process.stdout.write(`\x1b[${last2}A`);
  process.stdout.write(states.map(renderAgentLine).join(""));
  console.log(`\n${TC.green}✓ כל הסוכנים סיימו${TC.reset}\n`);

  // Phase 3: Synthesis
  process.stdout.write(`${TC.bold}${TC.cyan}▶ שלב 3 — סינתזה אסטרטגית${TC.reset} `);
  const synthRaw = await runSynth(idea, researchState.result, states);
  const synth    = parseSynth(synthRaw);
  console.log(`${TC.green}✓${TC.reset}`);

  // Build report
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const report = {
    idea,
    timestamp: new Date().toISOString(),
    research:  researchState.result,
    agents: states.map(s => ({
      id: s.id, name: s.name, emoji: s.emoji,
      role: s.role, badge: s.badge, color: s.color,
      content: s.result,
    })),
    synth,
    synthRaw,
  };

  fs.writeFileSync(path.join(__dirname, "report.json"), JSON.stringify(report, null, 2));

  // Phase 4: Build PPTX
  process.stdout.write(`${TC.bold}${TC.cyan}▶ שלב 4 — בונה מצגת${TC.reset} `);
  const { buildPresentation } = require("./build-presentation");
  const pptxPath = await buildPresentation(report);
  console.log(`${TC.green}✓${TC.reset}`);

  // Print verdict
  console.log(`\n${TC.bold}${TC.blue}=== Verdict ===${TC.reset}`);
  console.log(`${TC.dim}${"─".repeat(50)}${TC.reset}`);
  console.log(synth.verdict || "(חסר)");
  console.log(`\n${TC.bold}${TC.green}✓ מצגת:${TC.reset} ${pptxPath}\n`);
}

function printBanner() {
  console.log(`
${TC.bold}${TC.white}  ╔══════════════════════════════════════════╗
  ║     VIBE & VERIFY  ·  תחושה ואימות       ║
  ╚══════════════════════════════════════════╝${TC.reset}
  ${TC.dim}אורקסטרטור:${TC.reset} ${TC.bold}${ORCHESTRATOR.emoji} ${ORCHESTRATOR.name}${TC.reset}
  ${TC.dim}סוכנים: ${AGENTS.map(a => a.emoji + " " + a.name).join("  ·  ")}${TC.reset}
`);
}

async function getIdea() {
  const args = process.argv.slice(2);
  if (args.length) return args.join(" ");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${TC.bold}${TC.cyan}▶ תאר את הרעיון העסקי: ${TC.reset}`, ans => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => { console.error(err.message); process.exit(1); });
