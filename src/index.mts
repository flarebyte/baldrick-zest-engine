import { TestingRunOpts } from './index-model.js';
import { findZestFiles, getZestYaml } from './testing-io.js';
import { runZestFileSuite } from './testing-runner.js';

const runTest = (_opts: TestingRunOpts) => async (filename: string) => {
  const result = await getZestYaml(filename);
  if (result.status === 'invalid') {
    console.error(result);
  } else if (result.status === 'valid') {
    await runZestFileSuite(result.value);
  }
};

/**
 * Run the tests
 * @param opts options for the run
 */
export const run = async (opts: TestingRunOpts) => {
  const testFileNames = await findZestFiles(opts.specDirectory);
  console.log(testFileNames);
  await testFileNames.map(runTest(opts));
};
