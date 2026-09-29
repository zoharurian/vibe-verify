# Vibe & Verify — Base44 Dev Environment

## Overview
Two modes:
1. **Web presentation** (`npm run dev`): Interactive slideshow served by Vite on port 3000. No API key needed.
2. **CLI tool** (`node run.js`): Multi-agent PPTX generator. Requires `ANTHROPIC_API_KEY`.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
Vite dev server on port 3000 with live reload.

## Key files
- `index.html` — Vite entry
- `src/slides.js` — Slide content data + agent definitions
- `src/main.js` — Deck controller (rendering + navigation)
- `src/style.css` — Presentation styles
- `assets/agents/` — Agent portrait PNGs
- `build-presentation.js` — PPTX builder (CLI mode)
- `run.js` — CLI orchestrator
- `agents.js` — Agent definitions and prompts

## No secrets required for web mode
The web presentation is static and needs no API keys.
