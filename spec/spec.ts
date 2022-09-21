import { run } from '../src/index.mjs';
import { dirname, relative, join, basename } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const baseConfig = {
  snapshotDir: 'spec/snapshots',
  specDir: 'spec',
  reportDir: 'report',
};

const getMochaFilename = (specFile: string): string => {
  const specFileBase = basename(specFile).replace('.zest.yaml', '');
  const reportFilename = `report-${specFileBase}.mocha.json`;
  return join(baseConfig.reportDir, reportFilename);
};

const getSnapshotFilename = (
  specFile: string,
  testCaseName: string
): string => {
  const specFileBase = relative(baseConfig.specDir, specFile).replace(
    '.zest.yaml',
    ''
  );
  const snaphotFilename = `${specFileBase}--${testCaseName}.yaml`;
  return join(baseConfig.snapshotDir, snaphotFilename);
};

const writeStringFile = async (
  path: string,
  content: string
): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
};

const config = {
  ...baseConfig,
  mochaJsonReport: true,
  flags: 'fix',
  inject: {
    fs: {
      readStringFile: async (path: string) =>
        await readFile(path, { encoding: 'utf8' }),
      writeStringFile,
    },
    filename: {
      getMochaFilename,
      getSnapshotFilename,
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
