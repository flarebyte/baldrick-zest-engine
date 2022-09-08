import { run } from '../src/index.mjs';

await run({
  snapshotDir: 'spec/snapshots',
  specDir: 'spec',
  reportDir: 'report',
  mochaJsonReport: true,
  specFile: 'spec/model/testing-model.zest.yaml',
  flags: '',
});
