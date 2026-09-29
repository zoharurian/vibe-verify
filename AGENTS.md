# Vibe & Verify — Base44 Setup

## What This Is
A Node.js tool that analyzes business ideas using 5 AI agents (via Anthropic Claude API) and generates a PPTX presentation. The original entry point is `run.js` (CLI); `server.js` wraps the same flow in a web server with SSE for browser access.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d
```
Web UI is on port 3000.

## Required Secret
- `ANTHROPIC_API_KEY` — Anthropic API key. Without a valid key, the UI loads but analysis calls fail. Get one at https://console.anthropic.com/settings/keys

## Architecture
- `server.js` — HTTP server + SSE API wrapping the analysis flow
- `public/` — Web UI (HTML/CSS/JS, Hebrew RTL)
- `agents.js` — Agent definitions and prompts (shared by CLI and web)
- `run.js` — Original CLI entry point (unchanged)
- `build-presentation.js` — PPTX generation
- `assets/agents/` — Agent portrait PNGs

## Verification
1. Open the preview at port 3000
2. Enter a business idea and click "Run"
3. Watch the 5 agents analyze in parallel
4. Download the generated PPTX
