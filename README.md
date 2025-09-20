# baldrick-zest-engine

![npm](https://img.shields.io/npm/v/baldrick-zest-engine)
![Build status](https://github.com/flarebyte/baldrick-zest-engine/actions/workflows/main.yml/badge.svg)
![npm bundle size](https://img.shields.io/bundlephobia/min/baldrick-zest-engine)
![npm type definitions](https://img.shields.io/npm/types/baldrick-zest-engine)
![node-current](https://img.shields.io/node/v/baldrick-zest-engine)
![NPM](https://img.shields.io/npm/l/baldrick-zest-engine)

> Project status: Decommissioned

This project explored a YAML-based format to author unit tests quickly. While useful in places, our current practice favors classic unit tests supported by generative AI and small helper libraries. As a result, baldrick-zest-engine is decommissioned and not recommended for new work.

Highlights:

- Written in `TypeScript` (ESM).

## Why decommissioned?
- Maintenance and onboarding costs outweighed benefits of YAML indirection.
- Modern AI-assisted workflows make writing conventional tests fast and clearer.
- Existing ecosystem tools (Node test runner, Vitest/Jest) cover the needs better.

## Recommended approach
- Write classic tests (Node `--test`, Vitest, or Jest) and use generative AI to scaffold cases.
- Compose data shaping with helpers like:
  - `object-crumble` for structured object mutation/abstraction
  - `baldrick-zest-mess` for lightweight table-driven and diff helpers

Example (Node test runner):

```ts
// test/my-feature.test.ts
import { strict as assert } from 'node:assert';

const addPrefix = (p: string, v: string) => `${p}${v}`;

test('adds prefix', () => {
  assert.equal(addPrefix('pre-', 'value'), 'pre-value');
});

// Table-driven
for (const [p, v, out] of [
  ['pre-', 'a', 'pre-a'],
  ['x-', 'b', 'x-b'],
]) {
  test(`adds prefix ${p} to ${v}`, () => {
    assert.equal(addPrefix(p, v), out);
  });
}
```

## Status and support
- No new features planned; security updates only (if any).
- Consider migrating YAML specs to equivalent TypeScript tests using the example above and helpers as needed.

## Documentation and links

- Legacy docs (for reference only):
  - [Code Maintenance](MAINTENANCE.md)
  - [Code Of Conduct](CODE_OF_CONDUCT.md)
  - [Api for baldrick-zest-engine](API.md)
  - [Contributing](CONTRIBUTING.md)
  - [Glossary](GLOSSARY.md)
  - [Diagram for the code base](INTERNAL.md)
  - [Vocabulary used in the code base](CODE_VOCABULARY.md)
  - [Architectural Decision Records](DECISIONS.md)
  - [Contributors](https://github.com/flarebyte/baldrick-zest-engine/graphs/contributors)
  - [Dependencies](https://github.com/flarebyte/baldrick-zest-engine/network/dependencies)
  - [Usage](USAGE.md)

## Related

- Recommended: [baldrick-zest-mess](https://github.com/flarebyte/baldrick-zest-mess)
- Recommended: [object-crumble](https://github.com/flarebyte/object-crumble)

## Installation (legacy)

This package is ESM-only. Installation is not recommended for new projects; retained for archival testing only.

```bash
npx baldrick-zest-engine --help
```

To inspect the repository locally:

```bash
git clone https://github.com/flarebyte/baldrick-zest-engine.git
cd baldrick-zest-engine
yarn
```
