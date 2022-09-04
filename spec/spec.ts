import { run } from '../src/index.mjs';

await run({
  snapshotDir: 'spec/snapshots',
  specFile: 'spec/testing-model.zest.yaml',
  flags: '',
});
