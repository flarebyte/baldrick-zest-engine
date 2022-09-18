import { run } from '../src/index.mjs';
import { dirname, relative, join, basename } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const config = {
  snapshotDir: 'spec/snapshots',
  specDir: 'spec',
  reportDir: 'report',
  mochaJsonReport: true,
  flags: 'fix',
  sideEffect: {
    fs: {
      mkdirRecursive: async (path: string) =>
        await mkdir(path, { recursive: true }),
      readStringFile: async (path: string) =>
        await readFile(path, { encoding: 'utf8' }),
      writeStringFile: async (path: string, content: string) =>
        await writeFile(path, content),
    },
    path: {
      dirname,
      relative,
      join,
      basename,
    },
  },
};

await run({
  ...config,
  specFile: 'spec/model/testing-model.zest.yaml',
});

await run({
  ...config,
  specFile: 'spec/field-validation/string-title.zest.yaml',
});
