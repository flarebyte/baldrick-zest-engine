import { run } from '../src/index.mjs';

// node --loader ts-node/esm spec/spec.ts
await run({ sourceDirectory: 'src', specDirectory: 'spec' });
