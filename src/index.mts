import { reportMochaJson } from './mocha-json-reporter.js';
import { ReportTracker } from './reporter-model.js';
import { getZestYaml } from './testing-io.js';
import { runZestFileSuite } from './testing-runner.js';
import type { TestingRunOpts } from './run-opts-model.js';

const createReportTracker = (): ReportTracker => ({
  stats: {
    suites: 1,
    tests: 0,
    passes: 0,
    failures: 0,
    pending: 0,
    start: new Date().toISOString(),
    end: '',
    duration: Date.now(),
  },
  tests: [],
});

/**
 * Run the tests
 * @param opts options for the run
 */
export const run = async (opts: TestingRunOpts) => {
  const result = await getZestYaml(opts.inject, opts.specFile);
  if (result.status === 'failure') {
    console.error(result);
  } else if (result.status === 'success') {
    const reportTracker = createReportTracker();
    const suiteOps = {
      reportTracker,
      runOpts: opts,
      testingModel: result.value,
    };
    await runZestFileSuite(suiteOps);
    if (opts.mochaJsonReport) {
      await reportMochaJson(suiteOps);
    }
  }
};
