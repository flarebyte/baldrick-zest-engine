import { run } from '../src/index.mjs';

// yarn spec
await run({ sourceDirectory: 'src', specDirectory: 'spec' });
