import { run } from '../src/index.mjs';

const config = {
  snapshotDir: 'spec/snapshots',
  specDir: 'spec',
  reportDir: 'report',
  mochaJsonReport: true,
  flags: '',
};

await run({
  ...config,
  specFile: 'spec/model/testing-model.zest.yaml',
});

await run({
  ...config,
  specFile: 'spec/field-validation/string-title.zest.yaml',
});
