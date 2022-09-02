import { TestingRunOpts } from './index-model.js';
import { findZestFiles, getZestYaml } from './testing-io.js';

const runTest = (_opts: TestingRunOpts) => async (filename: string) => {
  const result = await getZestYaml(filename);
  console.log(result);
};

export const run = async (opts: TestingRunOpts) => {
  const testFileNames = await findZestFiles(opts.specDirectory);
  console.log(testFileNames)
  await testFileNames.map(runTest(opts));
};
