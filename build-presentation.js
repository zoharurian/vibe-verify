/**
 * BUILD-PRESENTATION.JS v4
 * Vibe & Verify, warm Claude-design palette + Nike Try energy + agent illustrations.
 * Output filename versioned by timestamp (never overwrites prior decks).
 *
 * Slide map (38 slides):
 *   1.  Cover
 *   2.  Brief
 *   3.  Process (multi-agent race)
 *   4.  Market Context
 *   5.  Competitors
 *   6.  Numbers
 *   7.  Tailwinds + Headwinds
 *   8.  Why Now (dark)
 *   9.  Sources (with clickable links)
 *   10. Team
 *   11-30. 5 agents x 4 slides (cover + content A + B + C, no overflow)
 *   26. The Race
 *   27. Tensions
 *   28. Risk Matrix
 *   29-31. Scenarios A/B/C
 *   32. Verdict Hero (dark)
 *   33. The Move
 *   34. The 90-Day Test
 *   35. The Lock
 *   36. Open Questions
 *   37. Next Moves
 *   38. Endcap
 */

const pptxgen = require("pptxgenjs");
const path    = require("path");
const fs      = require("fs");

// ── Tokens ──
const T = {
  CREAM:        "F4ECDD",
  CREAM_DK:     "ECE0CC",
  CREAM_LT:     "FAF5EA",
  BROWN:        "3A2418",
  BROWN_MID:    "6B4A33",
  BROWN_LT:     "9B7B5F",
  FUCHSIA:      "9B1C5E",
  ORANGE_DK:    "C9521D",
  ORANGE_LT:    "F4A261",
  BURGUNDY:     "7B2D26",
  HAIRLINE:     "C9B89A",
  WHITE:        "FFFFFF",
  FONT:         "Calibri",
};

const PAD = 0.5;
const W = 10;
const H = 5.625;
const ASSETS = path.join(__dirname, "assets", "agents");

const clean = (s) => (s || "").replace(/[—–]/g, ", ").replace(/\*\*/g, "").replace(/ {2,}/g, " ").trim();

// No-op now: bidi marks render as visible artifacts in PowerPoint on macOS.
// Trust pptxgenjs rtlMode + Unicode bidi algorithm instead.
const rtl = (s) => s || "";

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth()+1).padStart(2, "0")}.${d.getFullYear()}`;
};

// Smart KV parser: groups multi-line values under their parent key.
// A line is a key only if it has a colon within the first 60 chars and doesn't
// look like a sentence (no period before the colon).
function parseKV(text) {
  const lines = clean(text).split("\n").map(s => s.trim()).filter(Boolean);
  const result = [];
  for (const line of lines) {
    const ci = line.indexOf(":");
    const isKey = ci > 0 && ci < 60 && !line.slice(0, ci).match(/[.!?]/);
    if (isKey) {
      result.push({ key: line.slice(0, ci).trim(), val: line.slice(ci + 1).trim() });
    } else if (result.length) {
      // Append to previous value as continuation
      result[result.length - 1].val += " " + line;
    } else {
      result.push({ key: "", val: line });
    }
  }
  return result;
}

// Truncate value text to fit a row safely (prevent overflow), cuts on word boundary.
// Auto-applies RTL bidi wrap if text contains Hebrew (fixes mixed Hebrew/numbers).
function safe(s, max = 220) {
  if (!s) return "";
  let cut = s;
  if (s.length > max) {
    cut = s.slice(0, max);
    const lastBreak = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf(". "), cut.lastIndexOf(" "));
    if (lastBreak > max * 0.6) cut = cut.slice(0, lastBreak);
    cut = cut.trim() + "…";
  }
  return cut;
}

// Get a section text or fall back to placeholder. Never returns empty string.
function getSection(text, fallback) {
  const t = clean(text);
  return t || fallback || "";
}

const aColor = (a) => (a.color || "#3A2418").replace(/^#/, "");

function portraitPath(agentId) {
  const p = path.join(ASSETS, `${agentId}.png`);
  return fs.existsSync(p) ? p : null;
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

// ── TOP PROMO BAR (Nike Try signature) — thin, doesn't shift content ──
function promoBar(s, pres, num) {
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.22,
    fill: { color: T.BROWN }, line: { color: T.BROWN, width: 0 },
  });
  s.addText("◆ VIBE & VERIFY", {
    x: PAD, y: 0, w: 3, h: 0.22,
    fontSize: 8, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 4, align: "left", valign: "middle",
  });
  s.addText("MULTI-AGENT INTELLIGENCE", {
    x: 3, y: 0, w: 4, h: 0.22,
    fontSize: 8, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    charSpacing: 4, align: "center", valign: "middle",
  });
  s.addText(num ? `SLIDE ${num} / 48` : "", {
    x: W - PAD - 2, y: 0, w: 2, h: 0.22,
    fontSize: 8, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 3, align: "right", valign: "middle",
  });
}

// ── Reusable header eyebrow on cream-bg slides ──
function headerEyebrow(s, pres, num, label, accent) {
  promoBar(s, pres, num);
  s.addText(num, {
    x: PAD, y: 0.42, w: 0.5, h: 0.3,
    fontSize: 11, bold: true, color: accent || T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addText(label, {
    x: PAD + 0.55, y: 0.42, w: W - 2*PAD - 0.55, h: 0.3,
    fontSize: 11, bold: true, color: T.BROWN, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addShape(pres.shapes.LINE, {
    x: PAD, y: 0.84, w: W - 2*PAD, h: 0,
    line: { color: T.HAIRLINE, width: 0.75 },
  });
  if (accent) {
    s.addShape(pres.shapes.RECTANGLE, {
      x: PAD, y: 0.84, w: 1.4, h: 0.03,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
  }
}

function footerLine(s, pres, text) {
  s.addShape(pres.shapes.LINE, {
    x: PAD, y: H - 0.4, w: W - 2*PAD, h: 0,
    line: { color: T.HAIRLINE, width: 0.5 },
  });
  s.addText(text, {
    x: PAD, y: H - 0.3, w: W - 2*PAD, h: 0.22,
    fontSize: 9, color: T.BROWN_MID, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
}

// Pill badge shape: rounded rectangle with high radius
function pillBadge(s, pres, x, y, w, h, fillColor, strokeColor) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: strokeColor || fillColor, width: 1 },
    rectRadius: h / 2,
  });
}

// ════════════════════════════════════════════════════════════
async function buildPresentation(report) {
  splitAgentRows(report.agents);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Vibe & Verify, Zohar Urian";
  pres.title = `Vibe & Verify, ${report.idea.slice(0, 60)}`;
  pres.subject = "Multi-agent business idea analysis";

  let n = 0;
  slide_Cover(pres, report);                                  // 01
  n = 1; slide_Brief(pres, report, ++n);                      // 02
  slide_Process(pres, report, ++n);                           // 03
  slide_MarketContext(pres, report, ++n);                     // 04
  slide_Competitors(pres, report, ++n);                       // 05
  slide_Numbers(pres, report, ++n);                           // 06
  slide_TrendsWarnings(pres, report, ++n);                    // 07
  slide_WhyNow(pres, report, ++n);                            // 08
  slide_Sources(pres, report, ++n);                           // 09
  slide_Team(pres, report, ++n);                              // 10

  // 5 agents x 5 slides each (cover + content A/B/C/D)
  report.agents.forEach((agent) => {
    slide_AgentCover(pres, agent, ++n);
    if ((agent.contentRowsA || []).length) slide_AgentContent(pres, agent, ++n, "01", agent.contentRowsA);
    if ((agent.contentRowsB || []).length) slide_AgentContent(pres, agent, ++n, "02", agent.contentRowsB);
    if ((agent.contentRowsC || []).length) slide_AgentContent(pres, agent, ++n, "03", agent.contentRowsC);
    if ((agent.contentRowsD || []).length) slide_AgentContent(pres, agent, ++n, "04", agent.contentRowsD);
  });

  slide_Race(pres, report, ++n);                              // 26
  slide_Tensions(pres, report, ++n);                          // 27
  slide_RiskMatrix(pres, report, ++n);                        // 28

  const scenariosText = report.synth.scenarios || "";
  slide_Scenario(pres, report, ++n, "A", "שמרני",       scenariosText, 0);  // 29
  slide_Scenario(pres, report, ++n, "B", "אגרסיבי",     scenariosText, 1);  // 30
  slide_Scenario(pres, report, ++n, "C", "שינוי כיוון", scenariosText, 2);  // 31

  slide_VerdictHero(pres, report, ++n);                       // 32
  slide_TheMove(pres, report, ++n);                           // 33
  slide_TheTest(pres, report, ++n);                           // 34
  slide_TheLock(pres, report, ++n);                           // 35
  slide_OpenQuestions(pres, report, ++n);                     // 36
  slide_NextMoves(pres, report, ++n);                         // 37
  slide_Endcap(pres, report, ++n);                            // 38

  // Versioned output: never overwrite previous deck
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const outPath = path.join(__dirname, `vibe-verify-report-${stamp}.pptx`);
  await pres.writeFile({ fileName: outPath });
  return outPath;
}

function splitAgentRows(agents) {
  agents.forEach(a => {
    const rows = parseKV(a.content).filter(r => r.val);
    // Up to 10 fields split into 4 pages with 2-3 fields each (max breathing room).
    a.contentRowsA = rows.slice(0, 3);
    a.contentRowsB = rows.slice(3, 5);
    a.contentRowsC = rows.slice(5, 7);
    a.contentRowsD = rows.slice(7, 10);
    // Pull a "headline quote" for the cover slide (first non-empty)
    a.headlineRow = rows.find(r => r.val) || null;
  });
}

// ════════════════════════════════════════════════════════════
// 1. COVER, hi-energy editorial cover
// ════════════════════════════════════════════════════════════
function slide_Cover(pres, report) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  promoBar(s, pres, 1);

  s.addText("VIBE & VERIFY", {
    x: PAD, y: 0.55, w: 5, h: 0.3,
    fontSize: 11, bold: true, color: T.BROWN, fontFace: T.FONT,
    charSpacing: 5, align: "left",
  });
  s.addText(fmtDate(report.timestamp), {
    x: W - PAD - 3, y: 0.55, w: 3, h: 0.3,
    fontSize: 11, bold: true, color: T.BROWN_MID, fontFace: T.FONT,
    charSpacing: 3, align: "right",
  });
  s.addShape(pres.shapes.LINE, {
    x: PAD, y: 1.0, w: W - 2*PAD, h: 0,
    line: { color: T.BROWN, width: 1.25 },
  });

  // Massive scoreboard headline (Nike Try energy: 0.9 line-height feel)
  s.addText("THE", {
    x: PAD, y: 1.1, w: W - 2*PAD, h: 1.25,
    fontSize: 130, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });
  s.addText("VERDICT.", {
    x: PAD, y: 2.15, w: W - 2*PAD, h: 1.45,
    fontSize: 130, bold: true, color: T.FUCHSIA, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });

  // Color stripe (5 agent colors) - thick band
  const stripeY = 3.7;
  const stripeH = 0.18;
  const stripeW = (W - 2*PAD) / report.agents.length;
  report.agents.forEach((a, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: PAD + i*stripeW, y: stripeY, w: stripeW, h: stripeH,
      fill: { color: aColor(a) }, line: { color: aColor(a), width: 0 },
    });
  });

  const snippet = safe(report.idea, 200);
  s.addText(snippet, {
    x: PAD, y: 4.05, w: W - 2*PAD, h: 0.95,
    fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.4,
  });

  s.addText("5 AGENTS  ·  WEB RESEARCH  ·  STRATEGIC SYNTHESIS", {
    x: PAD, y: 5.18, w: W - 2*PAD, h: 0.25,
    fontSize: 9, color: T.BROWN_MID, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
}

// ════════════════════════════════════════════════════════════
// 2. BRIEF
// ════════════════════════════════════════════════════════════
function slide_Brief(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE BRIEF");

  // Eyebrow Hebrew
  s.addText("הרעיון", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.4,
    fontSize: 12, bold: true, color: T.FUCHSIA, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, charSpacing: 2,
  });

  s.addText(rtl(clean(report.idea)), {
    x: PAD, y: 1.5, w: W - 2*PAD, h: 3.4,
    fontSize: 22, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.45,
  });

  footerLine(s, pres, `5 PERSPECTIVES  ·  1 VERDICT  ·  ${fmtDate(report.timestamp)}`);
}

// ════════════════════════════════════════════════════════════
// 3. PROCESS, multi-agent race diagram
// ════════════════════════════════════════════════════════════
function slide_Process(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE PROCESS");

  s.addText("מרוץ הסוכנים", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.7,
    fontSize: 44, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });
  s.addText("חמש עיניים רצות במקביל, מתאחדות לפסק דין אחד", {
    x: PAD, y: 1.65, w: W - 2*PAD, h: 0.4,
    fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const flowY = 2.45;
  const flowH = 2.2;

  // STAGE 1: BRIEF
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD, y: flowY, w: 1.3, h: flowH,
    fill: { color: T.CREAM_DK },
    line: { color: T.BROWN, width: 1 },
  });
  s.addText("01", {
    x: PAD + 0.1, y: flowY + 0.15, w: 1.1, h: 0.28,
    fontSize: 11, bold: true, color: T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
  s.addText("BRIEF", {
    x: PAD + 0.1, y: flowY + 0.5, w: 1.1, h: 0.35,
    fontSize: 16, bold: true, color: T.BROWN, fontFace: T.FONT,
    charSpacing: 2, align: "left",
  });
  s.addText("הרעיון נכנס", {
    x: PAD + 0.1, y: flowY + 1.55, w: 1.1, h: 0.35,
    fontSize: 12, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  // ARROW
  s.addText("→", {
    x: PAD + 1.32, y: flowY + 0.95, w: 0.35, h: 0.3,
    fontSize: 28, color: T.BROWN_MID, fontFace: T.FONT,
    align: "center", valign: "middle",
  });

  // STAGE 2: 5 AGENTS + RESEARCH
  const midX = PAD + 1.75;
  const midW = W - 2*PAD - 1.75 - 1.5 - 0.3 - 0.4;
  s.addShape(pres.shapes.RECTANGLE, {
    x: midX, y: flowY, w: midW, h: flowH,
    fill: { color: T.WHITE },
    line: { color: T.BROWN, width: 1 },
  });
  s.addText("02", {
    x: midX + 0.1, y: flowY + 0.15, w: 1, h: 0.25,
    fontSize: 11, bold: true, color: T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
  s.addText("MULTI-AGENT RACE", {
    x: midX + 0.1, y: flowY + 0.45, w: midW - 0.2, h: 0.32,
    fontSize: 14, bold: true, color: T.BROWN, fontFace: T.FONT,
    charSpacing: 2, align: "left",
  });

  // 5 portraits
  const innerW = midW - 0.2;
  const innerX = midX + 0.1;
  const portraitSize = 0.7;
  const colW = innerW / 5;
  const portraitY = flowY + 0.95;

  // colored stripe under portraits
  report.agents.forEach((a, i) => {
    const x = innerX + i*colW;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: flowY + 0.83, w: colW, h: 0.06,
      fill: { color: aColor(a) }, line: { color: aColor(a), width: 0 },
    });
  });
  report.agents.forEach((a, i) => {
    const xc = innerX + i*colW;
    const x = xc + (colW - portraitSize)/2;
    const p = portraitPath(a.id);
    if (p) {
      s.addImage({ path: p, x, y: portraitY, w: portraitSize, h: portraitSize });
    } else {
      s.addShape(pres.shapes.OVAL, {
        x, y: portraitY, w: portraitSize, h: portraitSize,
        fill: { color: aColor(a) }, line: { color: aColor(a), width: 0 },
      });
    }
    s.addText(a.name, {
      x: xc, y: portraitY + portraitSize + 0.05, w: colW, h: 0.25,
      fontSize: 11, bold: true, color: aColor(a), fontFace: T.FONT,
      align: "center", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    s.addText(a.role, {
      x: xc, y: portraitY + portraitSize + 0.27, w: colW, h: 0.22,
      fontSize: 9, color: T.BROWN_MID, fontFace: T.FONT,
      align: "center", rtlMode: true, lang: "he-IL", autoFit: true,
    });
  });

  // ARROW 2
  s.addText("→", {
    x: midX + midW + 0.05, y: flowY + 0.95, w: 0.35, h: 0.3,
    fontSize: 28, color: T.BROWN_MID, fontFace: T.FONT,
    align: "center", valign: "middle",
  });

  // STAGE 3: VERDICT
  const rightX = midX + midW + 0.45;
  const rightW = W - PAD - rightX;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rightX, y: flowY, w: rightW, h: flowH,
    fill: { color: T.BROWN }, line: { color: T.BROWN, width: 1 },
  });
  s.addText("03", {
    x: rightX + 0.1, y: flowY + 0.15, w: rightW - 0.2, h: 0.28,
    fontSize: 11, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
  s.addText("VERDICT", {
    x: rightX + 0.1, y: flowY + 0.5, w: rightW - 0.2, h: 0.35,
    fontSize: 16, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 2, align: "left",
  });
  s.addText("פסק דין", {
    x: rightX + 0.1, y: flowY + 1.55, w: rightW - 0.2, h: 0.35,
    fontSize: 12, bold: true, color: T.CREAM, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  footerLine(s, pres, "5 AGENTS RUN IN PARALLEL  ·  WEB RESEARCH FEEDS THEM  ·  ZOHAR SYNTHESIZES");
}

// ════════════════════════════════════════════════════════════
// 4. MARKET CONTEXT
// ════════════════════════════════════════════════════════════
function slide_MarketContext(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "MARKET CONTEXT");

  s.addText("הקטגוריה והשוק", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 32, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const text = sectionFrom(report.research, "Market Context") || "(לא נמצא במחקר)";
  s.addText(safe(clean(text), 1100), {
    x: PAD, y: 1.65, w: W - 2*PAD, h: 3.4,
    fontSize: 13, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.5,
  });

  footerLine(s, pres, "WEB RESEARCH  ·  10+ QUERIES  ·  REAL SOURCES");
}

// ════════════════════════════════════════════════════════════
// 5. COMPETITORS
// ════════════════════════════════════════════════════════════
function slide_Competitors(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "COMPETITOR LANDSCAPE");

  s.addText("מתחרים שנמצאו במחקר", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const raw = sectionFrom(report.research, "Competitors");
  const items = clean(raw).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 6);
  if (!items.length) {
    s.addText("(לא נמצאו מתחרים במחקר)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    footerLine(s, pres, "EVERY ALTERNATIVE THE CUSTOMER IS ALREADY USING");
    return;
  }

  const Y = 1.65, totalH = 3.45;
  const N = items.length;
  const rowH = totalH / N;

  items.forEach((line, i) => {
    const y = Y + i * rowH;
    if (i > 0) {
      s.addShape(pres.shapes.LINE, {
        x: PAD, y, w: W - 2*PAD, h: 0,
        line: { color: T.HAIRLINE, width: 0.5 },
      });
    }
    s.addText(String(i + 1).padStart(2, "0"), {
      x: PAD, y: y + 0.05, w: 0.7, h: rowH - 0.1,
      fontSize: 18, bold: true, color: T.ORANGE_DK, fontFace: T.FONT,
      align: "left", valign: "top",
    });
    s.addText(safe(line.replace(/^\d+\.?\s*/, ""), 250), {
      x: PAD + 0.85, y: y + 0.05, w: W - 2*PAD - 0.85, h: rowH - 0.1,
      fontSize: 12, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  });

  footerLine(s, pres, "EVERY ALTERNATIVE THE CUSTOMER IS ALREADY USING");
}

// ════════════════════════════════════════════════════════════
// 6. NUMBERS
// ════════════════════════════════════════════════════════════
function slide_Numbers(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "NUMBERS THAT MATTER");

  s.addText("מספרים מהמחקר", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const raw = sectionFrom(report.research, "Numbers");
  const items = clean(raw).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 7);
  if (!items.length) {
    s.addText("(לא נמצאו נתונים במחקר)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    footerLine(s, pres, "PUBLIC SOURCES + STATED ESTIMATES");
    return;
  }

  const Y = 1.65, totalH = 3.45;
  const N = items.length;
  const rowH = totalH / N;
  items.forEach((line, i) => {
    const y = Y + i * rowH;
    if (i > 0) {
      s.addShape(pres.shapes.LINE, {
        x: PAD, y, w: W - 2*PAD, h: 0,
        line: { color: T.HAIRLINE, width: 0.5 },
      });
    }
    s.addText("◆", {
      x: PAD, y: y + 0.05, w: 0.4, h: rowH - 0.1,
      fontSize: 14, color: T.FUCHSIA, fontFace: T.FONT, align: "left", valign: "top",
    });
    s.addText(safe(line.replace(/^\d+\.?\s*/, ""), 200), {
      x: PAD + 0.5, y: y + 0.05, w: W - 2*PAD - 0.5, h: rowH - 0.1,
      fontSize: 12, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  });

  footerLine(s, pres, "PUBLIC SOURCES + STATED ESTIMATES");
}

// ════════════════════════════════════════════════════════════
// 7. TAILWINDS + HEADWINDS
// ════════════════════════════════════════════════════════════
function slide_TrendsWarnings(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "TAILWINDS + HEADWINDS");

  const colW = (W - 2*PAD - 0.4) / 2;
  const rightX = PAD;
  const leftX = PAD + colW + 0.4;

  s.addText("רוח גבית", {
    x: rightX, y: 0.95, w: colW, h: 0.4,
    fontSize: 22, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rightX, y: 1.4, w: colW, h: 0.07,
    fill: { color: T.ORANGE_LT }, line: { color: T.ORANGE_LT, width: 0 },
  });
  s.addText(safe(clean(sectionFrom(report.research, "Tailwinds")), 800) || "(none)", {
    x: rightX, y: 1.6, w: colW, h: 3.3,
    fontSize: 11, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.45,
  });

  s.addText("אותות אזהרה", {
    x: leftX, y: 0.95, w: colW, h: 0.4,
    fontSize: 22, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: leftX, y: 1.4, w: colW, h: 0.07,
    fill: { color: T.BURGUNDY }, line: { color: T.BURGUNDY, width: 0 },
  });
  s.addText(safe(clean(sectionFrom(report.research, "Headwinds")), 800) || "(none)", {
    x: leftX, y: 1.6, w: colW, h: 3.3,
    fontSize: 11, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.45,
  });

  footerLine(s, pres, "WHAT PUSHES US FORWARD AND WHAT MIGHT STOP US");
}

// ════════════════════════════════════════════════════════════
// 8. WHY NOW (dark)
// ════════════════════════════════════════════════════════════
function slide_WhyNow(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.BROWN };
  s.addText(String(num).padStart(2,"0"), {
    x: PAD, y: 0.32, w: 0.5, h: 0.3,
    fontSize: 11, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addText("WHY NOW", {
    x: PAD + 0.55, y: 0.32, w: 5, h: 0.3,
    fontSize: 11, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addShape(pres.shapes.LINE, {
    x: PAD, y: 0.74, w: W - 2*PAD, h: 0,
    line: { color: T.BROWN_LT, width: 0.75 },
  });

  s.addText("WHY", {
    x: PAD, y: 0.9, w: W - 2*PAD, h: 1.25,
    fontSize: 130, bold: true, color: T.CREAM, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });
  s.addText("NOW.", {
    x: PAD, y: 2.1, w: W - 2*PAD, h: 1.4,
    fontSize: 130, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });

  const text = sectionFrom(report.research, "Why Now") || "";
  s.addText(safe(clean(text), 700), {
    x: PAD, y: 3.65, w: W - 2*PAD, h: 1.5,
    fontSize: 14, color: T.CREAM, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.45,
  });

  s.addText("RESEARCH SYNTHESIS", {
    x: PAD, y: H - 0.3, w: W - 2*PAD, h: 0.22,
    fontSize: 9, color: T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
}

// ════════════════════════════════════════════════════════════
// 9. SOURCES (NEW, with clickable links)
// ════════════════════════════════════════════════════════════
function slide_Sources(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "SOURCES");

  s.addText("מקורות המחקר", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const raw = sectionFrom(report.research, "Sources");
  const items = clean(raw).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 8);

  if (!items.length) {
    s.addText("(אין מקורות שנשמרו במחקר)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    footerLine(s, pres, "WEB RESEARCH BIBLIOGRAPHY");
    return;
  }

  const Y = 1.65, totalH = 3.45;
  const rowH = totalH / items.length;

  items.forEach((line, i) => {
    const y = Y + i * rowH;
    if (i > 0) {
      s.addShape(pres.shapes.LINE, {
        x: PAD, y, w: W - 2*PAD, h: 0,
        line: { color: T.HAIRLINE, width: 0.5 },
      });
    }

    s.addText(String(i + 1).padStart(2, "0"), {
      x: PAD, y: y + 0.05, w: 0.6, h: rowH - 0.1,
      fontSize: 14, bold: true, color: T.ORANGE_DK, fontFace: T.FONT,
      align: "left", valign: "top",
    });

    // Try to extract URL from the line
    const cleaned = line.replace(/^\d+\.?\s*/, "");
    const urlMatch = cleaned.match(/https?:\/\/[^\s,)\]"']+/);
    if (urlMatch) {
      const url = urlMatch[0];
      const desc = cleaned.replace(url, "").replace(/^[\s,()-]+|[\s,()-]+$/g, "").trim();
      // URL on left as clickable link
      s.addText(url, {
        x: PAD + 0.7, y: y + 0.05, w: 4.5, h: rowH - 0.1,
        fontSize: 9, color: T.FUCHSIA, fontFace: T.FONT,
        align: "left", valign: "top",
        hyperlink: { url, tooltip: "Open source" },
      });
      // Description right
      s.addText(safe(desc, 180), {
        x: PAD + 5.3, y: y + 0.05, w: W - 2*PAD - 5.3, h: rowH - 0.1,
        fontSize: 11, color: T.BROWN, fontFace: T.FONT,
        align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
        lineSpacingMultiple: 1.35,
      });
    } else {
      // No URL, just description
      s.addText(safe(cleaned, 250), {
        x: PAD + 0.7, y: y + 0.05, w: W - 2*PAD - 0.7, h: rowH - 0.1,
        fontSize: 11, color: T.BROWN, fontFace: T.FONT,
        align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
        lineSpacingMultiple: 1.35,
      });
    }
  });

  footerLine(s, pres, "CLICK ANY LINK TO OPEN SOURCE");
}

// ════════════════════════════════════════════════════════════
// 10. TEAM
// ════════════════════════════════════════════════════════════
function slide_Team(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE 5 AGENTS");

  s.addText("חמש עיניים. פסק דין אחד.", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.7,
    fontSize: 40, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, charSpacing: -1,
  });

  const Y = 2.1;
  const Hh = 2.7;
  const totalW = W - 2*PAD;
  const gap = 0.1;
  const Wc = (totalW - gap*4) / 5;

  report.agents.forEach((agent, i) => {
    const x = PAD + i*(Wc + gap);
    const col = aColor(agent);

    s.addShape(pres.shapes.RECTANGLE, {
      x, y: Y, w: Wc, h: Hh,
      fill: { color: T.WHITE }, line: { color: T.BROWN, width: 1 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: Y, w: Wc, h: 0.18,
      fill: { color: col }, line: { color: col, width: 0 },
    });

    const portraitSize = Math.min(Wc - 0.3, 1.4);
    const portraitX = x + (Wc - portraitSize)/2;
    const portraitY = Y + 0.35;
    const p = portraitPath(agent.id);
    if (p) {
      s.addImage({ path: p, x: portraitX, y: portraitY, w: portraitSize, h: portraitSize });
    } else {
      s.addShape(pres.shapes.OVAL, {
        x: portraitX, y: portraitY, w: portraitSize, h: portraitSize,
        fill: { color: col }, line: { color: col, width: 0 },
      });
    }

    s.addText(String(i + 1).padStart(2, "0"), {
      x: x + 0.05, y: Y + 0.22, w: Wc - 0.1, h: 0.25,
      fontSize: 10, bold: true, color: T.BROWN_LT, fontFace: T.FONT,
      align: "right", charSpacing: 2,
    });

    s.addText(agent.badge, {
      x: x + 0.1, y: Y + Hh - 0.7, w: Wc - 0.2, h: 0.22,
      fontSize: 9, bold: true, color: col, fontFace: T.FONT,
      charSpacing: 3, align: "center",
    });
    s.addText(agent.name, {
      x: x + 0.1, y: Y + Hh - 0.5, w: Wc - 0.2, h: 0.32,
      fontSize: 22, bold: true, color: T.BROWN, fontFace: T.FONT,
      align: "center", rtlMode: true, lang: "he-IL", autoFit: true, valign: "bottom",
    });
    s.addText(agent.role, {
      x: x + 0.1, y: Y + Hh - 0.22, w: Wc - 0.2, h: 0.22,
      fontSize: 11, color: T.BROWN_MID, fontFace: T.FONT,
      align: "center", rtlMode: true, lang: "he-IL", autoFit: true, valign: "bottom",
    });
  });

  footerLine(s, pres, "◆  CONDUCTED BY ZOHAR URIAN  ·  TRIPLE IMPACT FRAMEWORK");
}

// ════════════════════════════════════════════════════════════
// AGENT COVER (one per agent, dramatic intro)
// ════════════════════════════════════════════════════════════
function slide_AgentCover(pres, agent, num) {
  const s = pres.addSlide();
  const col = aColor(agent);

  // Left half: solid color block with portrait
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W * 0.42, h: H,
    fill: { color: col }, line: { color: col, width: 0 },
  });
  // Right half: cream
  s.addShape(pres.shapes.RECTANGLE, {
    x: W * 0.42, y: 0, w: W * 0.58, h: H,
    fill: { color: T.CREAM }, line: { color: T.CREAM, width: 0 },
  });

  // Portrait nearly fills left block (Nike Try edge-to-edge feel)
  const PSZ = 3.6;
  const PX = (W * 0.42 - PSZ) / 2;
  const PY = (H - PSZ) / 2;
  const p = portraitPath(agent.id);
  if (p) {
    s.addImage({ path: p, x: PX, y: PY, w: PSZ, h: PSZ });
  } else {
    s.addShape(pres.shapes.OVAL, {
      x: PX, y: PY, w: PSZ, h: PSZ,
      fill: { color: T.CREAM }, line: { color: T.CREAM, width: 0 },
    });
    s.addText(agent.emoji, {
      x: PX, y: PY, w: PSZ, h: PSZ,
      fontSize: 96, color: col, fontFace: T.FONT, align: "center", valign: "middle",
    });
  }

  // Right block content
  const rX = W * 0.42 + 0.4;
  const rW = W - rX - PAD;

  // Section number top
  s.addText(String(num).padStart(2, "0"), {
    x: rX, y: 0.4, w: rW, h: 0.3,
    fontSize: 11, bold: true, color: T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  // Badge pill
  pillBadge(s, pres, rX, 0.75, 1.6, 0.32, col);
  s.addText(agent.badge, {
    x: rX, y: 0.75, w: 1.6, h: 0.32,
    fontSize: 10, bold: true, color: T.WHITE, fontFace: T.FONT,
    charSpacing: 3, align: "center", valign: "middle",
  });

  // Agent name HUGE
  s.addText(agent.name, {
    x: rX, y: 1.3, w: rW, h: 1.3,
    fontSize: 96, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "middle", charSpacing: -2,
  });
  // Hebrew role
  s.addText(agent.role, {
    x: rX, y: 2.65, w: rW, h: 0.4,
    fontSize: 18, color: T.BROWN_MID, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  // Divider line
  s.addShape(pres.shapes.LINE, {
    x: rX, y: 3.2, w: rW, h: 0,
    line: { color: col, width: 1.5 },
  });

  // Headline quote (first KV value)
  if (agent.headlineRow) {
    s.addText("המסקנה הראשונה", {
      x: rX, y: 3.35, w: rW, h: 0.3,
      fontSize: 10, bold: true, color: col, fontFace: T.FONT,
      charSpacing: 3, align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    s.addText(safe(agent.headlineRow.val, 220), {
      x: rX, y: 3.7, w: rW, h: 1.5,
      fontSize: 14, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  }
}

// ════════════════════════════════════════════════════════════
// AGENT CONTENT (5 KV per slide, page 01 / 02)
// ════════════════════════════════════════════════════════════
function slide_AgentContent(pres, agent, num, page, rows) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  const col = aColor(agent);

  // Top colored band
  const BAND_H = 1.0;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: BAND_H,
    fill: { color: col }, line: { color: col, width: 0 },
  });

  // Small portrait left
  const PSZ = 0.7;
  const PX = PAD;
  const PY = (BAND_H - PSZ) / 2;
  const p = portraitPath(agent.id);
  if (p) {
    s.addImage({ path: p, x: PX, y: PY, w: PSZ, h: PSZ });
  } else {
    s.addShape(pres.shapes.OVAL, {
      x: PX, y: PY, w: PSZ, h: PSZ,
      fill: { color: T.CREAM }, line: { color: T.CREAM, width: 0 },
    });
    s.addText(agent.emoji, {
      x: PX, y: PY, w: PSZ, h: PSZ,
      fontSize: 28, color: col, fontFace: T.FONT, align: "center", valign: "middle",
    });
  }

  // Section number
  s.addText(String(num).padStart(2, "0"), {
    x: PAD + PSZ + 0.2, y: 0.18, w: 0.6, h: 0.22,
    fontSize: 10, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
  s.addText(`PAGE ${page}`, {
    x: PAD + PSZ + 0.85, y: 0.18, w: 1.5, h: 0.22,
    fontSize: 10, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
  s.addText(agent.badge, {
    x: PAD + PSZ + 0.2, y: 0.5, w: 4, h: 0.3,
    fontSize: 12, bold: true, color: T.WHITE, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });

  // Right side of band: name
  s.addText(agent.name, {
    x: 5.5, y: 0.18, w: 4.0, h: 0.7,
    fontSize: 32, bold: true, color: T.WHITE, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "middle",
  });
  s.addText(agent.role, {
    x: 5.5, y: 0.7, w: 4.0, h: 0.25,
    fontSize: 11, color: T.WHITE, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  if (!rows.length) {
    s.addText("(אין תוכן)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    return;
  }

  const startY = BAND_H + 0.35;
  const endY   = H - 0.35;
  const availH = endY - startY;
  const rowH   = availH / rows.length;

  rows.forEach((r, i) => {
    const y = startY + i * rowH;
    if (i > 0) {
      s.addShape(pres.shapes.LINE, {
        x: PAD, y, w: W - 2*PAD, h: 0,
        line: { color: T.HAIRLINE, width: 0.5 },
      });
    }

    if (r.key) {
      s.addText(rtl(r.key), {
        x: W - PAD - 2.4, y: y + 0.07, w: 2.4, h: rowH - 0.14,
        fontSize: 11, bold: true, color: col, fontFace: T.FONT,
        align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
        lang: "he-IL", autoFit: true,
      });
    }
    s.addText(safe(r.val, 200), {
      x: PAD, y: y + 0.07, w: W - 2*PAD - 2.55, h: rowH - 0.14,
      fontSize: 10, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.35,
      lang: "he-IL", autoFit: true,
    });
  });
}

// ════════════════════════════════════════════════════════════
// 26. THE RACE (synthesis intro with all portraits + first quotes)
// ════════════════════════════════════════════════════════════
function slide_Race(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE RACE, ALL 5 CONVERGED");

  s.addText("מה כל סוכן הוסיף", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const Y = 1.65, Hh = 3.45;
  const totalW = W - 2*PAD;
  const gap = 0.1;
  const Wc = (totalW - gap*4) / 5;

  report.agents.forEach((agent, i) => {
    const x = PAD + i*(Wc + gap);
    const col = aColor(agent);

    s.addShape(pres.shapes.RECTANGLE, {
      x, y: Y, w: Wc, h: Hh,
      fill: { color: T.WHITE }, line: { color: T.HAIRLINE, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: Y, w: Wc, h: 0.14,
      fill: { color: col }, line: { color: col, width: 0 },
    });

    // Portrait
    const PSZ = 0.85;
    const PX = x + (Wc - PSZ)/2;
    const PY = Y + 0.3;
    const p = portraitPath(agent.id);
    if (p) {
      s.addImage({ path: p, x: PX, y: PY, w: PSZ, h: PSZ });
    } else {
      s.addText(agent.emoji, {
        x: PX, y: PY, w: PSZ, h: PSZ,
        fontSize: 28, color: col, fontFace: T.FONT, align: "center", valign: "middle",
      });
    }

    s.addText(agent.name, {
      x: x + 0.05, y: Y + 1.2, w: Wc - 0.1, h: 0.32,
      fontSize: 16, bold: true, color: T.BROWN, fontFace: T.FONT,
      align: "center", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    s.addText(agent.role, {
      x: x + 0.05, y: Y + 1.5, w: Wc - 0.1, h: 0.22,
      fontSize: 9, color: T.BROWN_MID, fontFace: T.FONT,
      align: "center", rtlMode: true, lang: "he-IL", autoFit: true,
    });

    s.addShape(pres.shapes.LINE, {
      x: x + 0.15, y: Y + 1.78, w: Wc - 0.3, h: 0,
      line: { color: col, width: 0.6 },
    });

    if (agent.headlineRow) {
      s.addText(safe(agent.headlineRow.val, 200), {
        x: x + 0.12, y: Y + 1.9, w: Wc - 0.24, h: Hh - 2.05,
        fontSize: 9, color: T.BROWN, fontFace: T.FONT,
        align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
        lineSpacingMultiple: 1.4,
      });
    }
  });

  footerLine(s, pres, "PARALLEL ANALYSIS  ·  ZOHAR SYNTHESIZES");
}

// ════════════════════════════════════════════════════════════
// 27. TENSIONS
// ════════════════════════════════════════════════════════════
function slide_Tensions(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "TENSIONS, WHERE AGENTS DISAGREE");

  s.addText("מתחים בין הסוכנים", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const text = report.synth.tensions || "";
  const items = clean(text).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 3);
  const Y = 1.65, totalH = 3.45;
  const N = Math.max(items.length, 1);
  const rowH = totalH / N;

  const colors = [T.FUCHSIA, T.ORANGE_DK, T.BURGUNDY];
  if (!items.length) {
    s.addText("(לא זוהו מתחים)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    footerLine(s, pres, "DISAGREEMENT IS WHERE STRATEGY HIDES");
    return;
  }
  items.forEach((line, i) => {
    const y = Y + i*rowH;
    if (i > 0) {
      s.addShape(pres.shapes.LINE, {
        x: PAD, y, w: W - 2*PAD, h: 0,
        line: { color: T.HAIRLINE, width: 0.5 },
      });
    }
    s.addText(`0${i+1}`, {
      x: PAD, y: y + 0.1, w: 0.7, h: 0.4,
      fontSize: 20, bold: true, color: colors[i], fontFace: T.FONT,
      align: "left",
    });
    s.addText(safe(line.replace(/^מתח\s*\d+\s*:\s*/, ""), 350), {
      x: PAD + 0.85, y: y + 0.08, w: W - 2*PAD - 0.85, h: rowH - 0.16,
      fontSize: 12, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.45,
    });
  });

  footerLine(s, pres, "DISAGREEMENT IS WHERE STRATEGY HIDES");
}

// ════════════════════════════════════════════════════════════
// 28. RISK MATRIX
// ════════════════════════════════════════════════════════════
function slide_RiskMatrix(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "RISK MATRIX");

  s.addText("שלוש דרגות סיכון", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const text = report.synth.risks || "";
  const items = clean(text).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 3);
  const colors = [T.BURGUNDY, T.ORANGE_DK, T.ORANGE_LT];
  const labels = ["HIGH", "MEDIUM", "LOW"];

  if (!items.length) {
    s.addText("(לא נמצאו סיכונים)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    footerLine(s, pres, "WHAT HAPPENS IF, AND HOW LIKELY");
    return;
  }

  const Y = 1.65;
  const Hc = 1.05;
  const gap = 0.2;
  items.forEach((line, i) => {
    const y = Y + i*(Hc + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x: PAD, y, w: 0.18, h: Hc,
      fill: { color: colors[i] }, line: { color: colors[i], width: 0 },
    });
    pillBadge(s, pres, PAD + 0.32, y + 0.05, 1.0, 0.28, colors[i]);
    s.addText(labels[i], {
      x: PAD + 0.32, y: y + 0.05, w: 1.0, h: 0.28,
      fontSize: 9, bold: true, color: T.WHITE, fontFace: T.FONT,
      charSpacing: 3, align: "center", valign: "middle",
    });
    s.addText(safe(line.replace(/^סיכון.*?:\s*/, ""), 350), {
      x: PAD + 1.5, y: y + 0.05, w: W - 2*PAD - 1.5, h: Hc - 0.1,
      fontSize: 12, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  });

  footerLine(s, pres, "WHAT HAPPENS IF, AND HOW LIKELY");
}

// ════════════════════════════════════════════════════════════
// 29-31. SCENARIOS (with robust parser)
// ════════════════════════════════════════════════════════════
function parseScenarios(text) {
  const lines = clean(text || "").split("\n").map(s => s.trim()).filter(Boolean);
  const blocks = [];
  let buf = "";
  for (const l of lines) {
    // JS \b is ASCII-only and breaks on Hebrew. Use startsWith instead.
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

function slide_Scenario(pres, report, num, letter, label, scenariosText, idx) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), `SCENARIO ${letter}`);

  const colors = [T.BROWN, T.ORANGE_DK, T.FUCHSIA];
  s.addText(letter, {
    x: PAD, y: 0.85, w: 2.3, h: 2.6,
    fontSize: 240, bold: true, color: colors[idx] || T.BROWN, fontFace: T.FONT,
    align: "left", valign: "top",
  });
  s.addText(label, {
    x: PAD, y: 3.25, w: 2.3, h: 0.4,
    fontSize: 16, bold: true, color: T.BROWN_MID, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, charSpacing: 2,
  });

  const blocks = parseScenarios(scenariosText);
  const text = blocks[idx] || "(תרחיש לא נמצא)";

  s.addText(safe(text, 1200), {
    x: 3.0, y: 0.95, w: W - 3.0 - PAD, h: 4.05,
    fontSize: 13, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.5,
  });

  footerLine(s, pres, "12 MONTHS FROM TODAY");
}

// ════════════════════════════════════════════════════════════
// 32. VERDICT HERO (dark)
// ════════════════════════════════════════════════════════════
function slide_VerdictHero(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.BROWN };

  s.addText(String(num).padStart(2,"0"), {
    x: PAD, y: 0.32, w: 0.5, h: 0.3,
    fontSize: 11, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addText("THE VERDICT", {
    x: PAD + 0.55, y: 0.32, w: 5, h: 0.3,
    fontSize: 11, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addText("◆  ZOHAR URIAN", {
    x: W - PAD - 4, y: 0.32, w: 4, h: 0.3,
    fontSize: 11, bold: true, color: T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 3, align: "right",
  });
  s.addShape(pres.shapes.LINE, {
    x: PAD, y: 0.74, w: W - 2*PAD, h: 0,
    line: { color: T.BROWN_LT, width: 0.75 },
  });

  s.addText("VERDICT.", {
    x: PAD, y: 0.9, w: W - 2*PAD, h: 1.5,
    fontSize: 140, bold: true, color: T.CREAM, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });

  const v = parseKV(report.synth.verdict || "");
  const what = v.find(r => r.key.includes("מה זה")) || {};
  const cat  = v.find(r => r.key.includes("הקטגוריה")) || {};

  if (what.val) {
    s.addText(safe(what.val, 280), {
      x: PAD, y: 2.55, w: W - 2*PAD, h: 1.3,
      fontSize: 16, color: T.CREAM, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.45,
    });
  }
  if (cat.val) {
    s.addShape(pres.shapes.LINE, {
      x: PAD, y: 4.05, w: W - 2*PAD, h: 0,
      line: { color: T.BROWN_LT, width: 0.5 },
    });
    s.addText("הקטגוריה שאנחנו מנכסים", {
      x: PAD, y: 4.15, w: 4, h: 0.25,
      fontSize: 9, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
      charSpacing: 3, align: "left",
    });
    s.addText(safe(cat.val, 200), {
      x: PAD, y: 4.42, w: W - 2*PAD, h: 0.7,
      fontSize: 14, color: T.CREAM, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  }
}

// ════════════════════════════════════════════════════════════
// 33. THE MOVE
// ════════════════════════════════════════════════════════════
function slide_TheMove(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE MOVE");

  s.addText("THE", {
    x: PAD, y: 0.9, w: W - 2*PAD, h: 1.0,
    fontSize: 96, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "left", charSpacing: -3,
  });
  s.addText("PIVOT.", {
    x: PAD, y: 1.85, w: W - 2*PAD, h: 1.0,
    fontSize: 96, bold: true, color: T.FUCHSIA, fontFace: T.FONT,
    align: "left", charSpacing: -3,
  });

  const v = parseKV(report.synth.verdict || "");
  const moveRow = v.find(r => r.key.includes("הצעד") || r.key.includes("שמשנה")) || {};

  s.addText(safe(moveRow.val || "(לא נמצא צעד מומלץ)", 500), {
    x: PAD, y: 3.05, w: W - 2*PAD, h: 1.95,
    fontSize: 17, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.5,
  });

  footerLine(s, pres, "ONE ACTION THAT MOVES EVERYTHING ELSE");
}

// ════════════════════════════════════════════════════════════
// 34. THE 90-DAY TEST
// ════════════════════════════════════════════════════════════
function slide_TheTest(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE 90-DAY TEST");

  s.addText("90", {
    x: PAD, y: 0.95, w: 4, h: 3.7,
    fontSize: 320, bold: true, color: T.ORANGE_DK, fontFace: T.FONT,
    align: "left", valign: "top",
  });
  s.addText("DAYS", {
    x: 4.5, y: 1.05, w: 5.0, h: 0.5,
    fontSize: 22, bold: true, color: T.BROWN_MID, fontFace: T.FONT,
    charSpacing: 5, align: "left",
  });

  const v = parseKV(report.synth.verdict || "");
  const metricRow = v.find(r => r.key.includes("מבחן") || r.key.includes("90") || r.key.includes("המדד")) || {};

  s.addText("המבחן היחיד", {
    x: 4.5, y: 1.55, w: 5.0, h: 0.4,
    fontSize: 14, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });
  s.addText(safe(metricRow.val || "(לא הוגדר)", 350), {
    x: 4.5, y: 2.0, w: 5.0, h: 3.0,
    fontSize: 14, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.45,
  });

  footerLine(s, pres, "ONE NUMBER. EVERYTHING ELSE IS DECORATION.");
}

// ════════════════════════════════════════════════════════════
// 35. THE LOCK
// ════════════════════════════════════════════════════════════
function slide_TheLock(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM_DK };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "THE LOCK");

  s.addText("מה עוצר את זה עכשיו", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 32, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const v = parseKV(report.synth.verdict || "");
  const lockRow = v.find(r => r.key.includes("עוצר")) || {};
  const lockMain = v.find(r => r.key.includes("המנעול")) || {};

  s.addText(safe(lockRow.val || "(לא זוהה חסם)", 450), {
    x: PAD, y: 1.7, w: W - 2*PAD, h: 1.7,
    fontSize: 16, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
    lineSpacingMultiple: 1.5,
  });

  if (lockMain.val) {
    s.addShape(pres.shapes.LINE, {
      x: PAD, y: 3.65, w: W - 2*PAD, h: 0,
      line: { color: T.HAIRLINE, width: 0.5 },
    });
    s.addText("המנעול הראשי", {
      x: PAD, y: 3.8, w: W - 2*PAD, h: 0.3,
      fontSize: 11, bold: true, color: T.BURGUNDY, fontFace: T.FONT,
      charSpacing: 3, align: "left",
    });
    s.addText(safe(lockMain.val, 350), {
      x: PAD, y: 4.15, w: W - 2*PAD, h: 0.85,
      fontSize: 13, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  }

  footerLine(s, pres, "ROOT CAUSE, NOT SYMPTOM");
}

// ════════════════════════════════════════════════════════════
// 36. OPEN QUESTIONS
// ════════════════════════════════════════════════════════════
function slide_OpenQuestions(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "OPEN QUESTIONS");

  s.addText("שאלות שלא נשאלו עדיין", {
    x: PAD, y: 0.95, w: W - 2*PAD, h: 0.55,
    fontSize: 28, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
  });

  const text = report.synth.open_questions || "";
  const items = clean(text).split("\n").map(s => s.trim()).filter(Boolean).slice(0, 5);

  if (!items.length) {
    s.addText("(לא נשארו שאלות פתוחות)", {
      x: PAD, y: 2.5, w: W - 2*PAD, h: 0.4,
      fontSize: 14, color: T.BROWN_MID, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true,
    });
    footerLine(s, pres, "ANSWER ANY ONE AND THE PICTURE CHANGES");
    return;
  }

  const Y = 1.65, totalH = 3.45;
  const N = items.length;
  const rowH = totalH / N;
  items.forEach((line, i) => {
    const y = Y + i*rowH;
    if (i > 0) {
      s.addShape(pres.shapes.LINE, {
        x: PAD, y, w: W - 2*PAD, h: 0,
        line: { color: T.HAIRLINE, width: 0.5 },
      });
    }
    s.addText(`0${i+1}`, {
      x: PAD, y: y + 0.05, w: 0.7, h: rowH - 0.1,
      fontSize: 18, bold: true, color: T.FUCHSIA, fontFace: T.FONT,
      align: "left", valign: "top",
    });
    s.addText(safe(line.replace(/^שאלה\s*\d+\s*:\s*/, ""), 280), {
      x: PAD + 0.85, y: y + 0.05, w: W - 2*PAD - 0.85, h: rowH - 0.1,
      fontSize: 12, color: T.BROWN, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.45,
    });
  });

  footerLine(s, pres, "ANSWER ANY ONE AND THE PICTURE CHANGES");
}

// ════════════════════════════════════════════════════════════
// 37. NEXT MOVES
// ════════════════════════════════════════════════════════════
function slide_NextMoves(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.CREAM };
  headerEyebrow(s, pres, String(num).padStart(2,"0"), "NEXT MOVES");

  // Both headlines on one line for max card space below
  s.addText("THIS WEEK.", {
    x: PAD, y: 1.0, w: 4.6, h: 0.8,
    fontSize: 56, bold: true, color: T.BROWN, fontFace: T.FONT,
    align: "left", charSpacing: -2,
  });
  s.addText("THIS MONTH.", {
    x: 4.9, y: 1.0, w: 4.6, h: 0.8,
    fontSize: 56, bold: true, color: T.ORANGE_DK, fontFace: T.FONT,
    align: "left", charSpacing: -2,
  });

  const text = report.synth.next_moves || "";
  const lines = clean(text).split("\n").map(s => s.trim()).filter(Boolean);
  const weekRow  = lines.find(l => l.includes("ימים 1") || l.includes("השבוע")) || "";
  const monthRow = lines.find(l => l.includes("ימים 8") || l.includes("החודש")) || "";
  const milestoneRow = lines.find(l => l.includes("חודש 3") || l.includes("אבן")) || "";

  const Y = 2.05;
  const Hc = 3.0;
  const gap = 0.15;
  const Wc = (W - 2*PAD - 2*gap) / 3;
  const labels = ["DAYS 1-7", "DAYS 8-30", "MONTH 3"];
  const colors = [T.BROWN, T.ORANGE_DK, T.FUCHSIA];
  const vals = [weekRow, monthRow, milestoneRow];

  vals.forEach((line, i) => {
    const x = PAD + i*(Wc + gap);
    // FULL color fill (Nike Try energy: bold solid color blocks)
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: Y, w: Wc, h: Hc,
      fill: { color: colors[i] }, line: { color: colors[i], width: 0 },
    });
    s.addText(labels[i], {
      x: x + 0.2, y: Y + 0.18, w: Wc - 0.4, h: 0.3,
      fontSize: 11, bold: true, color: T.CREAM, fontFace: T.FONT,
      charSpacing: 4, align: "left",
    });
    s.addText(String(i + 1).padStart(2, "0"), {
      x: x + 0.2, y: Y + 0.18, w: Wc - 0.4, h: 0.3,
      fontSize: 11, bold: true, color: T.CREAM, fontFace: T.FONT,
      align: "right", charSpacing: 2,
    });
    // Hairline separator under header
    s.addShape(pres.shapes.LINE, {
      x: x + 0.2, y: Y + 0.55, w: Wc - 0.4, h: 0,
      line: { color: T.CREAM, width: 0.5, transparency: 60 },
    });
    const cleanLine = clean(line.replace(/^[^:]+:\s*/, ""));
    s.addText(safe(cleanLine, 220), {
      x: x + 0.2, y: Y + 0.7, w: Wc - 0.4, h: Hc - 0.85,
      fontSize: 11, color: T.CREAM, fontFace: T.FONT,
      align: "right", rtlMode: true, lang: "he-IL", autoFit: true, valign: "top",
      lineSpacingMultiple: 1.4,
    });
  });

  footerLine(s, pres, "THE WORK STARTS MONDAY");
}

// ════════════════════════════════════════════════════════════
// 38. ENDCAP
// ════════════════════════════════════════════════════════════
function slide_Endcap(pres, report, num) {
  const s = pres.addSlide();
  s.background = { color: T.BROWN };

  s.addText(String(num).padStart(2,"0"), {
    x: PAD, y: 0.32, w: 0.5, h: 0.3,
    fontSize: 11, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addText("END.", {
    x: PAD + 0.55, y: 0.32, w: 5, h: 0.3,
    fontSize: 11, bold: true, color: T.CREAM, fontFace: T.FONT,
    charSpacing: 4, align: "left",
  });
  s.addShape(pres.shapes.LINE, {
    x: PAD, y: 0.74, w: W - 2*PAD, h: 0,
    line: { color: T.BROWN_LT, width: 0.75 },
  });

  s.addText("VIBE", {
    x: PAD, y: 0.85, w: W - 2*PAD, h: 1.4,
    fontSize: 180, bold: true, color: T.CREAM, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });
  s.addText("&", {
    x: PAD, y: 2.35, w: W - 2*PAD, h: 0.6,
    fontSize: 80, bold: true, color: T.ORANGE_LT, fontFace: T.FONT,
    align: "left",
  });
  s.addText("VERIFY.", {
    x: PAD, y: 3.0, w: W - 2*PAD, h: 1.4,
    fontSize: 180, bold: true, color: T.FUCHSIA, fontFace: T.FONT,
    align: "left", charSpacing: -4,
  });

  const bandY = H - 0.8;
  const bandH = 0.3;
  const stripeW = (W - 2*PAD) / report.agents.length;
  report.agents.forEach((a, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: PAD + i*stripeW, y: bandY, w: stripeW, h: bandH,
      fill: { color: aColor(a) }, line: { color: aColor(a), width: 0 },
    });
  });

  s.addText(`◆  ZOHAR URIAN  ·  ${fmtDate(report.timestamp)}  ·  VIBE & VERIFY`, {
    x: PAD, y: H - 0.4, w: W - 2*PAD, h: 0.3,
    fontSize: 9, color: T.BROWN_LT, fontFace: T.FONT,
    charSpacing: 3, align: "left",
  });
}

module.exports = { buildPresentation };
