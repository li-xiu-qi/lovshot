# Repository Guidelines

## Project Structure & Module Organization
- `src/`: React + TypeScript UI. Window entrypoints follow `*-main.tsx` (e.g. `selector.html` → `src/selector-main.tsx`).
- Root `*.html`: Vite multi-page entrypoints for Tauri windows (`index.html`, `selector.html`, `overlay.html`, `settings.html`, `about.html`, `scroll-overlay.html`).
- `src-tauri/`: Rust backend + Tauri config. Command handlers live in `src-tauri/src/commands/`; shared state/config lives in `src-tauri/src/`.
- `public/`: static assets bundled by Vite.
- `assets/`: screenshots/branding used by docs/README.
- Generated output: `dist/`, `node_modules/`, `src-tauri/target/` (do not commit).

## Build, Test, and Development Commands
- `pnpm install`: install JS deps (pnpm is the expected package manager; lockfile is `pnpm-lock.yaml`).
- `pnpm tauri dev`: run the desktop app with hot reload (preferred).
- `pnpm dev`: run the frontend only on `http://localhost:1420`.
- `pnpm build`: TypeScript typecheck + web build (`tsc && vite build`).
- `pnpm tauri build`: produce native bundles.
- From `src-tauri/`: `cargo fmt`, `cargo clippy`, `cargo test`.

## Coding Style & Naming Conventions
- TypeScript/React: follow existing formatting (2-space indent, double quotes, semicolons). Components use `PascalCase.tsx`; window bootstraps use `kebab-case-main.tsx`.
- IPC boundaries: Rust command names are `snake_case`; keep JSON payload fields `snake_case` to match Rust structs (e.g. `frame_count`).
- UI theming: prefer CSS variables (see `src/App.css`) to keep the “Warm Academic” palette; avoid introducing new hard-coded hex colors.
- Rust: keep backend code modular (feature-focused modules under `src-tauri/src/commands/`) and let `rustfmt` format changes.

## Testing Guidelines
- No dedicated JS test runner currently; rely on `pnpm build` for type safety and build correctness.
- For Rust logic, add unit tests where practical and run `cargo test` from `src-tauri/`.

## Commit & Pull Request Guidelines
- Use Conventional Commits (as in Git history): `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `docs: ...`, `chore: ...` with scopes like `selector`, `scroll`, `backend`.
- PRs should include: a short rationale, steps to verify (ideally `pnpm tauri dev`), and screenshots/GIFs for UI changes. Update `CHANGELOG.md` for user-facing behavior changes.

## Configuration & Tooling Notes
- Tauri config lives in `src-tauri/tauri.conf.json`; permissions/capabilities live in `src-tauri/capabilities/`.
- VS Code extension recommendations are in `.vscode/extensions.json` (Tauri + Rust Analyzer).
