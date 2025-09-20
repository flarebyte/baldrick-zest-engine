import type { TestingRunOpts } from './run-opts-model.js';

/**
 * Run the tests
 * @param opts options for the run
 */
export const run = async (_opts: TestingRunOpts) => {
  const message =
    'baldrick-zest-engine has been decommissioned. See README for rationale and migration guidance.';
  throw new Error(message);
  // Previous implementation retained below for archival reference only.
  // const result = await getZestYaml(opts.inject, opts.specFile);
  // if (result.status === 'failure') {
  //   console.error(result);
  // } else if (result.status === 'success') {
  //   const reportTracker = createReportTracker();
  //   const suiteOps = {
  //     reportTracker,
  //     runOpts: opts,
  //     testingModel: result.value,
  //   };
  //   await runZestFileSuite(suiteOps);
  //   if (opts.mochaJsonReport) {
  //     await reportMochaJson(suiteOps);
  //   }
  // }
};
