import { getZestYaml } from './testing-io.js';
import { runZestFileSuite } from './testing-runner.js';

interface TestingRunOpts {
  snapshotDir: string;
  specDir: string;
  specFile: string;
  flags: string;
}

/**
 * Run the tests
 * @param opts options for the run
 */
export const run = async (opts: TestingRunOpts) => {
  const result = await getZestYaml(opts.specFile);
  if (result.status === 'invalid') {
    console.error(result);
  } else if (result.status === 'valid') {
    await runZestFileSuite({ ...result.value, ...opts });
  }
};
