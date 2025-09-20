# Code Analysis

## Overview
Baldrick Zest Engine is an ESM TypeScript runner for declarative tests defined in YAML specs. It imports target functions, builds execution contexts, runs cases, and manages snapshots and reporting.

## Key Features
- Declarative spec loader: parses YAML into a strongly-typed `TestingModel` via Zod (`safeParseTestingModel`).
- Function execution: supports pure functions with 1–3 params (`style: 'function a' | 'function a b' | 'function a b c'`).
- Parameter sources: string literals or files with pluggable parsers; optional transformer pipeline per param.
- Transformers: composable up to 5 steps; supports simple functions and higher-order `config -> function a`.
- Tumble (table-driven): optional wrapper executes with object inputs to produce multiple results.
- Snapshots: creates or compares snapshots (JSON/YAML/Text) using `jest-diff`; writes new files when missing.
- Reporting: pretty console output (Chalk) and CI console; optional Mocha JSON report artifact.
- Extensible I/O: `ExternalInjection` abstracts read/write/import and filename resolution.

## Notable Modules
- `src/index.mts` — entry `run(opts)`; loads spec, runs suite, writes Mocha JSON.
- `testing-model.ts` — Zod schemas for specs, cases, transformers, tumble.
- `testing-runner.ts` — orchestrates suite, handles TODO/SKIP, assertions, reporting.
- `setup-execution-context.ts` — prepares params, expected snapshot, transformers, tumble.
- `case-executor.ts` — imports and invokes target functions (1–3 args) with optional tumble.
- `transformer-executor.ts` — loads and composes transformers.
- `snapshot-creator.ts` — compare/write snapshots.
- `reporter*.ts` — pretty/CI reporters and Mocha JSON expansion.

## Spec Highlights (YAML)
- Under test: `testing.style`, `testing.import`, `testing.function`.
- Cases: map of named cases; `a: 'snapshot' | 'todo'`; params `[1..3]` each from `file|string` with optional `transform`.
- Optional: `result.transform`, `snapshot` parser, `tumble` config+table.

## Limits / TODOs
- Schema defines `Class.method a` but executor currently handles only plain functions (1–3 args).
- Transformers accept `staticMethodA` in schema, but runtime path treats it like a function import.
- Tumble requires object inputs/outputs; strings are rejected.

## Run Locally
- Build: `yarn build`
- Tests: `yarn test`
- Spec demo: `yarn spec`
