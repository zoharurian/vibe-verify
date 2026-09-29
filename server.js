#!/usr/bin/env node
/**
 * WEB SERVER for Vibe & Verify
 * Wraps the CLI analysis flow (agents.js + build-presentation.js) in an HTTP API
 * with Server-Sent Events for live progress streaming.
 *
 * The original CLI entry point (run.js) is unchanged.
 */
const http = require("http");
const fs   = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const { AGENTS, ORCHESTRATOR, RESEARCHER } = require("./agents");
const { buildPresentation } = require("./build-presentation");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".png":  "image/png",
  ".json": "application/json",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

// ── Helpers (adapted from run.js) ─────────────────────────────
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

async function callClaude(client, systemPrompt, userMessage, opts = {}) {
  const tools = opts.web ? [{ type: "web_search_20250305", name: "web_search" }] : [];
  const params = {
    model:      "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system:     systemPrompt,
    messages:   [{ role: "user", content: userMessage }],
  };
  if (tools.length) params.tools = tools;
  const response = await client.messages.create(params);
  const text = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");
  return sanitize(text);
}

function parseSynth(text) {
  const sections = {};
  const re = /==\s*(\w[\w\s]*?)\s*==\s*\n([\s\S]*?)(?=\n==\s|\s*$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
    sections[key] = m[2].trim();
  }
  return sections;
}

// ── SSE helper ────────────────────────────────────────────────
function sendEvent(res, event, data) {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (_) { /* client disconnected */ }
}

// ── Analysis flow (web-adapted from run.js) ───────────────────
async function runAnalysis(idea, res) {
  let client;
  try {
    client = new Anthropic();
  } catch (err) {
    sendEvent(res, "error", { message: `Anthropic client error: ${err.message}` });
    return;
  }

  // Phase 1: Research
  sendEvent(res, "phase", { phase: "research", label: "מחקר רשת" });
  let research;
  try {
    const userMsg = `הרעיון לחקירה:\n${idea}\n\nחקור ברשת לעומק (5-10 חיפושים). עבור על המחקר עד שיש לך נתונים אמיתיים, מתחרים אמיתיים, ומקורות. ענה בעברית בלבד בפורמט שהוגדר.`;
    research = await callClaude(client, RESEARCHER.systemPrompt, userMsg, { web: true });
    sendEvent(res, "research_done", { research });
  } catch (err) {
    sendEvent(res, "error", { message: `מחקר נכשל: ${err.message}` });
    return;
  }

  // Phase 2: 5 agents in parallel
  sendEvent(res, "phase", { phase: "agents", label: "חמישה סוכנים" });
  const agentResults = await Promise.all(AGENTS.map(async (agent) => {
    sendEvent(res, "agent_start", {
      id: agent.id, name: agent.name, emoji: agent.emoji,
      role: agent.role, color: agent.color, badge: agent.badge,
    });
    try {
      const userMsg = `הרעיון:\n${idea}\n\nמחקר רקע (השתמש בנתונים האלה ובמתחרים האלה בתשובתך):\n${research}\n\nענה בעברית בלבד. השתמש בפורמט שהוגדר בדיוק. התבסס על המחקר ועל הניסיון שלך כדמות.`;
      const result = await callClaude(client, agent.systemPrompt, userMsg);
      sendEvent(res, "agent_done", { id: agent.id, result });
      return {
        id: agent.id, name: agent.name, emoji: agent.emoji,
        role: agent.role, badge: agent.badge, color: agent.color,
        content: result,
      };
    } catch (err) {
      sendEvent(res, "agent_done", { id: agent.id, result: `שגיאה: ${err.message}` });
      return {
        id: agent.id, name: agent.name, emoji: agent.emoji,
        role: agent.role, badge: agent.badge, color: agent.color,
        content: `שגיאה: ${err.message}`,
      };
    }
  }));

  // Phase 3: Synthesis
  sendEvent(res, "phase", { phase: "synthesis", label: "סינתזה אסטרטגית" });
  let synth, synthRaw;
  try {
    const body = agentResults.map(s => `=== ${s.name} (${s.role}) ===\n${s.content}`).join("\n\n");
    const userMsg = `הרעיון:\n${idea}\n\nמחקר רקע:\n${research}\n\nניתוח מ-5 הסוכנים:\n${body}\n\nעכשיו, סנתזי הכל לפלט בפורמט שהוגדר. ענה בעברית בלבד.`;
    synthRaw = await callClaude(client, ORCHESTRATOR.synthSystemPrompt, userMsg);
    synth = parseSynth(synthRaw);
    sendEvent(res, "synthesis_done", { synth, synthRaw });
  } catch (err) {
    sendEvent(res, "error", { message: `סינתזה נכשלה: ${err.message}` });
    return;
  }

  // Phase 4: Build PPTX
  sendEvent(res, "phase", { phase: "pptx", label: "בונה מצגת" });
  try {
    const report = {
      idea,
      timestamp: new Date().toISOString(),
      research,
      agents: agentResults,
      synth,
      synthRaw,
    };
    fs.writeFileSync(path.join(__dirname, "report.json"), JSON.stringify(report, null, 2));
    const pptxPath = await buildPresentation(report);
    const filename = path.basename(pptxPath);
    sendEvent(res, "done", { filename, synth });
  } catch (err) {
    sendEvent(res, "error", { message: `בניית מצגת נכשלה: ${err.message}` });
  }
}

// ── Static file serving ───────────────────────────────────────
function serveStatic(req, res) {
  let url = req.url === "/" ? "/index.html" : req.url;
  let filePath;
  if (url.startsWith("/assets/")) {
    filePath = path.join(__dirname, url);
  } else {
    filePath = path.join(PUBLIC_DIR, url);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  res.end(data);
}

// ── HTTP server ────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // POST /api/analyze — SSE stream of analysis progress
  if (req.method === "POST" && req.url === "/api/analyze") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let idea;
    try {
      idea = JSON.parse(body).idea;
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
    if (!idea || !idea.trim()) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing idea" }));
      return;
    }

    res.writeHead(200, {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    await runAnalysis(idea.trim(), res);
    res.end();
    return;
  }

  // GET /api/download/:filename — download generated PPTX
  if (req.method === "GET" && req.url.startsWith("/api/download/")) {
    const filename = decodeURIComponent(req.url.slice("/api/download/".length));
    const filePath = path.join(__dirname, filename);
    if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const data = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type":        MIME[".pptx"],
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
    res.end(data);
    return;
  }

  // Static files
  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vibe & Verify server running on http://0.0.0.0:${PORT}`);
});
