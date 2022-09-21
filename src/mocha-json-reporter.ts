import { FullReport } from './reporter-model.js';
import { ZestFileSuiteOpts } from './run-opts-model.js';

const expandReportTracker = (opts: ZestFileSuiteOpts): FullReport => {
  const passes = opts.reportTracker.tests.filter(
    (test) => test.err === undefined
  );
  const failures = opts.reportTracker.tests.filter(
    (test) => test.err !== undefined
  );
  const duration = opts.reportTracker.tests.reduce(
    (sum, t) => sum + t.duration,
    0
  );
  return {
    stats: {
      ...opts.reportTracker.stats,
      end: new Date().toISOString(),
      passes: passes.length,
      failures: failures.length,
      duration,
    },
    tests: [...opts.reportTracker.tests],
    passes,
    failures,
    pending: [],
  };
};

export const reportMochaJson = async (opts: ZestFileSuiteOpts) => {
  const reportFilename = opts.runOpts.inject.filename.getMochaFilename(
    opts.runOpts.specFile
  );
  const fullReport = expandReportTracker(opts);
  await opts.runOpts.inject.io.writeContent(reportFilename, fullReport, {
    parser: 'JSON',
  });
};
