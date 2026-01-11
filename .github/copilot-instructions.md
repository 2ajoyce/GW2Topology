# GW2Topology - Copilot instructions

This repository is a static site (HTML/CSS/vanilla JS) for an interactive Guild Wars 2 world map.

## Workflow (important)

- Prefer using `just` targets from `justfile` over ad-hoc shell commands.
  - Build/release packaging: use `just build` (creates `gw2topology_YYYY-MM-DD_N.zip`).
  - CI packaging (Linux/Bash): use `just build-ci`.
- If you need a new repeatable command (serve, lint, format, etc.), add a new `just` recipe rather than documenting a one-off command.
- When you do need a one-off command (e.g., to preview locally), keep it simple and cross-platform.

## Project constraints

- Keep it dependency-light: do not introduce bundlers or frameworks unless explicitly requested.
- Keep it compatible with static hosting (GitHub Pages style): relative paths should continue to work.
- Prefer vanilla JavaScript and existing patterns in `js/main.js` (no build step assumed).
- External libraries are currently loaded via CDN in `index.html` (Leaflet, MarkerCluster, ClipboardJS).

## Project layout

- Entry point: `index.html`
- JS: `js/main.js`
- CSS: `css/` (multiple files composed via `css/index.css`)
- Assets: `img/`

## Change hygiene

- Avoid unrelated reformatting.
- If you change UI/HTML/CSS, verify the site still loads and the map initializes.
- If you change packaging/release contents, ensure `just build` still includes required files (css/img/js/index.html/etc.).

## Validation

- Prefer: run `just build` after changes that affect shipped files.
- Manual smoke test: open `index.html` directly or serve the repo root from a static HTTP server and load the page.
