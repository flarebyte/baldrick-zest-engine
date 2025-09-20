# Repository Guidelines

## Project Structure & Module Organization
- `src/` — TypeScript sources (ESM). Entry: `src/index.mts` (named exports).
- `test/` — Node test runner specs: `*.test.ts`.
- `spec/` — Declarative Zest examples: fixtures, snapshots, transformers.
- Root configs: `tsconfig.json`, `.editorconfig`, `.prettierrc.json`, `.baldrick-zest.ts`.

## Build, Test, and Development Commands
- `yarn build` — Compile TypeScript to `dist/` with `tsc`.
- `yarn test` — Run TS tests via Node test runner (`node --test` + `ts-node/esm`).
- `yarn spec` — Run the Baldrick Zest demo/spec pipeline defined in `.baldrick-zest.ts`.
- Requirements: Node `>=18`, ESM-only (`type: module`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF-8; final newline (`.editorconfig`).
- Formatting: Prettier (`.prettierrc.json`: 80 cols, semicolons, single quotes, trailing commas es5).
- TypeScript: strict mode; prefer named exports; avoid CommonJS `require`.
- Naming: files `kebab-case.ts`; types/interfaces `PascalCase`; functions/vars `camelCase`; constants `UPPER_SNAKE_CASE`.

## Testing Guidelines
- Framework: Node built-in test runner with TypeScript via `ts-node` loader.
- Location: place tests in `test/` named `something.test.ts`.
- Scope: add tests for new features and bug fixes; keep tests deterministic.
- Zest specs: keep example data under `spec/fixtures` and snapshots in `spec/snapshots`; validate via `yarn spec`.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject; include context (e.g., refs like `(#12)`), group related changes.
- PRs: clear summary, motivation, and scope; link issues; include before/after notes for behavior changes; update docs/specs/tests; ensure `yarn build` and `yarn test` pass.
- CI/Compatibility: target Node 18+, ESM-only consumers.

## Security & Configuration Tips
- Do not commit secrets or tokens; no runtime secrets are required for build/test.
- Prefer pure functions and validated inputs; see `src/testing-model.ts` and `TECHNICAL_DESIGN.md` for architecture context.
