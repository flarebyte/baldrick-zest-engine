import { basename, join } from 'node:path';
import { FullReport } from './reporter-model.js';
import { mkdirForFile } from './fs-utils.js';
import { ZestFileSuiteOpts } from './run-opts-model.js';

const getMochaReportFilename = (
  reportDir: string,
  specFile: string
): string => {
  const specFileBase = basename(specFile).replace('.zest.yaml', '');
  const reportFilename = `report-${specFileBase}.mocha.json`;
  return join(reportDir, reportFilename);
};

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
  const reportFilename = getMochaReportFilename(
    opts.runOpts.reportDir,
    opts.runOpts.specFile
  );
  const fullReport = expandReportTracker(opts);
  const content = JSON.stringify(fullReport, null, 2);
  await mkdirForFile(reportFilename);
  await opts.runOpts.inject.fs.writeStringFile(reportFilename, content);
};
