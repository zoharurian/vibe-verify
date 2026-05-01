#!/usr/bin/env node
/**
 * REBUILD.JS
 * Re-render the deck from the latest report.json without re-running agents.
 * Used for fast design iteration, no model calls.
 */
const fs   = require("fs");
const path = require("path");
const { buildPresentation } = require("./build-presentation");

async function main() {
  const reportPath = path.join(__dirname, "report.json");
  if (!fs.existsSync(reportPath)) {
    console.error("No report.json found, run `node run.js` first.");
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  console.log("▶ Rebuilding deck from cached report.json…");
  const out = await buildPresentation(report);
  console.log(`✓ ${out}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
